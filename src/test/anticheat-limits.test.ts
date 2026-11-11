import { describe, expect, it } from "vitest";
import {
  ENHANCE_MAX,
  MAX_LEVEL,
  RARITIES,
  heroStats,
  makeItem,
  newHero,
  type Slot,
} from "@/game/data";
import { acGoldCap, acPowerCap, AC_MAX_LEVEL } from "@/game/anticheat-limits";

const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

/** The strongest honest hero imaginable: top-rarity level-140 gear at +max on every slot. */
function godHero(level: number, paragon = 0) {
  const h = newHero("God", "warrior");
  h.level = level;
  h.paragon = paragon;
  h.attrs = { str: 420, int: 0, agi: 0, vit: 420 };
  h.equipment = {};
  for (const slot of SLOTS) {
    const it = makeItem("warrior", MAX_LEVEL, RARITIES.length - 1, slot);
    it.enh = ENHANCE_MAX;
    h.equipment[slot] = it;
  }
  return h;
}

describe("anticheat limits", () => {
  it("uses the game's real level cap", () => {
    expect(AC_MAX_LEVEL).toBe(MAX_LEVEL);
  });

  it("never flags a perfectly geared honest hero at any level", () => {
    for (const level of [0, 1, 3, 10, 50, 100, 140]) {
      expect(heroStats(godHero(level)).power).toBeLessThan(acPowerCap(level));
    }
    expect(heroStats(godHero(140, 50)).power).toBeLessThan(acPowerCap(140, 50));
  });

  it("flags 800,000 Battle Rating on a level 3 hero", () => {
    expect(800_000).toBeGreaterThan(acPowerCap(3));
  });

  it("allows 220,000 gold per save at level 3 and 5,700,000 at level 140", () => {
    expect(acGoldCap(3)).toBe(220_000);
    expect(acGoldCap(140)).toBe(5_700_000);
  });
});
