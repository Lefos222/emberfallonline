import { describe, expect, it } from "vitest";
import { armourArt, gearLook, heroAppearance, lookCount, lookOf, weaponArt, weaponCount, weaponLookOf } from "@/game/appearance";
import { makeItem, newHero, type HeroClass } from "@/game/data";

const CLASSES: HeroClass[] = ["warrior", "mage", "archer"];
const GENDERS: ("male" | "female")[] = ["male", "female"];

describe("armour appearance", () => {
  it("keeps both the current and the restored legacy outfits in every pool", () => {
    // Current art plus the pre-merge outfits recovered into armour/legacy.
    expect(lookCount("warrior", "male")).toBe(34);
    expect(lookCount("warrior", "female")).toBe(28);
    expect(lookCount("mage", "male")).toBe(14);
    expect(lookCount("mage", "female")).toBe(20);
    expect(lookCount("archer", "male")).toBe(20);
    expect(lookCount("archer", "female")).toBe(20);
  });

  it("resolves art for every look in the pool and nothing outside it", () => {
    for (const cls of CLASSES) {
      for (const gender of GENDERS) {
        const count = lookCount(cls, gender);
        const urls = new Set<string>();
        for (let look = 0; look < count; look += 1) {
          const art = armourArt(cls, gender, look);
          expect(art, `${cls}-${gender}-${look}`).toBeTruthy();
          urls.add(art!);
        }
        expect(urls.size).toBe(count);
        expect(armourArt(cls, gender, count)).toBeUndefined();
        expect(armourArt(cls, gender, -1)).toBeUndefined();
      }
    }
  });

  it("gives every looted chest piece a stable look inside its pool", () => {
    for (const cls of CLASSES) {
      for (const gender of GENDERS) {
        const piece = makeItem(cls, 20, 2, "armour");
        const first = lookOf(piece, gender);
        expect(first).not.toBeNull();
        expect(first!).toBeGreaterThanOrEqual(0);
        expect(first!).toBeLessThan(lookCount(cls, gender));
        expect(lookOf({ ...piece }, gender)).toBe(first);
      }
    }
  });

  it("rolls across the whole widened pool", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 400; i += 1)
      seen.add(lookOf(makeItem("warrior", 20, 2, "armour"), "male")!);
    const count = lookCount("warrior", "male");
    expect(seen.size).toBeGreaterThan(count / 2);
  });

  it("follows the worn chest piece and leaves synthesis sets alone", () => {
    const h = newHero("Look check", "warrior");
    expect(gearLook(h, "male")).toBe(lookOf(h.equipment.armour, "male"));
    const piece = makeItem("warrior", 20, 2, "armour");
    h.equipment.armour = piece;
    expect(gearLook(h, "male")).toBe(lookOf(piece, "male"));
    expect(heroAppearance(h, "male")).toEqual({ synth: null, look: lookOf(piece, "male"), weapon: weaponLookOf(h.equipment.weapon) });
  });
});

describe("weapon appearance", () => {
  it("ships the uploaded swords, staffs and bows", () => {
    expect(weaponCount("warrior")).toBe(2);
    expect(weaponCount("mage")).toBe(4);
    expect(weaponCount("archer")).toBe(4);
  });

  it("changes the weapon style when a different weapon is worn, never the armour look", () => {
    const h = newHero("Swap check", "warrior");
    const armourBefore = heroAppearance(h, "male").look;
    const styles = new Set<number>();
    for (let i = 0; i < 40; i += 1) {
      h.equipment.weapon = makeItem("warrior", 20, 2, "weapon");
      const look = heroAppearance(h, "male");
      expect(look.look).toBe(armourBefore);
      expect(look.weapon).toBe(weaponLookOf(h.equipment.weapon));
      expect(weaponArt("warrior", look.weapon!)).toBeTruthy();
      styles.add(look.weapon!);
    }
    expect(styles.size).toBe(2);
  });

  it("changes only the outfit when new armour is worn, never the weapon", () => {
    const h = newHero("Armour check", "mage");
    const weaponBefore = heroAppearance(h, "female").weapon;
    h.equipment.armour = makeItem("mage", 20, 2, "armour");
    expect(heroAppearance(h, "female").weapon).toBe(weaponBefore);
  });
});
