import { describe, expect, it } from "vitest";
import { makeDrop } from "@/game/logic";
import { ASTRAL_ODDS, isArmor, rollAstralRarity } from "@/game/crafting";
import { invCap, bagRowCost } from "@/game/data";

describe("stage 5 rules", () => {
  it("loot never produces finished Rare+ armor", () => {
    for (let i = 0; i < 2000; i++) { const it = makeDrop("warrior", 20, 2 + (i % 4)); expect(isArmor(it.slot)).toBe(false); }
  });
  it("Astral odds sum to 100 and Gold is 0.5%", () => { expect(ASTRAL_ODDS.reduce((a, b) => a + b, 0)).toBe(100); expect(ASTRAL_ODDS[5]).toBe(0.5); });
  it("roll 0.1 is Gold, 99 is Grey", () => { expect(rollAstralRarity(0.1)).toBe(5); expect(rollAstralRarity(99)).toBe(0); });
  it("bag expansion keeps 8 slots / 5000 doubling", () => { expect(invCap({ bagRows: 1 }) - invCap({})).toBe(8); expect(bagRowCost({ bagRows: 1 })).toBe(10000); });
});
