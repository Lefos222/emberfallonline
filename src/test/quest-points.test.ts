import { describe, expect, it } from "vitest";
import { QUEST_POINT_CHANCE, questPointBonus } from "@/game/quest-board";
import { PASSIVES } from "@/game/passives";
import { TREES } from "@/game/talents";

describe("quest point payouts", () => {
  it("commission payouts can add a skill point and Insight", () => {
    expect(questPointBonus(() => 0)).toEqual({ skill: true, insight: true });
    expect(questPointBonus(() => 0.999)).toEqual({ skill: false, insight: false });
  });
  it("the payout chance stays at 25% per reward", () => {
    expect(QUEST_POINT_CHANCE).toBe(0.25);
  });
  it("every class keeps four upgrades on all skills and passives", () => {
    for (const specs of Object.values(TREES)) for (const s of specs) expect(s.talents.every((t) => t.max === 4)).toBe(true);
    expect(PASSIVES.every((p) => p.max === 4)).toBe(true);
  });
});
