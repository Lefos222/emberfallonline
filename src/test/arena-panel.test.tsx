import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { newHero, type Hero } from "@/game/data";
import { ARENA_PER_WINDOW, spendArenaFight } from "@/game/arena-limits";

/**
 * The arena panel against a stubbed ladder: every hero on the server is challengeable and
 * the ladder is ranked. The live server is not needed to prove the panel reads the whole
 * realm instead of a rating bracket.
 */
const store = vi.hoisted(() => ({ hero: null as unknown as Hero }));

const heroes = vi.hoisted(() => [
  { id: "h-far", user_id: "u-far", name: "Far Hero", hero_class: "mage", gender: "female", level: 60, power: 9000, arena_rating: 3200, stats: {} },
  { id: "h-rival", user_id: "u-rival", name: "Rival One", hero_class: "archer", gender: "male", level: 22, power: 1400, arena_rating: 1500, stats: {} },
  { id: "h1", user_id: "u1", name: "Pit", hero_class: "warrior", gender: "male", level: 40, power: 3000, arena_rating: 1000, stats: {} },
]);

vi.mock("@/integrations/supabase/client", () => {
  const query = (resolved: { data: unknown; error: null }) => {
    const q: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "limit", "neq"]) q[method] = () => q;
    q["maybeSingle"] = async () => resolved;
    q["then"] = (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) => Promise.resolve(resolved).then(ok, fail);
    return q;
  };
  return {
    supabase: {
      from: (table: string) => query({ data: table === "arena_matches" ? [] : heroes, error: null }),
      rpc: async () => ({ data: 12, error: null }),
    },
  };
});

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, userId: "u1", heroId: "h1" }),
  update: (fn: (h: Hero) => void) => { fn(store.hero); },
}));

import { Arena } from "@/game/Arena";

const renderArena = (start: () => void = () => {}) => render(<Arena onClose={() => {}} start={start as never} />);

describe("the Blood Arena panel", () => {
  beforeEach(() => { store.hero = newHero("Pit", "warrior"); });

  it("lists every other hero, not just the ones close in rating", async () => {
    renderArena();
    expect(await screen.findByText("Far Hero")).toBeTruthy();
    expect(screen.getByText("Rival One")).toBeTruthy();
    expect(screen.getByText("Duels (2)")).toBeTruthy();
    // A 2,200-point gap no longer hides anyone from the pit.
    expect(screen.getAllByRole("button", { name: /Challenge/i })).toHaveLength(2);
  });

  it("ranks the whole ladder and shows where the hero stands", async () => {
    renderArena();
    fireEvent.click(await screen.findByRole("tab", { name: "Leaderboard" }));
    expect(await screen.findByText("Realm ladder · every hero in the arena")).toBeTruthy();
    expect(screen.getByText(/Rank #3 of 3/)).toBeTruthy();
    const rows = screen.getByText("Realm ladder · every hero in the arena").parentElement!;
    expect(rows.textContent).toMatch(/1\..*Far Hero.*2\..*Rival One.*3\..*Pit \(you\)/);
  });

  it("shows the five duels of the twelve-hour allowance and charges one on entry", async () => {
    const start = vi.fn();
    renderArena(start);
    expect(await screen.findByText(/5\/5 duels left/)).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: /Challenge/i })[0]);
    expect(start).toHaveBeenCalledWith(expect.objectContaining({ title: "Blood Arena", arena: true }));
  });

  it("locks the pit once the window's five duels are spent", async () => {
    const hero = newHero("Pit", "warrior");
    for (let i = 0; i < ARENA_PER_WINDOW; i++) spendArenaFight(hero);
    store.hero = hero;
    renderArena();
    expect(await screen.findByText(/No duels left — 5 every 12h/)).toBeTruthy();
    const buttons = screen.getAllByRole("button", { name: /Challenge/i });
    expect(buttons).toHaveLength(2);
    buttons.forEach((b) => expect((b as HTMLButtonElement).disabled).toBe(true));
  });

  it("no longer carries an armory tab", async () => {
    renderArena();
    await screen.findByRole("tab", { name: /Duels/ });
    expect(screen.queryByRole("tab", { name: "Armory" })).toBeNull();
  });
});
