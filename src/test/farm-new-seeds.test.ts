import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  ensureFarm,
  goldSeedReward,
  harvestSlot,
  plantSeed,
  seedDurationMs,
  seedPrice,
  xpSeedReward,
} from "@/game/farm";

const hero = () => {
  const h = newHero("Farmer", "warrior");
  h.gold = 100_000;
  ensureFarm(h);
  return h;
};

describe("Emberbloom and Moonroot seeds", () => {
  it("Emberbloom pays both gold and Farm XP", () => {
    const h = hero();
    expect(plantSeed(h, 0, "ember", 1, 0)).toBeNull();
    const gold = h.gold;
    const got = harvestSlot(h, 0, seedDurationMs("ember", 1))!;
    expect(got.gold).toBe(Math.round(goldSeedReward(1) * 0.75));
    expect(got.xp).toBe(Math.round(xpSeedReward(1) * 0.6));
    expect(h.gold).toBe(gold + got.gold);
  });
  it("Moonroot pays 2.2x an XP Seed and grows three times as long", () => {
    const h = hero();
    plantSeed(h, 0, "moon", 1, 0);
    expect(seedDurationMs("moon", 1)).toBe(seedDurationMs("xp", 1) * 3);
    expect(seedPrice("moon", 1)).toBe(seedPrice("xp", 1) * 2);
    expect(harvestSlot(h, 0, seedDurationMs("moon", 1))).toEqual({
      gold: 0,
      xp: Math.round(xpSeedReward(1) * 2.2),
      levels: 0,
    });
  });
});
