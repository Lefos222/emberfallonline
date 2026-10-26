import { describe, expect, it } from "vitest";
import { ANCESTRAL_RECIPES, RECIPES, craft, craftBlocker, recipeGold } from "@/game/crafting";
import { goldScale } from "@/game/gold";
import { INVENTORY_CAP, heroStats, makeAncestral, newHero, type Hero } from "@/game/data";

/** A hero that has finished the Sanctuary and can afford the ancestral vault. */
function heir(): Hero {
  const h = newHero("Heir", "warrior");
  h.level = 80;
  h.gold = 20_000_000;
  h.anc = { step: 5, relics: 5, done: true };
  h.mats = { ore: 99_999, essence: 99_999, bossCore: 99_999, fragment: 99_999, sigil: 99_999, crystal: 99_999, starshard: 99_999 };
  return h;
}

describe("ancestral forge tab", () => {
  it("offers one heirloom per slot, all at the top rarity", () => {
    expect(ANCESTRAL_RECIPES).toHaveLength(7);
    expect(new Set(ANCESTRAL_RECIPES.map((r) => r.slot)).size).toBe(7);
    for (const r of ANCESTRAL_RECIPES) {
      expect(r.ancestral).toBe(true);
      expect(r.rarity).toBe(6);
      expect(r.minLevel).toBe(60);
    }
  });

  it("costs millions of gold and a vault of materials", () => {
    for (const r of ANCESTRAL_RECIPES) {
      expect(recipeGold(r, 60)).toBeGreaterThan(2_000_000);
      expect(Object.keys(r.mats).length).toBeGreaterThanOrEqual(5);
      expect(r.mats.ore ?? 0).toBeGreaterThanOrEqual(1000);
      for (const id of ["legend", "mythic", "voidforged"]) {
        const standard = RECIPES.find((x) => x.id === id);
        if (!standard) throw new Error(id);
        expect(r.gold).toBeGreaterThan(standard.gold);
      }
    }
  });

  it("scales gold with the hero's level and leaves level 1 prices alone", () => {
    expect(goldScale(1)).toBe(1);
    expect(goldScale(41)).toBeGreaterThan(goldScale(21));
    const r = ANCESTRAL_RECIPES[0];
    expect(recipeGold(r, 1)).toBe(r.gold);
    expect(recipeGold(r, 81)).toBeGreaterThan(recipeGold(r, 41));
  });

  it("stays locked until the Sanctuary trials are done, and charges nothing when locked", () => {
    const h = heir();
    h.anc = { step: 4, relics: 5, done: false };
    const r = ANCESTRAL_RECIPES[0];
    expect(craftBlocker(h, r, INVENTORY_CAP, r.slot!)).toBe("Complete the Ancestral Sanctuary trials");
    expect(craft(h, r, INVENTORY_CAP, () => makeAncestral("warrior", 80, r.slot!), r.slot!)).toBe("Complete the Ancestral Sanctuary trials");
    expect(h.gold).toBe(20_000_000);
    expect(h.inventory).toHaveLength(0);
  });

  it("forges an ancestral piece, pays the level-scaled gold and beats standard gear", () => {
    const h = heir();
    const r = ANCESTRAL_RECIPES.find((x) => x.slot === "weapon")!;
    const before = heroStats(h).atk;
    const out = craft(h, r, INVENTORY_CAP, () => makeAncestral(h.cls, 80, r.slot!), r.slot!);
    expect(typeof out).not.toBe("string");
    expect(h.gold).toBe(20_000_000 - recipeGold(r, 80));
    expect(h.mats!.ore).toBe(99_999 - (r.mats.ore ?? 0));
    const made = h.inventory[0];
    expect(made.rarity).toBe(6);
    expect(made.anc).toBe(true);
    expect(made.crafted).toBe(true);
    h.equipment.weapon = made;
    expect(heroStats(h).atk).toBeGreaterThan(before);
  });
});
