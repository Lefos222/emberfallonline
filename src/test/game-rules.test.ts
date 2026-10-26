import { describe, expect, it } from "vitest";
import { CASTLE_BUILDINGS, canEnterConquest, heroStats, newHero, normalizeHero, powerBreakdown, type Hero } from "@/game/data";

describe("game rules", () => {
  it("level 9 cannot enter Conquest", () => expect(canEnterConquest(9)).toBe(false));
  it("level 10 can enter Conquest", () => expect(canEnterConquest(10)).toBe(true));

  it("Battle Rating breakdown sums to the total", () => {
    const h = newHero("Tester", "mage");
    h.level = 30; h.paragon = 0; h.attrs = { str: 5, int: 20, agi: 3, vit: 10 };
    const sum = powerBreakdown(h).reduce((a, p) => a + p.power, 0);
    expect(sum).toBe(heroStats(h).power);
  });

  it("Intelligence raises magic attack", () => {
    const h = newHero("Tester", "mage");
    const before = heroStats(h).matk;
    h.attrs.int = 10;
    expect(heroStats(h).matk).toBeGreaterThan(before);
  });

  it("old saves convert Bulwark to Vitality and Fortune to Agility", () => {
    const h = newHero("Old", "warrior") as Hero;
    (h as unknown as { attrs: object }).attrs = { str: 2, vit: 3, armor: 4, luck: 5 };
    normalizeHero(h);
    expect(h.attrs).toEqual({ str: 2, int: 0, agi: 5, vit: 7 });
  });
});

describe("castle layout", () => {
  it("building hotspots never overlap, so taps hit the right building", () => {
    for (let i = 0; i < CASTLE_BUILDINGS.length; i++) {
      for (let j = i + 1; j < CASTLE_BUILDINGS.length; j++) {
        const a = CASTLE_BUILDINGS[i], b = CASTLE_BUILDINGS[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        expect(dist, `${a.name} overlaps ${b.name}`).toBeGreaterThanOrEqual(a.r + b.r);
      }
    }
  });
});
