import { describe, it, expect } from "vitest";
import { DUNGEON_DROP_CHANCE, dungeonDrops, bossCrystals, WAR_MATERIAL_CHANCE } from "@/game/war-drops";
import { challengeRewards } from "@/game/endgame";

describe("dungeon drop nerf", () => {
  it("only half of dungeon wins drop an item bundle", () => {
    expect(DUNGEON_DROP_CHANCE).toBe(0.5);
    expect(dungeonDrops(() => 0.49)).toBe(true);
    expect(dungeonDrops(() => 0.5)).toBe(false);
  });
  it("materials land on about a third of dungeon wins", () => {
    expect(DUNGEON_DROP_CHANCE * WAR_MATERIAL_CHANCE).toBeCloseTo(0.35, 5);
  });
  it("boss D1 pays one frost crystal and one dragon scale only", () => {
    expect(bossCrystals(1, () => 0)).toEqual({ frostCrystal: 1, dragonScale: 1 });
  });
  it("boss gear floor is Rare, Epic from D5, Legendary from D8", () => {
    const mod = { reward: 1 } as never;
    expect(challengeRewards("ashen" as never, 1, mod).minRarity).toBe(2);
    expect(challengeRewards("ashen" as never, 5, mod).minRarity).toBe(3);
    expect(challengeRewards("ashen" as never, 8, mod).minRarity).toBe(4);
  });
});
