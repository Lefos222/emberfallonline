import { describe, expect, it } from "vitest";
import {
  BLITZ_DURATION_MS,
  BLITZ_SKIP_DIAMONDS,
  battleLockedByBlitz,
  blitzRunning,
  finishBlitzRun,
  formatBlitzLeft,
  settleBlitzRun,
  startBlitzRun,
} from "@/game/blitz-run";
import { newHero, type Hero } from "@/game/data";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const hero = (): Hero => newHero("Runner", "warrior");

describe("blitz runs", () => {
  it("takes ten minutes and costs 25 Diamonds to cut short", () => {
    expect(BLITZ_DURATION_MS).toBe(10 * 60_000);
    expect(BLITZ_SKIP_DIAMONDS).toBe(25);
  });

  it("starts a run that ends ten minutes later", () => {
    const h = hero();
    expect(startBlitzRun(h, { gate: "campaign", target: 4, xp: 100, gold: 50 }, NOW)).toBeNull();
    expect(h.blitzRun?.endsAt).toBe(NOW + BLITZ_DURATION_MS);
    expect(blitzRunning(h, NOW)).toBe(true);
    expect(blitzRunning(h, NOW + BLITZ_DURATION_MS)).toBe(false);
    expect(formatBlitzLeft(BLITZ_DURATION_MS)).toBe("10:00");
    expect(formatBlitzLeft(61_000)).toBe("1:01");
  });

  it("refuses a second run while one is still out", () => {
    const h = hero();
    startBlitzRun(h, { gate: "campaign", target: 4, xp: 100, gold: 50 }, NOW);
    expect(startBlitzRun(h, { gate: "conquest", target: 2, xp: 10, gold: 5 }, NOW)).toMatch(
      /already running/i,
    );
  });

  it("locks every battle until the run lands", () => {
    const h = hero();
    expect(battleLockedByBlitz(h, NOW)).toBeNull();
    startBlitzRun(h, { gate: "campaign", target: 4, xp: 100, gold: 50 }, NOW);
    expect(battleLockedByBlitz(h, NOW)).toMatch(/9:5\d|10:00/);
    expect(battleLockedByBlitz(h, NOW)).toMatch(/25 Diamonds/);
    expect(battleLockedByBlitz(h, NOW + BLITZ_DURATION_MS)).toBeNull();
  });

  it("pays nothing until the ten minutes are up", () => {
    const h = hero();
    const gold = h.gold;
    startBlitzRun(h, { gate: "campaign", target: 4, xp: 100, gold: 50 }, NOW);
    expect(settleBlitzRun(h, NOW + 60_000)).toBeNull();
    expect(h.gold).toBe(gold);
    expect(h.blitzRun).toBeDefined();
    const receipt = settleBlitzRun(h, NOW + BLITZ_DURATION_MS);
    expect(receipt).toMatchObject({ gate: "campaign", target: 4, xp: 100, gold: 50, tokens: 0 });
    expect(h.gold).toBe(gold + 50);
    expect(h.xp).toBe(100); // the xp paid into the bar (a level now costs far more)
    expect(h.blitzRun).toBeUndefined();
  });

  it("pays the run on the spot when it is finished early", () => {
    const h = hero();
    startBlitzRun(h, { gate: "conquest", target: 3, xp: 40, gold: 20, tokens: 12 }, NOW);
    expect(finishBlitzRun(h)?.tokens).toBe(12);
    expect(h.conquest?.tokens).toBe(12);
    expect(blitzRunning(h, NOW)).toBe(false);
  });
});
