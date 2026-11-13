import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { newHero, type Hero } from "@/game/data";
import { setLang } from "@/game/i18n";
import type { SpireState } from "@/game/spire-party";

const store = vi.hoisted(() => ({ hero: null as unknown as Hero }));
const bank = vi.hoisted(() => ({
  state: { floor: 0, best: 12, runs_left: 2, chests: 1, active: false } as SpireState,
  reward: { gold: 900, mats: { ore: 3 } } as { gold: number; mats: Record<string, number> },
  began: 0,
  opened: 0,
  burned: 0,
}));

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, heroId: "h1", gender: "male" }),
  update: (fn: (h: Hero) => void) => { fn(store.hero); },
}));

// The panel only reaches the game server; the ledger and the chest are answered here.
vi.mock("@/game/spire-party", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/game/spire-party")>();
  return {
    ...actual,
    loadSpire: async () => bank.state,
    beginSpire: async () => { bank.began += 1; return { ok: true, resumed: false, floor: 0 }; },
    endSpire: async () => {},
    reportClear: async () => true,
    openSpireChest: async () => { bank.opened += 1; return bank.reward; },
    // The card itself is burned by the server; here it only mints the extra run it answers with.
    useVulcanCard: async () => {
      bank.burned += 1;
      bank.state = { ...bank.state, runs_left: bank.state.runs_left + 1 };
      return bank.state.runs_left;
    },
  };
});

// No Realtime in the test run: the party channel stays closed and the climb runs solo.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { SpireGate } from "@/game/SpireGate";

const open = () => render(<SpireGate onClose={() => {}} />);

describe("the Spire tab", () => {
  afterEach(() => {
    setLang("en");
    bank.state = { floor: 0, best: 12, runs_left: 2, chests: 1, active: false };
    bank.opened = 0;
    bank.burned = 0;
  });

  it("shows today's runs, the best floor reached and the chests waiting", async () => {
    store.hero = newHero("Climber", "warrior");
    open();

    expect(await screen.findByRole("button", { name: "Start the climb" })).toBeTruthy();
    const body = document.body.textContent ?? "";
    // The server's best floor arrives with the ledger.
    expect(await screen.findByText("12")).toBeTruthy();
    expect(body).toContain("Open a chest");
    // The party code is the five-letter handle a friend types in, one tap away on the Party tab.
    fireEvent.click(screen.getByRole("tab", { name: "Party" }));
    expect(document.body.textContent).toMatch(/[A-Z0-9]{5}/);
  });

  it("opens a Spire Chest and says what it paid", async () => {
    store.hero = newHero("Climber", "warrior");
    open();

    fireEvent.click(await screen.findByRole("button", { name: "Open a chest" }));

    await waitFor(() => expect(bank.opened).toBe(1));
    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("900 Gold");
    expect(status.textContent).toContain("3 × Ember Ore");
    await waitFor(() => expect(screen.getByRole("button", { name: "Open a chest" })).toBeDisabled());
  });

  it("refuses a climb when today's runs are spent", async () => {
    store.hero = newHero("Climber", "warrior");
    bank.state = { floor: 0, best: 12, runs_left: 0, chests: 0, active: false };
    open();

    const start = await screen.findByRole("button", { name: "No runs left today" });
    expect(start).toBeDisabled();
    expect(bank.began).toBe(0);
  });

  it("offers the Vulcan Card only to a hero who carries one, and burns it for a run", async () => {
    store.hero = newHero("Climber", "warrior");
    const empty = open();
    await screen.findByRole("button", { name: "Start the climb" });
    // No card in the pack: there is nothing to select.
    expect(screen.queryByRole("button", { name: "Use a Vulcan Card · +1 run" })).toBeNull();
    empty.unmount();

    store.hero.vulcan = 1;
    open();

    fireEvent.click(await screen.findByRole("button", { name: "Use a Vulcan Card · +1 run" }));

    await waitFor(() => expect(bank.burned).toBe(1));
    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("one more climb today");
  });

  it("starts the climb on floor one and puts the class skills in reach", async () => {
    store.hero = newHero("Climber", "warrior");
    open();

    fireEvent.click(await screen.findByRole("button", { name: "Start the climb" }));

    await waitFor(() => expect(bank.began).toBe(1));
    await screen.findByText(/Floor 1/);
    // The hero's whole kit is in reach, not a stub of three buttons.
    for (const skill of ["Heavy Strike", "Cleave", "Bloodrage", "Shield Guard", "Taunting Blow", "Counterattack"]) {
      expect(screen.getAllByText(skill).length).toBeGreaterThan(0);
    }
    // The hero is drawn, inside the box that gives the model its size.
    const model = document.querySelector(".battle-screen [data-character-model]");
    expect(model).toBeTruthy();
    expect(model?.closest("div.h-24")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Leave" })).toBeTruthy();
  });

  it("asks for a five-letter code before joining a party", async () => {
    store.hero = newHero("Climber", "warrior");
    open();

    fireEvent.click(await screen.findByRole("tab", { name: "Party" }));
    fireEvent.change(await screen.findByLabelText("Party code to join"), { target: { value: "AB" } });
    fireEvent.click(screen.getByRole("button", { name: "Join party" }));

    expect((await screen.findByRole("alert")).textContent).toContain("A party code is five letters.");
  });

  it("speaks Greek and Polish", async () => {
    store.hero = newHero("Climber", "warrior");
    setLang("el");
    const first = open();
    expect(await screen.findByText("Πύλη του Πύργου")).toBeTruthy();
    expect((await screen.findAllByText("Κρύπτη της Στάχτης")).length).toBeGreaterThan(0);
    expect(await screen.findByRole("button", { name: "Άνοιξε ένα μπαούλο" })).toBeTruthy();
    first.unmount();

    setLang("pl");
    open();
    expect(await screen.findByText("Brama Iglicy")).toBeTruthy();
    expect((await screen.findAllByText("Krypta Żaru")).length).toBeGreaterThan(0);
    expect(await screen.findByRole("button", { name: "Otwórz skrzynię" })).toBeTruthy();
  });
});
