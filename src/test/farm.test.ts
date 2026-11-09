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
  goldSeedReward,
  harvestAll,
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
  it("tills one plot at level 1 and one more per level, up to sixteen", () => {
    expect(FARM_TOTAL_SLOTS).toBe(16);
    expect(slotsForLevel(1)).toBe(FARM_STARTING_SLOTS);
    expect(slotsForLevel(2)).toBe(FARM_STARTING_SLOTS + 1);
    expect(slotsForLevel(FARM_MAX_LEVEL)).toBe(FARM_TOTAL_SLOTS);
    expect(unlockLevelForSlot(0)).toBe(1);
    expect(unlockLevelForSlot(FARM_STARTING_SLOTS)).toBe(2);
    expect(unlockLevelForSlot(FARM_TOTAL_SLOTS - 1)).toBe(FARM_MAX_LEVEL);
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
    expect(plantSeed(h, 0, "gold", 17)).toBe("Unknown seed");
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
