import { describe, expect, it } from "vitest";
import { heroStats, newHero } from "@/game/data";
import { TREES, freePoints, learnBlocker, rankCost, resetCost, totalPoints } from "@/game/talents";

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
  it("every talent node grants passive stats (no active abilities)", () => {
    for (const specs of Object.values(TREES)) for (const spec of specs) for (const t of spec.talents) {
      expect(t.fx, `${t.id} should have fx`).toBeDefined();
      expect((t as { ability?: unknown }).ability).toBeUndefined();
    }
  });
  it("unlock ranks cost more than upgrade ranks", () => {
    const f = TREES.warrior[0].talents[2];
    expect(rankCost(f, 0)).toBe(3);
    expect(rankCost(f, 1)).toBe(1);
  });
  it("tier 3 talents can be learned without specialization or level gates", () => {
    const h = newHero("Tester", "warrior"); h.level = 20;
    h.talents = { w_g1: 4, w_g2: 4, w_b1: 2 };
    expect(learnBlocker(h, "w_g3")).toBeNull();
  });
  it("cannot spend more points than earned", () => {
    const h = newHero("Tester", "mage"); h.level = 2; h.talents = { m_f1: 1 };
    expect(freePoints(h)).toBe(0);
    expect(learnBlocker(h, "m_f1")).toMatch(/skill point/);
  });
  it("passives raise real stats", () => {
    const h = newHero("Tester", "warrior"); h.level = 20;
    const before = heroStats(h).def;
    h.talents = { w_g1: 4 };
    expect(heroStats(h).def).toBeGreaterThan(before);
  });
  it("reset costs 100 gold per level", () => expect(resetCost({ level: 15, paragon: 0 })).toBe(1500));
});
