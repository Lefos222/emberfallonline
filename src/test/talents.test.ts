import { describe, expect, it } from "vitest";
import { heroSkills, heroStats, newHero } from "@/game/data";
import { TREES, freePoints, learnBlocker, rankCost, resetCost, talentSkills, totalPoints } from "@/game/talents";

describe("skill tree", () => {
  it("earns one point per level after 1 plus one per Ascension", () => {
    expect(totalPoints({ level: 3, paragon: 2 })).toBe(4);
  });
  it("grants a bonus skill point every 5 levels", () => {
    expect(totalPoints({ level: 5, paragon: 0 })).toBe(5);
    expect(totalPoints({ level: 12, paragon: 3 })).toBe(16);
    expect(totalPoints({ level: 40, paragon: 0 })).toBe(47);
  });
  it("counts quest-earned bonus skill points", () => {
    expect(totalPoints({ level: 5, paragon: 0, bonusPts: 2 })).toBe(7);
  });
  it("every skill node offers exactly four upgrades", () => {
    for (const specs of Object.values(TREES)) for (const spec of specs) for (const t of spec.talents) {
      expect(t.max).toBe(4);
      expect((t.upgradeCost ?? t.cost) >= 1).toBe(true);
    }
  });
  it("ability upgrades strengthen the ability beyond its unlock", () => {
    const h = newHero("Tester", "warrior"); h.level = 20; h.spec = "w_guard";
    h.talents = { w_g3: 1 };
    const base = heroSkills(h).find((s) => s.id === "slam")!.mult;
    h.talents = { w_g3: 4 };
    const upgraded = heroSkills(h).find((s) => s.id === "slam")!.mult;
    expect(upgraded).toBeCloseTo(base * 1.3, 2);
    expect(talentSkills(heroSkills(h), h).length).toBeGreaterThan(0);
  });
  it("unlock ranks cost more than upgrade ranks", () => {
    const f = TREES.warrior[0].talents[2];
    expect(rankCost(f, 0)).toBe(3);
    expect(rankCost(f, 1)).toBe(1);
  });
  it("tier 3 abilities can be learned without specialization or level gates", () => {
    const h = newHero("Tester", "warrior"); h.level = 20;
    h.talents = { w_g1: 4, w_g2: 4, w_b1: 2 };
    expect(learnBlocker(h, "w_g3")).toBeNull();
  });
  it("cannot spend more points than earned", () => {
    const h = newHero("Tester", "mage"); h.level = 2; h.talents = { m_f1: 1 };
    expect(freePoints(h)).toBe(0);
    expect(learnBlocker(h, "m_f1")).toMatch(/skill point/);
  });
  it("passives raise real stats and unlocked abilities join battle", () => {
    const h = newHero("Tester", "warrior"); h.level = 20;
    const before = heroStats(h).def;
    h.talents = { w_g1: 4 };
    expect(heroStats(h).def).toBeGreaterThan(before);
    h.spec = "w_guard"; h.talents = { w_g1: 4, w_g2: 4, w_b1: 2, w_g3: 1 };
    expect(heroSkills(h).some((s) => s.id === "slam")).toBe(true);
  });
  it("reset costs 100 gold per level", () => expect(resetCost({ level: 15, paragon: 0 })).toBe(1500));
});
