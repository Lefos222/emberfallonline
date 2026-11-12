import { describe, expect, it } from "vitest";
import {
  BLITZ_MAX_MS,
  BLITZ_MIN_MS,
  BLITZ_SKIP_DIAMONDS,
  battleLockedByBlitz,
  blitzDurationMs,
  blitzRunning,
  finishBlitzRun,
  formatBlitzLeft,
  settleBlitzRun,
  startBlitzRun,
} from "@/game/blitz-run";
import { newHero, type Hero } from "@/game/data";
import { XP_GAIN_SHARE } from "@/game/logic";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const hero = (): Hero => newHero("Runner", "warrior");
const MINUTE = 60_000;

describe("blitz runs", () => {
  it("runs for 20 minutes on a shallow climb and up to 50 on a deep one", () => {
    expect(BLITZ_MIN_MS).toBe(20 * MINUTE);
    expect(BLITZ_MAX_MS).toBe(50 * MINUTE);
    expect(blitzDurationMs(1)).toBe(20 * MINUTE);
    expect(blitzDurationMs(100)).toBe(50 * MINUTE);
    expect(blitzDurationMs(250)).toBe(50 * MINUTE); // never longer than the cap
    const shallow = blitzDurationMs(10);
    const deep = blitzDurationMs(60);
    expect(shallow).toBeGreaterThan(BLITZ_MIN_MS);
    expect(deep).toBeGreaterThan(shallow);
    expect(deep).toBeLessThan(BLITZ_MAX_MS);
    expect(BLITZ_SKIP_DIAMONDS).toBe(25);
  });

  it("starts a run whose length depends on its depth", () => {
    const h = hero();
    expect(startBlitzRun(h, { gate: "campaign", target: 1, xp: 100, gold: 50 }, NOW)).toBeNull();
    expect(h.blitzRun?.endsAt).toBe(NOW + blitzDurationMs(1));
    expect(blitzRunning(h, NOW)).toBe(true);
    expect(blitzRunning(h, NOW + blitzDurationMs(1))).toBe(false);
    expect(formatBlitzLeft(blitzDurationMs(1))).toBe("20:00");
    expect(formatBlitzLeft(61_000)).toBe("1:01");

    const deep = hero();
    startBlitzRun(deep, { gate: "conquest", target: 90, xp: 0, gold: 50, tokens: 5 }, NOW);
    expect(deep.blitzRun!.endsAt - NOW).toBeGreaterThan(BLITZ_MIN_MS);
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
    startBlitzRun(h, { gate: "campaign", target: 1, xp: 100, gold: 50 }, NOW);
    expect(battleLockedByBlitz(h, NOW)).toMatch(/19:5\d|20:00/);
    expect(battleLockedByBlitz(h, NOW)).toMatch(/25 Diamonds/);
    expect(battleLockedByBlitz(h, NOW + blitzDurationMs(1))).toBeNull();
  });

  it("pays nothing until the clock is up", () => {
    const h = hero();
    const gold = h.gold;
    const run = blitzDurationMs(1);
    startBlitzRun(h, { gate: "campaign", target: 1, xp: 100, gold: 50 }, NOW);
    expect(settleBlitzRun(h, NOW + 60_000)).toBeNull();
    expect(h.gold).toBe(gold);
    expect(h.blitzRun).toBeDefined();
    const receipt = settleBlitzRun(h, NOW + run);
    expect(receipt).toMatchObject({ gate: "campaign", target: 1, xp: 100, gold: 50, tokens: 0 });
    expect(h.gold).toBe(gold + 50);
    // The xp paid into the bar (a level now costs far more), after the global 4% cut in grant().
    expect(h.xp).toBe(Math.round(100 * XP_GAIN_SHARE));
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
