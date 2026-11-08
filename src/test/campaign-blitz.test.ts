import { describe, expect, it } from "vitest";
import {
  campaignBlitz,
  campaignBlitzBlocker,
  campaignBlitzRewards,
  campaignStagesCleared,
} from "@/game/campaign-blitz";
import { BLITZ_DURATION_MS, BLITZ_XP_SHARE, blitzRunning, finishBlitzRun } from "@/game/blitz-run";
import { blitz, blitzDay, blitzesLeft, blitzesUsed, BLITZ_PER_DAY } from "@/game/conquest";
import { newHero, stageRewards, type Hero } from "@/game/data";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);

/** stage holds the frontier stage, so stage = 11 means stages 1..10 are cleared. */
const hero = (stage: number): Hero => ({ ...newHero("Blitzer", "warrior"), stage });

describe("campaign blitz", () => {
  it("counts cleared stages from the frontier stage", () => {
    expect(campaignStagesCleared(hero(11))).toBe(10);
    expect(campaignStagesCleared(hero(1))).toBe(0);
  });

  it("blitzes only up to the deepest stage already cleared", () => {
    const h = hero(11);
    expect(campaignBlitzBlocker(h, 10)).toBeNull();
    expect(campaignBlitzBlocker(h, 11)).toMatch(/stage 10/);
    expect(campaignBlitz(h, 11, NOW)).not.toBeNull();
    expect(h.stage).toBe(11);
  });

  it("refuses to blitz before a stage is cleared", () => {
    const h = hero(1);
    expect(campaignBlitzBlocker(h, 1)).toMatch(/first campaign stage/i);
    expect(campaignBlitz(h, 1, NOW)).toMatch(/first campaign stage/i);
  });

  it("sends the hero on a ten-minute run and pays it when it lands", () => {
    const h = hero(4); // stages 1..3 cleared
    const rw = campaignBlitzRewards(3);
    const total = [1, 2, 3].reduce(
      (a, s) => ({ xp: a.xp + stageRewards(s).xp, gold: a.gold + stageRewards(s).gold }),
      { xp: 0, gold: 0 },
    );
    // Version 1.00: blitzes pay only 30% of those stages' XP.
    const expected = { xp: Math.round(total.xp * BLITZ_XP_SHARE), gold: total.gold };
    expect(rw).toEqual({ stages: 3, ...expected });

    expect(campaignBlitz(h, 3, NOW)).toBeNull();
    expect(h.blitzRun).toMatchObject({ gate: "campaign", target: 3, xp: rw.xp, gold: rw.gold });
    expect(h.blitzRun?.endsAt).toBe(NOW + BLITZ_DURATION_MS);
    expect(h.gold).toBe(100); // nothing is paid while the run is out
    expect(blitzRunning(h, NOW)).toBe(true);

    expect(finishBlitzRun(h)).toMatchObject({
      gate: "campaign",
      target: 3,
      xp: rw.xp,
      gold: rw.gold,
    });
    expect(h.gold).toBe(100 + rw.gold);
    expect(h.gold).toBeGreaterThan(100);
    expect(h.blitzRun).toBeUndefined();
  });

  it("refuses a second blitz while one is running", () => {
    const h = hero(11);
    expect(campaignBlitz(h, 5, NOW)).toBeNull();
    expect(campaignBlitz(h, 5, NOW)).toMatch(/already running/i);
    expect(blitzesUsed(h, NOW)).toBe(1);
  });

  it("shares the three-a-day allowance with the Conquest Gate", () => {
    const h: Hero = { ...hero(11), spire: 11 };
    expect(blitz(h, 5, NOW)).toBeNull();
    expect(blitzesUsed(h, NOW)).toBe(1);
    finishBlitzRun(h);
    for (let i = 1; i < BLITZ_PER_DAY; i++) {
      expect(campaignBlitz(h, 10, NOW)).toBeNull();
      finishBlitzRun(h);
    }
    expect(blitzesLeft(h, NOW)).toBe(0);
    expect(campaignBlitzBlocker(h, 10, NOW)).toMatch(/both gates/);
    expect(campaignBlitz(h, 10, NOW)).toMatch(/both gates/);
  });

  it("hands the allowance back on the next Greek day", () => {
    const h = hero(11);
    for (let i = 0; i < BLITZ_PER_DAY; i++) {
      campaignBlitz(h, 1, NOW);
      finishBlitzRun(h);
    }
    const tomorrow = NOW + 86400000;
    expect(blitzesLeft(h, tomorrow)).toBe(BLITZ_PER_DAY);
    expect(campaignBlitz(h, 10, tomorrow)).toBeNull();
    expect(blitzesUsed(h, tomorrow)).toBe(1);
    expect(blitzDay(tomorrow)).not.toBe(blitzDay(NOW));
  });
});
