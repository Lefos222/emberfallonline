import { describe, expect, it } from "vitest";
import { DRILLS, drillBlocker, drillCost, drillFx, drillRank, trainDrill } from "@/game/drills";
import { goldScale } from "@/game/gold";
import { heroStats, newHero, type Hero } from "@/game/data";

const recruit = (gold = 50_000): Hero => {
  const h = newHero("Recruit", "warrior");
  h.gold = gold;
  return h;
};

describe("barracks drills", () => {
  it("offers more than the four attributes, each unlocked by a barracks level", () => {
    expect(DRILLS.length).toBeGreaterThan(4);
    expect(new Set(DRILLS.map((d) => d.id)).size).toBe(DRILLS.length);
    for (const d of DRILLS) expect(d.max).toBeGreaterThan(0);
    expect(DRILLS.some((d) => d.barracks > 1)).toBe(true);
  });

  it("keeps deep drills locked until the barracks itself is upgraded", () => {
    const h = recruit(1_000_000);
    const first = DRILLS.find((d) => d.barracks === 1)!;
    expect(drillBlocker(h, first.id)).toBeNull();
    const deep = DRILLS.find((d) => d.barracks === Math.max(...DRILLS.map((x) => x.barracks)))!;
    expect(drillBlocker(h, deep.id)).toBe(`Requires barracks level ${deep.barracks}`);
    expect(trainDrill(h, deep.id)).toMatch(/barracks level/);
    h.buildings = { barracks: deep.barracks };
    expect(trainDrill(h, deep.id)).toBeNull();
  });

  it("charges gold per rank, rising with the rank and the hero's level", () => {
    expect(drillCost(DRILLS[0], 0, 1)).toBe(DRILLS[0].base);
    expect(drillCost(DRILLS[0], 1, 1)).toBeGreaterThan(drillCost(DRILLS[0], 0, 1));
    expect(drillCost(DRILLS[0], 0, 51)).toBe(Math.round(DRILLS[0].base * goldScale(51)));
    const h = recruit(5_000);
    const cost = drillCost(DRILLS[0], 0, h.level);
    expect(trainDrill(h, DRILLS[0].id)).toBeNull();
    expect(h.gold).toBe(5_000 - cost);
    expect(drillRank(h, DRILLS[0].id)).toBe(1);
  });

  it("refuses a rank the hero cannot pay for or has maxed", () => {
    const poor = recruit(1);
    expect(drillBlocker(poor, DRILLS[0].id)).toBe("Not enough gold");
    expect(trainDrill(poor, DRILLS[0].id)).toBe("Not enough gold");
    expect(poor.gold).toBe(1);
    const maxed: Hero = recruit(1_000_000);
    maxed.drills = { [DRILLS[0].id]: DRILLS[0].max };
    expect(drillBlocker(maxed, DRILLS[0].id)).toBe("Fully drilled");
  });

  it("feeds the drilled ranks into the hero's real stats", () => {
    const h = recruit(1_000_000);
    const before = heroStats(h);
    const weapons = DRILLS.find((d) => d.id === "weapons")!;
    expect(trainDrill(h, weapons.id)).toBeNull();
    trainDrill(h, weapons.id);
    expect(drillFx(h).atkPct).toBe(weapons.per * 2);
    expect(heroStats(h).atk).toBeGreaterThan(before.atk);

    const endurance = DRILLS.find((d) => d.id === "endurance")!;
    h.buildings = { barracks: endurance.barracks };
    const hpBefore = heroStats(h).hp;
    expect(trainDrill(h, endurance.id)).toBeNull();
    expect(heroStats(h).hp).toBeGreaterThan(hpBefore);
  });
});
