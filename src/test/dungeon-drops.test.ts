import { describe, it, expect } from "vitest";
import { DUNGEON_DROP_CHANCE, dungeonDrops, bossCrystals, warDropKind, WAR_MATERIAL_CHANCE, WAR_DROP_UNITS } from "@/game/war-drops";
import { challengeRewards } from "@/game/endgame";

const units = (m: Partial<Record<string, number>>) => Object.values(m).reduce<number>((a, n) => a + (n ?? 0), 0);

describe("dungeon drop nerf", () => {
  it("only half of dungeon wins drop an item bundle", () => {
    expect(DUNGEON_DROP_CHANCE).toBe(0.5);
    expect(dungeonDrops(() => 0.49)).toBe(true);
    expect(dungeonDrops(() => 0.5)).toBe(false);
  });
  it("materials land on about a third of dungeon wins", () => {
    expect(DUNGEON_DROP_CHANCE * WAR_MATERIAL_CHANCE).toBeCloseTo(0.35, 5);
    expect(warDropKind(() => 0.69)).toBe("materials");
  });
  it("a D1 boss pays one frost crystal, deeper ranks add one crystal each", () => {
    expect(bossCrystals(1, () => 0.99)).toEqual({ frostCrystal: 1 });
    expect(bossCrystals(3, () => 0.99)).toEqual({ frostCrystal: 1, dragonScale: 1 });
    expect(bossCrystals(6, () => 0.99)).toEqual({ frostCrystal: 1, dragonScale: 1, voidCrystal: 1 });
  });
  it("a boss clear never pays more than four crystal units", () => {
    expect(WAR_DROP_UNITS).toBe(4);
    for (let d = 1; d <= 10; d++) {
      for (const r of [0, 0.1, 0.5, 0.99]) expect(units(bossCrystals(d, () => r))).toBeLessThanOrEqual(WAR_DROP_UNITS);
    }
    expect(bossCrystals(10, () => 0)).toEqual({ frostCrystal: 1, dragonScale: 1, sunCrystal: 1, titanHeart: 1 });
  });
  it("a boss clear pays at most two cores", () => {
    const mod = { reward: 1 } as never;
    for (let d = 1; d <= 10; d++) expect(challengeRewards("ashen" as never, d, mod).bossCore).toBeLessThanOrEqual(2);
  });
  it("boss gear floor is Rare, Epic from D5, Legendary from D8", () => {
    const mod = { reward: 1 } as never;
    expect(challengeRewards("ashen" as never, 1, mod).minRarity).toBe(2);
    expect(challengeRewards("ashen" as never, 5, mod).minRarity).toBe(3);
    expect(challengeRewards("ashen" as never, 8, mod).minRarity).toBe(4);
  });
});
