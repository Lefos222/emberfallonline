import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { newHero, type Hero } from "@/game/data";

/**
 * The level bill as the player reads it: the HUD/Throne Hall ladder and the Conquest Gate's
 * blitz card. The live game sits behind a login, so these two panels are rendered against a
 * stubbed save instead.
 */
const store = vi.hoisted(() => ({ hero: null as unknown as Hero }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({}), rpc: async () => ({ data: null, error: null }) },
}));

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, userId: "u1", heroId: "h1" }),
  update: (fn: (h: Hero) => void) => {
    if (store.hero) fn(store.hero);
  },
}));

import { LevelProgress } from "@/game/LevelCurve";
import { ConquestTokens } from "@/game/ConquestGate";

describe("the level bill the player sees", () => {
  it("reads every level as the same 40 fights, from the first level to the last", () => {
    const hero = { ...newHero("Veteran", "warrior"), level: 30 };
    store.hero = hero;
    render(<LevelProgress hero={hero} rows={2} />);
    expect(screen.getByText("Level 30")).toBeTruthy();
    expect(screen.getByText("0 / 40 fights")).toBeTruthy();
    expect(screen.getAllByText(/this level costs 40 fights/).length).toBeGreaterThan(0);
    expect(screen.getByText("Level 31")).toBeTruthy();
  });

  it("shows the conquest blitz paying gold and tokens but no XP", () => {
    const hero = { ...newHero("Raider", "warrior"), level: 30, spire: 11 };
    store.hero = hero;
    render(<ConquestTokens hero={hero} />);
    expect(screen.getAllByText(/no XP/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\+0 XP/)).toBeNull();
    expect(screen.queryByText(/XP, /)).toBeNull();
  });
});
