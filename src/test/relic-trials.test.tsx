import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { newHero, type Hero } from "@/game/data";
import { RELIC_SETS } from "@/game/relics";
import { RelicTrials } from "@/game/RelicTrials";
import type { StartBattle } from "@/game/panels";

const store = vi.hoisted(() => ({ hero: null as unknown, update: vi.fn() }));

vi.mock("@/game/store", () => ({
  useGame: () => ({ hero: store.hero, gender: "male" }),
  update: (fn: (h: unknown) => void) => {
    fn(store.hero);
    store.update(fn);
  },
}));

const hero = () => store.hero as Hero;

describe("relic trials panel", () => {
  beforeEach(() => {
    const h = newHero("Reliquary", "mage");
    h.level = 30;
    store.hero = h;
    store.update.mockClear();
  });

  it("locks trial ranks above the hero's level", () => {
    render(<RelicTrials onClose={() => {}} start={vi.fn() as unknown as StartBattle} />);
    expect(screen.getByText("The Starweave")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Begin Rank I/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Level 35 required/i })).toBeDisabled();
    // Every collection piece has a tile, recovered or not.
    for (const piece of RELIC_SETS.mage.pieces) {
      expect(screen.getByText(piece.name.replace("Starweave ", ""))).toBeInTheDocument();
    }
  });

  it("opens a piece's card with its stats at the hero's level", () => {
    render(<RelicTrials onClose={() => {}} start={vi.fn() as unknown as StartBattle} />);
    fireEvent.click(screen.getByTitle(/Woven from night sky/));
    expect(screen.getByText(/Woven from night sky/)).toBeInTheDocument();
    expect(screen.getByText(/Epic · helmet · iLvl 30/)).toBeInTheDocument();
  });

  it("fights the rank's warden and pays a relic on a win", async () => {
    const start = vi.fn();
    render(<RelicTrials onClose={() => {}} start={start as unknown as StartBattle} />);
    fireEvent.click(screen.getByRole("button", { name: /Begin Rank I/i }));
    expect(start).toHaveBeenCalledTimes(1);
    const opts = start.mock.calls[0]![0] as Parameters<StartBattle>[0];
    expect(opts.right.name).toContain("Tenebris, the Void Empress · Rank I");
    const bagBefore = hero().inventory.length;
    const result = await opts.onResult(true, 1);
    expect(result.lines.some((l: string) => l.startsWith("Recovered Starweave"))).toBe(true);
    expect(hero().inventory.length).toBe(bagBefore + 1);
    expect(hero().inventory.some((it) => it.name.startsWith("Starweave"))).toBe(true);
    expect(hero().relics?.clears?.["rank1"]).toBe(1);
  });
});
