import { act, fireEvent, render, within } from "@testing-library/react";
import type { Context } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { newHero, type Hero } from "@/game/data";
import { TICK_MS, type SpireMember } from "@/game/spire-party";
import type { PartyMsg } from "@/game/spire-sync";

/**
 * Three friends, one fight.
 *
 * The leader's client runs the climb and broadcasts every tick; these are the real panels, joined
 * to a stand-in party channel, so what they show is what a party member would see. The last case
 * is the one players actually hit: a broadcast that never arrives must heal itself, and one hero
 * walking out must not end everybody else's climb.
 */

type Player = { hero: Hero; heroId: string; gender: "male" | "female" };

const H = vi.hoisted(() => ({ Ctx: null as unknown as Context<Player | null> }));

vi.mock("@/game/store", async () => {
  const React = await import("react");
  const Ctx = React.createContext<Player | null>(null);
  H.Ctx = Ctx;
  return {
    useGame: () => React.useContext(Ctx),
    update: () => {},
    withServerHero: async (fn: (id: string) => Promise<unknown>) => fn("hero-a"),
    adoptServerSave: () => {},
  };
});

/** One broadcast channel per party code, wired between every panel that joined it. */
const bus = vi.hoisted(() => {
  type Emit = (p: { payload?: unknown }) => void;
  const subs: { topic: string; id: number; emit: Emit }[] = [];
  const sent: { topic: string; msg: PartyMsg }[] = [];
  let n = 0;
  const channel = (topic: string) => {
    const id = (n += 1);
    const ch = {
      on: (_type: string, _filter: unknown, cb: Emit) => {
        subs.push({ topic, id, emit: cb });
        return ch;
      },
      subscribe: (cb?: (status: string) => void) => {
        queueMicrotask(() => cb?.("SUBSCRIBED"));
        return ch;
      },
      send: (message: { payload?: unknown }) => {
        const msg = message.payload as PartyMsg;
        sent.push({ topic, msg });
        for (const s of subs) if (s.topic === topic && s.id !== id) s.emit({ payload: msg });
        return "ok";
      },
    };
    return ch;
  };
  const deliver = (topic: string, msg: PartyMsg) => {
    for (const s of subs) if (s.topic === topic) s.emit({ payload: msg });
  };
  return { channel, subs, sent, deliver };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { channel: bus.channel, removeChannel: () => {} },
}));

const ledger = { floor: 0, best: 4, runs_left: 3, chests: 0, active: false };
vi.mock("@/game/spire-party", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/game/spire-party")>();
  return {
    ...actual,
    loadSpire: async () => ({ ...ledger }),
    beginSpire: async () => ({ ok: true, resumed: false, floor: 0 }),
    endSpire: async () => {},
    reportClear: async () => true,
    openSpireChest: async () => ({ gold: 0, mats: {} }),
  };
});

import { SpireGate } from "@/game/SpireGate";

const member = (over: Partial<SpireMember>): SpireMember => ({
  id: "hero-b",
  name: "Bo",
  cls: "mage",
  gender: "female",
  level: 1,
  hp: 120,
  atk: 12,
  def: 4,
  crit: 5,
  dodge: 5,
  ...over,
});

/** Renders one hero's panel and lets the party channel settle. */
async function seat(p: Player) {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(
      <H.Ctx.Provider value={p}>
        <SpireGate onClose={() => {}} />
      </H.Ctx.Provider>,
    );
  });
  await settle(50);
  return { view, screen: within(view.container) };
}

const settle = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("the party's live fight", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    bus.sent.length = 0;
    bus.subs.length = 0;
  });

  it("draws the same fight on every hero's screen, and heals a lost broadcast", async () => {
    // 1: the leader opens the Spire and gets a party code
    const leader = await seat({
      hero: newHero("Ann", "warrior"),
      heroId: "hero-a",
      gender: "male",
    });
    const topic = bus.subs[0]?.topic ?? "";
    const code = topic.replace("spire-party-", "");
    expect(code).toMatch(/^[A-Z0-9]{5}$/);
    expect(leader.screen.getByRole("button", { name: "Start the climb" })).toBeTruthy();

    // 2: two friends join with the code
    const mate = await seat({ hero: newHero("Bo", "mage"), heroId: "hero-b", gender: "female" });
    fireEvent.click(mate.screen.getByRole("tab", { name: "Party" }));
    fireEvent.change(mate.screen.getByLabelText("Party code to join"), { target: { value: code } });
    fireEvent.click(mate.screen.getByRole("button", { name: "Join party" }));
    await settle(50);

    const scout = await seat({ hero: newHero("Cy", "archer"), heroId: "hero-c", gender: "male" });
    fireEvent.click(scout.screen.getByRole("tab", { name: "Party" }));
    fireEvent.change(scout.screen.getByLabelText("Party code to join"), {
      target: { value: code },
    });
    fireEvent.click(scout.screen.getByRole("button", { name: "Join party" }));
    await settle(50);

    // The leader's roster carries all three heroes.
    fireEvent.click(leader.screen.getByRole("tab", { name: "Party" }));
    expect(leader.screen.getByText("Bo")).toBeTruthy();
    expect(leader.screen.getByText("Cy")).toBeTruthy();

    // 3: the leader starts the climb, and every screen draws the same floor
    fireEvent.click(leader.screen.getByRole("tab", { name: "Climb" }));
    fireEvent.click(leader.screen.getByRole("button", { name: "Start the climb" }));
    await settle(TICK_MS * 2);
    expect(leader.screen.getByText(/Floor 1/)).toBeTruthy();
    expect(mate.screen.getByText(/Floor 1/)).toBeTruthy();
    expect(scout.screen.getByText(/Floor 1/)).toBeTruthy();

    // 4: a member who lost the start asks again and is handed the live fight, not a "busy" brush-off
    const before = bus.sent.length;
    bus.deliver(topic, { kind: "hello", member: member({ id: "hero-b" }) });
    await settle(10);
    const answer = bus.sent
      .slice(before)
      .map((s) => s.msg)
      .find((m): m is Extract<PartyMsg, { kind: "tick" }> => m.kind === "tick");
    expect(answer?.battle.floor).toBe(1);
    expect(mate.screen.getByText(/Floor 1/)).toBeTruthy();

    // 5: Bo casts one of their own skills — the leader runs it and the result comes back
    const skill = mate.view.container.querySelector(
      ".battle-screen button[title]",
    ) as HTMLButtonElement | null;
    expect(skill).toBeTruthy();
    const skillName = skill?.getAttribute("title") ?? "";
    const beforeCast = bus.sent.length;
    fireEvent.click(skill as HTMLButtonElement);
    await settle(TICK_MS);
    expect(
      bus.sent.slice(beforeCast).some((s) => s.msg.kind === "cast" && s.msg.hero === "hero-b"),
    ).toBe(true);
    // The button now shows the cooldown the leader's fight charged it.
    const charged = mate.view.container.querySelector(
      `.battle-screen button[title="${skillName}"]`,
    );
    expect(charged?.textContent).toMatch(/\d{1,2}/);

    // 6: Bo leaves — Cy's screen keeps fighting instead of losing the party
    fireEvent.click(mate.screen.getByRole("button", { name: "Leave" }));
    await settle(TICK_MS);
    expect(scout.screen.getByText(/Floor 1/)).toBeTruthy();
    expect(scout.screen.queryByText("The party disbanded.")).toBeNull();
    expect(leader.screen.getByText(/Floor 1/)).toBeTruthy();

    // 7: the leader leaves — now the party really is over
    fireEvent.click(leader.screen.getByRole("button", { name: "Leave" }));
    await settle(TICK_MS);
    expect(scout.screen.getByText("The party disbanded.")).toBeTruthy();
  });
});
