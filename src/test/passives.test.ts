import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { PASSIVES, insightFrom, learnPassive, mergePassiveFx, passiveBlocker, passiveFx, passiveRank, totalInsight } from "@/game/passives";

describe("passive tree", () => {
  it("Field Medicine grants exactly 2 Healing Power per rank", () => {
    expect(PASSIVES.find(p => p.id === "field_medicine")?.fx).toEqual({ heal: 2 });
  });
  it("two Field Medicine ranks grant 4 Healing Power", () => {
    const h = newHero("Tester", "mage"); h.passives = { field_medicine: 2 };
    expect(passiveFx(h).heal).toBe(4);
  });
  it("a victorious boss stage awards 6 Insight", () => {
    expect(insightFrom({ kind: "campaign", won: true, boss: true, elite: true })).toBe(6);
  });
  it("a lost dungeon awards no Insight", () => {
    expect(insightFrom({ kind: "dungeon", won: false })).toBe(0);
  });
  it("an achievement claim awards 5 Insight", () => {
    expect(insightFrom({ kind: "achievement", claimed: true })).toBe(5);
  });
  it("Measured Footwork requires Impact Brace rank 2", () => {
    const h = newHero("Tester", "warrior"); h.insight = 20;
    expect(passiveBlocker(h, "footwork")).toBe("Requires Impact Brace rank 2");
  });
  it("Field Medicine requires one banked Insight", () => {
    expect(passiveBlocker(newHero("Tester", "mage"), "field_medicine")).toBe("Needs 1 Insight");
  });
  it("a met prerequisite does not bypass branch tier spending", () => {
    const h = newHero("Tester", "mage"); h.insight = 20; h.passives = { brace: 2 };
    expect(passiveBlocker(h, "footwork")).toBe("Spend 3 Insight in general");
  });
  it("class passives cannot be purchased by another class", () => {
    const h = newHero("Tester", "mage"); h.insight = 20;
    expect(passiveBlocker(h, "w_staunch")).toBe("Requires warrior class");
  });
  it("learning leaves the original hero and rank map untouched", () => {
    const h = newHero("Tester", "mage"); h.insight = 5; h.passives = { brace: 1 };
    const before = structuredClone(h);
    const next = learnPassive(h, "field_medicine");
    expect(h).toEqual(before);
    expect(next).not.toBe(h);
    expect(next.passives).not.toBe(h.passives);
    expect(next.passives).toEqual({ brace: 1, field_medicine: 1 });
    expect(next.insight).toBe(4);
  });
  it("accounted Insight includes purchased ranks at their exact cost", () => {
    const h = newHero("Tester", "mage"); h.insight = 4; h.passives = { field_medicine: 2, anatomy: 1 };
    expect(totalInsight(h)).toBe(8);
  });
  it("every passive offers exactly four upgrades", () => {
    expect(PASSIVES.every((p) => p.max === 4)).toBe(true);
  });
  it("saved over-max ranks cannot inflate effects", () => {
    const h = newHero("Tester", "mage"); h.passives = { field_medicine: 99 };
    expect(passiveRank(h, "field_medicine")).toBe(4);
  });
  it("the stat adapter adds existing talent bonuses", () => {
    const h = newHero("Tester", "warrior"); h.passives = { w_reprisal: 2 };
    expect(mergePassiveFx(h, { atkPct: 4 }).atkPct).toBe(8);
  });
});
