import { describe, expect, it } from "vitest";
import { newHero, heroStats } from "@/game/data";
import { isPreResetSave, resetHero, WORLD_RESET_ID } from "@/game/world-reset";

describe("world reset", () => {
  it("starts every new class at level 0 without inherited progression", () => {
    for (const cls of ["warrior", "mage", "archer"] as const) {
      const hero = resetHero({ name: "FreshHero", cls });
      expect(hero.level).toBe(0);
      expect(hero.xp).toBe(0);
      expect(hero.gold).toBe(0);
      expect(hero.inventory).toEqual([]);
      expect(hero.resetAt).toBe(WORLD_RESET_ID);
    }
  });

  it("never treats a save as pre-reset (world reset disabled)", () => {
    expect(isPreResetSave({})).toBe(false);
    expect(isPreResetSave({ resetAt: "old-stamp" })).toBe(false);
    expect(isPreResetSave({ resetAt: WORLD_RESET_ID })).toBe(false);
  });

  it("rebuilds a hero at level 0 with no gold and no progress", () => {
    const old = newHero("Kara", "warrior");
    old.level = 87;
    old.gold = 1234567;
    old.xp = 900;
    old.paragon = 12;
    old.stage = 44;
    old.spire = 31;
    old.wins = 402;
    old.inventory = [{ id: "x", slot: "weapon", cls: "warrior", rarity: 5, ilvl: 90, icon: 2, enh: 12, name: "Old Blade" }];
    old.talents = { strike: 5 };
    old.kills = { wolf: 40 };

    const clean = resetHero(old);

    expect(clean.name).toBe("Kara");
    expect(clean.cls).toBe("warrior");
    expect(clean.level).toBe(0);
    expect(clean.gold).toBe(0);
    expect(clean.xp).toBe(0);
    expect(clean.paragon).toBe(0);
    expect(clean.stage).toBe(1);
    expect(clean.spire).toBe(1);
    expect(clean.wins).toBe(0);
    expect(clean.inventory).toEqual([]);
    expect(clean.talents).toBeUndefined();
    expect(clean.kills).toBeUndefined();
    expect(clean.resetAt).toBe(WORLD_RESET_ID);
    // The starter kit survives, so a level-0 hero can fight from the first stage.
    expect(Object.keys(clean.equipment).sort()).toEqual(["armour", "belt", "boots", "helmet", "talisman", "weapon"]);
    expect(heroStats(clean).power).toBeGreaterThan(0);
    // The old hero object is untouched.
    expect(old.level).toBe(87);
  });
});
