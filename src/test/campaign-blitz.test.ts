import { describe, expect, it } from "vitest";
import {
  campaignBlitz,
  campaignBlitzBlocker,
  campaignBlitzRewards,
  campaignStagesCleared,
} from "@/game/campaign-blitz";
import { blitz, blitzDay, blitzesLeft, blitzesUsed, BLITZ_PER_DAY } from "@/game/conquest";
import { newHero, stageRewards, type Hero } from "@/game/data";

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
    expect(campaignBlitz(h, 11)).not.toBeNull();
    expect(h.stage).toBe(11);
  });

  it("refuses to blitz before a stage is cleared", () => {
    const h = hero(1);
    expect(campaignBlitzBlocker(h, 1)).toMatch(/first campaign stage/i);
    expect(campaignBlitz(h, 1)).toMatch(/first campaign stage/i);
  });

  it("pays the stages' xp and gold when blitzing", () => {
    const h = hero(4); // stages 1..3 cleared
    const rw = campaignBlitzRewards(3);
    const expected = [1, 2, 3].reduce(
      (a, s) => ({ xp: a.xp + stageRewards(s).xp, gold: a.gold + stageRewards(s).gold }),
      { xp: 0, gold: 0 },
    );
    expect(rw).toEqual({ stages: 3, ...expected });
    expect(campaignBlitz(h, 3)).toBeNull();
    expect(h.gold).toBe(100 + rw.gold);
    expect(h.level).toBeGreaterThan(1);
  });

  it("shares the three-a-day allowance with the Conquest Gate", () => {
    const h: Hero = { ...hero(11), spire: 11 };
    const now = Date.now();
    expect(blitz(h, 5, now)).toBeNull();
    expect(blitzesUsed(h, now)).toBe(1);
    for (let i = 1; i < BLITZ_PER_DAY; i++) expect(campaignBlitz(h, 10, now)).toBeNull();
    expect(blitzesLeft(h, now)).toBe(0);
    expect(campaignBlitzBlocker(h, 10, now)).toMatch(/both gates/);
    expect(campaignBlitz(h, 10, now)).toMatch(/both gates/);
  });

  it("hands the allowance back on the next Greek day", () => {
    const h = hero(11);
    const now = Date.now();
    for (let i = 0; i < BLITZ_PER_DAY; i++) campaignBlitz(h, 1, now);
    const tomorrow = now + 86400000;
    expect(blitzesLeft(h, tomorrow)).toBe(BLITZ_PER_DAY);
    expect(campaignBlitz(h, 10, tomorrow)).toBeNull();
    expect(blitzesUsed(h, tomorrow)).toBe(1);
    expect(blitzDay(tomorrow)).not.toBe(blitzDay(now));
  });
});
