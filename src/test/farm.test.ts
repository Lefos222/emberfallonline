import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  BLOODOAK_COOLDOWN_MS,
  FARM_MAX_LEVEL,
  FARM_STARTING_SLOTS,
  FARM_TOTAL_SLOTS,
  addFarmXp,
  bloodoakRewards,
  bloodoakWaitMs,
  buySeed,
  chargeBloodoak,
  ensureFarm,
  farmLevel,
  farmXpToNext,
  FARM_MASTERY_BONUS,
  goldSeedReward,
  harvestAll,
  farmMastered,
  harvestSlot,
  heldSeeds,
  plantSeed,
  readyCount,
  seedCount,
  seedPrice,
  slotsForLevel,
  unlockLevelForSlot,
  xpSeedReward,
} from "@/game/farm";

const hero = () => {
  const h = newHero("Farmer", "warrior");
  h.gold = 1_000_000;
  ensureFarm(h);
  return h;
};

describe("the farm ladder", () => {
  it("tills one plot at level 1 and one more per level, up to twenty", () => {
    expect(FARM_TOTAL_SLOTS).toBe(20);
    expect(slotsForLevel(1)).toBe(FARM_STARTING_SLOTS);
    expect(slotsForLevel(2)).toBe(FARM_STARTING_SLOTS + 1);
    expect(slotsForLevel(FARM_MAX_LEVEL)).toBe(FARM_TOTAL_SLOTS);
    expect(unlockLevelForSlot(0)).toBe(1);
    expect(unlockLevelForSlot(FARM_STARTING_SLOTS)).toBe(2);
    expect(unlockLevelForSlot(FARM_TOTAL_SLOTS - 1)).toBe(20);
  });

  it("starts a new hero at Farm Level 1 with one open plot", () => {
    const h = hero();
    expect(farmLevel(h)).toBe(1);
    expect(h.farm?.slots).toHaveLength(FARM_TOTAL_SLOTS);
    expect(h.farm?.slots?.filter((s) => s === null)).toHaveLength(FARM_TOTAL_SLOTS);
  });
});

describe("the Bloodoak", () => {
  it("pays gold and Farm XP once every half hour", () => {
    const h = hero();
    const reward = bloodoakRewards(1);
    const got = chargeBloodoak(h, 1_000_000);
    expect(got).toEqual({ gold: reward.gold, xp: reward.xp, levels: 0 });
    expect(h.gold).toBe(1_000_000 + reward.gold);
    expect(bloodoakWaitMs(h, 1_000_000)).toBe(BLOODOAK_COOLDOWN_MS);
    expect(chargeBloodoak(h, 1_000_000 + BLOODOAK_COOLDOWN_MS - 1)).toBeNull();
    expect(chargeBloodoak(h, 1_000_000 + BLOODOAK_COOLDOWN_MS)?.gold).toBe(reward.gold);
  });

  it("scales its reward with the Farm Level", () => {
    expect(bloodoakRewards(16).gold).toBeGreaterThan(bloodoakRewards(1).gold);
    expect(bloodoakRewards(16).xp).toBeGreaterThan(bloodoakRewards(1).xp);
  });
});

describe("seeds", () => {
  it("rejects invalid quantities without charging gold or issuing seeds", () => {
    for (const qty of [0, -1, 1.5, NaN, Infinity]) {
      const h = hero();
      expect(buySeed(h, "gold", 1, qty)).not.toBeNull();
      expect(h.gold).toBe(1_000_000);
      expect(seedCount(h, "gold", 1)).toBe(0);
    }
  });

  it("rejects fractional plots and invalid tiers without spending gold", () => {
    const h = hero();
    expect(plantSeed(h, 0.5, "gold", 1)).toBe("Unknown plot");
    expect(plantSeed(h, 0, "gold", NaN)).toBe("Unknown seed");
    expect(plantSeed(h, 0, "gold", 31)).toBe("Unknown seed");
    expect(h.gold).toBe(1_000_000);
    expect(h.farm?.slots?.every((crop) => crop === null)).toBe(true);
  });

  it("uses a purchased seed without charging a second time", () => {
    const h = hero();
    buySeed(h, "gold", 1);
    expect(plantSeed(h, 0, "gold", 1, 1000)).toBeNull();
    expect(h.gold).toBe(999_800);
    expect(seedCount(h, "gold", 1)).toBe(0);
  });
  it("sells gold seeds into the pouch for the listed price", () => {
    const h = hero();
    const price = seedPrice("gold", 1);
    expect(buySeed(h, "gold", 1, 2)).toBeNull();
    expect(h.gold).toBe(1_000_000 - price * 2);
    expect(seedCount(h, "gold", 1)).toBe(2);
    expect(heldSeeds(h)).toEqual([{ kind: "gold", tier: 1, count: 2 }]);
  });

  it("refuses a seed above the farm's level", () => {
    const h = hero();
    expect(buySeed(h, "xp", 2)).toContain("Farm level 2");
    expect(plantSeed(h, 0, "xp", 2)).toContain("Farm level 2");
  });

  it("plants without a pouch seed by paying on the spot", () => {
    const h = hero();
    expect(plantSeed(h, 0, "gold", 1, 1_000)).toBeNull();
    expect(h.gold).toBe(1_000_000 - seedPrice("gold", 1));
    expect(h.farm?.slots?.[0]).toMatchObject({ kind: "gold", tier: 1, plantedAt: 1_000 });
  });

  it("refuses a locked plot", () => {
    const h = hero();
    expect(plantSeed(h, FARM_STARTING_SLOTS, "gold", 1)).toContain("Farm level 2");
  });
});

describe("harvesting", () => {
  it("keeps offline crops through save serialization and pays each crop once", () => {
    const h = hero();
    plantSeed(h, 0, "gold", 1, 1000);
    const restored = JSON.parse(JSON.stringify(h));
    expect(harvestSlot(restored, 0, 1_201_000)?.gold).toBe(260);
    expect(harvestSlot(restored, 0, 1_201_000)).toBeNull();
    expect(restored.gold).toBe(1_000_060);
  });

  it("rejects an invalid harvest time without clearing the crop", () => {
    const h = hero();
    plantSeed(h, 0, "gold", 1, 1000);
    expect(harvestSlot(h, 0, NaN)).toBeNull();
    expect(h.farm?.slots?.[0]?.readyAt).toBe(1_201_000);
    expect(h.gold).toBe(999_800);
  });
  it("pays gold only once a crop is ripe", () => {
    const h = hero();
    plantSeed(h, 0, "gold", 1, 0);
    expect(readyCount(h, 60_000)).toBe(0);
    expect(harvestSlot(h, 0, 60_000)).toBeNull();
    const crop = h.farm!.slots![0]!;
    const got = harvestSlot(h, 0, crop.readyAt);
    expect(got?.gold).toBe(goldSeedReward(1));
    expect(h.gold).toBe(1_000_000 - seedPrice("gold", 1) + goldSeedReward(1));
    expect(h.farm?.slots?.[0]).toBeNull();
  });

  it("harvests a ripe XP seed into Farm XP only", () => {
    const h = hero();
    plantSeed(h, 0, "xp", 1, 0);
    const crop = h.farm!.slots![0]!;
    const got = harvestSlot(h, 0, crop.readyAt);
    expect(got?.xp).toBe(xpSeedReward(1));
    expect(got?.gold).toBe(0);
  });

  it("pays 20% more gold and Farm XP once the farm is mastered at Level 16", () => {
    const h = hero();
    expect(farmMastered(h)).toBe(false);
    plantSeed(h, 0, "gold", 1, 0);
    const crop = h.farm!.slots![0]!;
    const base = harvestSlot(h, 0, crop.readyAt);
    expect(base?.gold).toBe(goldSeedReward(1));

    const maxed = hero();
    maxed.farm = { ...ensureFarm(maxed), level: 16, xp: 0 };
    expect(farmMastered(maxed)).toBe(true);
    plantSeed(maxed, 0, "gold", 1, 0);
    const ripe = maxed.farm!.slots![0]!;
    const boosted = harvestSlot(maxed, 0, ripe.readyAt);
    // Level 16 also carries the +10% harvest-gold perk earned at Farm Level 10.
    expect(boosted?.gold).toBe(Math.round(Math.round(goldSeedReward(1) * (1 + FARM_MASTERY_BONUS)) * 1.1));

    // The Bloodoak carries the same mastery bonus.
    const tree = chargeBloodoak(maxed, 10_000);
    expect(tree?.gold).toBe(Math.round(bloodoakRewards(16).gold * (1 + FARM_MASTERY_BONUS)));
    expect(tree?.xp).toBe(Math.round(bloodoakRewards(16).xp * (1 + FARM_MASTERY_BONUS)));
  });

  it("banks Farm XP into levels and tills a new plot each time", () => {
    const h = hero();
    const per = xpSeedReward(1);
    const need = farmXpToNext(1);
    let levels = 0;
    for (let i = 0; i < Math.ceil(need / per); i += 1) levels += addFarmXp(h, per);
    expect(levels).toBe(1);
    expect(farmLevel(h)).toBe(2);
    expect(slotsForLevel(farmLevel(h))).toBeGreaterThan(FARM_STARTING_SLOTS);
  });

  it("harvests every ripe plot at once and skips growing ones", () => {
    const h = hero();
    h.farm!.level = 3;
    plantSeed(h, 0, "gold", 1, 0);
    plantSeed(h, 1, "gold", 1, 0);
    plantSeed(h, 2, "gold", 1, 0);
    const first = h.farm!.slots![0]!;
    h.farm!.slots![2] = { ...h.farm!.slots![2]!, readyAt: first.readyAt + 600_000 };
    const total = harvestAll(h, first.readyAt);
    expect(total.crops).toBe(2);
    expect(total.gold).toBe(goldSeedReward(1) * 2);
    expect(h.farm?.slots?.[0]).toBeNull();
    expect(h.farm?.slots?.[2]).not.toBeNull();
  });
});

import { FARM_PERKS, FEASTS, cookFeast, farmGrowthMult, feastFx, rollRareHarvest, SEED_UNLOCK } from "@/game/farm";
describe("farm expansion", () => {
  it("opens special seeds only at their Farm Level", () => {
    const h = hero();
    h.gold = 1e9;
    expect(SEED_UNLOCK.frost).toBe(6);
    expect(buySeed(h, "frost", 1, 1)).toBe("Farm level 6 needed");
    h.farm = { ...ensureFarm(h), level: 6 };
    expect(buySeed(h, "frost", 1, 1)).toBeNull();
  });
  it("speeds growth with perks", () => {
    expect(farmGrowthMult(1)).toBe(1);
    expect(farmGrowthMult(30)).toBeCloseTo(0.8);
    expect(FARM_PERKS.length).toBeGreaterThan(10);
  });
  it("rolls rare materials only once the perk is earned", () => {
    expect(rollRareHarvest("frost", 1, 5, () => 0)).toBeNull();
    expect(rollRareHarvest("frost", 1, 6, () => 0)).toEqual({ frostCrystal: 1 });
  });
  it("cooks a feast from produce into a timed battle bonus", () => {
    const h = hero();
    h.farm = { ...ensureFarm(h), level: 5, produce: { gold: 3, xp: 2 } };
    expect(cookFeast(h, "stew", 0)).toBeNull();
    expect(h.farm!.produce!.gold).toBe(0);
    expect(feastFx(h, 1000)).toEqual({ atkPct: 10, matkPct: 10 });
    expect(feastFx(h, FEASTS[0]!.minutes * 60_000 + 1)).toEqual({});
    expect(cookFeast(h, "stew", 0)).toBe("Not enough Gold produce");
  });
});
