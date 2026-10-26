import { describe, expect, it } from "vitest";
import { heroSkills, heroStats, newHero } from "@/game/data";
import { freePoints, learnBlocker, resetCost, totalPoints } from "@/game/talents";

describe("skill tree", () => {
  it("earns one point per level after 1 plus one per Ascension", () => {
    expect(totalPoints({ level: 3, paragon: 2 })).toBe(4);
  });
  it("grants a bonus skill point every 5 levels", () => {
    expect(totalPoints({ level: 5, paragon: 0 })).toBe(5);
    expect(totalPoints({ level: 12, paragon: 3 })).toBe(16);
    expect(totalPoints({ level: 40, paragon: 0 })).toBe(47);
  });
  it("tier 3 abilities need level 10 and the matching specialization", () => {
    const h = newHero("Tester", "warrior"); h.level = 20;
    h.talents = { w_g1: 5, w_g2: 3, w_b1: 2 };
    expect(learnBlocker(h, "w_g3")).toMatch(/specialization/);
    h.spec = "w_guard";
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
    h.talents = { w_g1: 5 };
    expect(heroStats(h).def).toBeGreaterThan(before);
    h.spec = "w_guard"; h.talents = { w_g1: 5, w_g2: 3, w_b1: 2, w_g3: 1 };
    expect(heroSkills(h).some((s) => s.id === "slam")).toBe(true);
  });
  it("reset costs 100 gold per level", () => expect(resetCost({ level: 15, paragon: 0 })).toBe(1500));
});
