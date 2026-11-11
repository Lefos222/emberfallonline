import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setLang } from "@/game/i18n";
import { newHero, type Hero } from "@/game/data";

const store = vi.hoisted(() => ({ hero: null as unknown as Hero }));
const inbox = vi.hoisted(() => ({ push: null as null | ((invite: unknown) => void), closed: 0 }));

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, heroId: "h1", gender: "male" }),
  update: (fn: (h: Hero) => void) => {
    fn(store.hero);
  },
}));

// The call arrives over Realtime in the game; here the test hands it to the card directly.
vi.mock("@/game/party-invite", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/game/party-invite")>();
  return {
    ...actual,
    openInviteInbox: (_heroId: string, onInvite: (invite: unknown) => void) => {
      inbox.push = onInvite;
      return () => {
        inbox.closed += 1;
      };
    },
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { PartyInvites } from "@/game/PartyInvites";
import { SpireGate } from "@/game/SpireGate";
import { INVITE_MS, type PartyInvite } from "@/game/party-invite";

const call = (over: Partial<PartyInvite> = {}): PartyInvite => ({
  id: "inv-1",
  kind: "spire",
  code: "KLMNP",
  dungeon: "cinder",
  from: { id: "h2", name: "Bo", cls: "mage", gender: "female", level: 9 },
  expires: Date.now() + INVITE_MS,
  ...over,
});

const arrive = (invite: PartyInvite) => act(() => inbox.push!(invite));

describe("a friend's party invitation", () => {
  afterEach(() => {
    setLang("en");
    inbox.push = null;
  });

  it("shows who is calling and lets the hero reject it", () => {
    store.hero = newHero("Ann", "warrior");
    const accept = vi.fn();
    render(<PartyInvites onAccept={accept} />);

    arrive(call());
    expect(screen.getByText(/Bo invites you to/)).toBeTruthy();
    expect(screen.getByText(/Cinder Crypt/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(accept).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Party invite" })).toBeNull();
  });

  it("joins the room the card points at", () => {
    store.hero = newHero("Ann", "warrior");
    const accept = vi.fn();
    render(<PartyInvites onAccept={accept} />);

    arrive(call({ kind: "arena", code: "ABCD23" }));
    expect(screen.getByText(/Arena Clash/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(accept).toHaveBeenCalledTimes(1);
    expect(accept.mock.calls[0]![0]).toMatchObject({ kind: "arena", code: "ABCD23" });
  });

  it("drops a card nobody answered", () => {
    store.hero = newHero("Ann", "warrior");
    render(<PartyInvites onAccept={() => {}} />);

    arrive(call({ expires: Date.now() - 1 }));
    expect(screen.queryByRole("dialog", { name: "Party invite" })).toBeNull();
  });
});

describe("a party joined from an invitation", () => {
  it("opens the Spire as a guest waiting for its leader", async () => {
    store.hero = newHero("Ann", "warrior");
    render(<SpireGate onClose={() => {}} invite={{ code: "KLMNP", from: "Bo" }} />);

    expect(await screen.findByText("Joining Bo's party…")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start the climb" })).toBeNull();
    expect(screen.getByText("Waiting for the party leader…")).toBeTruthy();
  });
});
