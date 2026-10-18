import { describe, expect, it } from "vitest";
import { canEnterConquest, heroStats, newHero, normalizeHero, powerBreakdown, type Hero } from "@/game/data";

describe("game rules", () => {
  it("level 19 cannot enter Conquest", () => expect(canEnterConquest(19)).toBe(false));
  it("level 20 can enter Conquest", () => expect(canEnterConquest(20)).toBe(true));

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
