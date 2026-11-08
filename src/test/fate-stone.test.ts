import { describe, expect, it } from "vitest";
import { enhanceChance, makeItem, newHero } from "@/game/data";
import { MATS, matCount } from "@/game/crafting";
import {
  FATE_SUCCESS_BONUS,
  addFateStones,
  enhanceFateChance,
  fateStoneCost,
  fateStoneCount,
  rollFateStone,
  spendFateStones,
} from "@/game/fate";
import { buyFateStone, fateStoneShopPrice, stoneShopPrice } from "@/game/Marketplace";
import { stonePrice } from "@/game/enchant";

const item = (enh: number) => ({ ...makeItem("warrior", 30, 2, "weapon"), enh });

describe("fate stones", () => {
  it("are a Forge material called Fate Stone", () => {
    expect(MATS.fateStone.name).toBe("Fate Stone");
    expect(MATS.fateStone.rarity).toBe(4);
  });

  it("add a flat bonus to the plain refinement roll, never certainty", () => {
    expect(FATE_SUCCESS_BONUS).toBe(0.25);
    const gear = item(20);
    expect(enhanceFateChance(gear)).toBeCloseTo(enhanceChance(gear) + 0.25, 5);
    expect(enhanceFateChance(item(0))).toBe(0.95);
    expect(enhanceFateChance(item(40))).toBeLessThanOrEqual(0.95);
    expect(enhanceFateChance(item(40))).toBeGreaterThan(enhanceChance(item(40)));
  });

  it("cost one stone a step, more as the gear climbs", () => {
    expect(fateStoneCost(item(0))).toBe(1);
    expect(fateStoneCost(item(4))).toBe(1);
    expect(fateStoneCost(item(5))).toBe(2);
    expect(fateStoneCost(item(10))).toBe(3);
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
    expect(fateStoneShopPrice(1)).toBeGreaterThan(stoneShopPrice(1, 1));
    expect(stonePrice(1, 1)).toBeGreaterThan(0);
  });
});
