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
  it("reads a mid-game level as dozens of fights, never a multi-million bill", () => {
    const hero = { ...newHero("Veteran", "warrior"), level: 30 };
    store.hero = hero;
    render(<LevelProgress hero={hero} rows={2} />);
    expect(screen.getByText(/this level costs 46 fights/)).toBeTruthy();
    // 30→31 costs 46 fights at 3,615 XP each, so the whole level is 166.3K XP — not 2.8 million.
    expect(screen.getByText("166.3K XP")).toBeTruthy();
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
