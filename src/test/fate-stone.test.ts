import { describe, expect, it } from "vitest";
import { REFINE_STAT_BONUS, itemStats, makeItem, newHero, refineRank } from "@/game/data";
import { MATS, matCount } from "@/game/crafting";
import {
  FATE_SUCCESS_BONUS,
  addFateStones,
  fateRefineChance,
  fateStoneCost,
  fateStoneCount,
  rollFateStone,
  spendFateStones,
} from "@/game/fate";
import { buyFateStone, fateStoneShopPrice, stoneShopPrice } from "@/game/Marketplace";
import { stonePrice } from "@/game/enchant";

const item = (enh: number, refine = 0) => ({ ...makeItem("warrior", 30, 2, "weapon"), enh, refine });

describe("fate stones", () => {
  it("are a Forge material called Fate Stone", () => {
    expect(MATS.fateStone.name).toBe("Fate Stone");
    expect(MATS.fateStone.rarity).toBe(4);
  });

  it("add a flat bonus to the refinement roll, never certainty", () => {
    expect(FATE_SUCCESS_BONUS).toBe(0.25);
    const gear = item(20, 20);
    expect(fateRefineChance(item(0))).toBe(0.95);
    expect(fateRefineChance(gear)).toBeLessThan(fateRefineChance(item(0)));
    expect(fateRefineChance(item(40, 0))).toBe(fateRefineChance(item(0, 0)));
  });

  it("cost one stone a step, more as the piece is refined", () => {
    expect(fateStoneCost(item(0, 0))).toBe(1);
    expect(fateStoneCost(item(0, 2))).toBe(1);
    expect(fateStoneCost(item(0, 3))).toBe(2);
    expect(fateStoneCost(item(0, 6))).toBe(3);
    // The enchantment level does not change the price of a refinement.
    expect(fateStoneCost(item(40, 0))).toBe(1);
  });

  it("refine the piece on its own track, separate from enchantment", () => {
    const gear = item(12, 0);
    expect(refineRank(gear)).toBe(0);
    const refined = { ...gear, refine: 4 };
    expect(refineRank(refined)).toBe(4);
    expect(refined.enh).toBe(12);
    expect(REFINE_STAT_BONUS).toBe(0.02);
    expect(itemStats(refined).atk).toBeGreaterThan(itemStats(gear).atk);
    expect(itemStats(refined).atk).toBeCloseTo(itemStats(gear).atk * (1 + 4 * REFINE_STAT_BONUS), -1);
  });

  it("are counted in the pouch and spent without going negative", () => {
    const h = newHero("Fate", "warrior");
    expect(fateStoneCount(h)).toBe(0);
    addFateStones(h, 3);
    expect(matCount(h, "fateStone")).toBe(3);
    expect(spendFateStones(h, 2)).toBe(true);
    expect(fateStoneCount(h)).toBe(1);
    expect(spendFateStones(h, 2)).toBe(false);
    expect(fateStoneCount(h)).toBe(1);
    expect(spendFateStones(h, 1)).toBe(true);
    expect(fateStoneCount(h)).toBe(0);
  });

  it("drop rarely, more often from bosses", () => {
    expect(rollFateStone(false, false, () => 0.99)).toBe(0);
    expect(rollFateStone(false, false, () => 0.04)).toBe(1);
    expect(rollFateStone(false, true, () => 0.15)).toBe(1);
    // A boss can pay two: the first roll grants it, the second rolls the extra stone.
    const seq = [0.1, 0.2];
    let i = 0;
    expect(rollFateStone(true, false, () => seq[i++])).toBe(2);
  });

  it("sell in the Auction House shop at the house discount", () => {
    expect(fateStoneShopPrice(1)).toBe(Math.round(120000 * 0.27));
    // Priced between the mid and high enchantment grades: a rare shortcut, never the cheap road.
    expect(fateStoneShopPrice(1)).toBeGreaterThan(stoneShopPrice(5, 1));
    expect(fateStoneShopPrice(1)).toBeLessThan(stoneShopPrice(6, 1));
    const h = newHero("Buyer", "mage");
    h.gold = fateStoneShopPrice(h.level);
    expect(buyFateStone(h)).toBeNull();
    expect(fateStoneCount(h)).toBe(1);
    expect(h.gold).toBe(0);
    expect(buyFateStone(h)).toContain("Not enough gold");
  });

  it("cost far more than the cheapest enchantment stone", () => {
    expect(fateStoneShopPrice(1)).toBeGreaterThan(stonePrice(1, 1));
    expect(stonePrice(1, 1)).toBeGreaterThan(0);
  });
});
