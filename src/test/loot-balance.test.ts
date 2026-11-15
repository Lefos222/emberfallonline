import { describe, expect, it } from "vitest";
import { BONUS_GEAR_CHANCE, keepFinds, MAX_BONUS_FINDS, rollBonusGearRarity } from "@/game/battle-finds";
import { rollRarity } from "@/game/data";
import { WAR_MATERIAL_CHANCE } from "@/game/war-drops";
import { BATTLE_CHEST_ODDS } from "@/game/chests";
import { SOUL_SHARD_CHANCE } from "@/game/enlightenment";
import { XP_SCROLL_DROP } from "@/game/xp-scrolls";
import { rollStoneDrop } from "@/game/enchant";
import { ownStash } from "@/game/GuildStorage";

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };

describe("grey, green and blue gear drops more often", () => {
  it("rolls about 12% blue and 30% green before luck", () => {
    // r = rand*100 with no luck: under 15 is blue, under 45 green; 0.99 skips the lucky bump.
    expect(rollRarity(1, 0, 0, 80, seq(0.14, 0.99))).toBe(2);
    expect(rollRarity(1, 0, 0, 80, seq(0.44, 0.99))).toBe(1);
    expect(rollRarity(1, 0, 0, 80, seq(0.46, 0.99))).toBe(0);
  });
  it("a lucky bump lifts grey to green and green to blue, never past blue", () => {
    expect(rollRarity(1, 0, 0, 80, seq(0.9, 0.01))).toBe(1);
    expect(rollRarity(1, 0, 0, 80, seq(0.3, 0.01))).toBe(2);
    expect(rollRarity(1, 0, 0, 80, seq(0.1, 0.01))).toBe(2);
  });
  it("gate wins drop gear half the time instead of 30%", () => {
    expect(WAR_MATERIAL_CHANCE).toBe(0.5);
  });
  it("any won fight has a 25% chance of a bonus grey/green/blue piece", () => {
    expect(BONUS_GEAR_CHANCE).toBe(0.25);
    expect(rollBonusGearRarity(seq(0.3))).toBeNull();
    expect(rollBonusGearRarity(seq(0.1, 0.1))).toBe(0);
    expect(rollBonusGearRarity(seq(0.1, 0.6))).toBe(1);
    expect(rollBonusGearRarity(seq(0.1, 0.95))).toBe(2);
  });
});

describe("won battles give less stuff", () => {
  it("keeps at most two bonus finds per win", () => {
    expect(MAX_BONUS_FINDS).toBe(2);
    expect(keepFinds([1, 2, 3, 4, 5])).toHaveLength(2);
    expect(keepFinds([1])).toEqual([1]);
  });
  it("rolls the extras on lower odds", () => {
    expect(BATTLE_CHEST_ODDS).toEqual({ gold: 0.07, gem: 0.04 });
    expect(SOUL_SHARD_CHANCE).toBe(0.1);
    expect(XP_SCROLL_DROP).toBe(0.04);
    expect(rollStoneDrop(20, false, false, () => 0.2)).toBeNull();
    expect(rollStoneDrop(20, true, false, () => 0.7)).toBeNull();
  });
});

describe("the guild vault is personal", () => {
  it("shows only what the player's own characters stored", () => {
    const rows = [
      { id: "a", deposited_by: "mine-1" },
      { id: "b", deposited_by: "someone-else" },
      { id: "c", deposited_by: "mine-2" },
    ];
    expect(ownStash(rows, ["mine-1", "mine-2"]).map((r) => r.id)).toEqual(["a", "c"]);
    expect(ownStash(rows, [])).toEqual([]);
  });
});
