import { describe, expect, it } from "vitest";
import { gemSellValue, matSellValue, sellGem, sellMat, sellStone, stoneSellValue } from "@/game/sell";

describe("selling anything from the bag", () => {
  it("sells materials for gold and never more than owned", () => {
    const h = { gold: 0, mats: { ore: 5 } };
    expect(sellMat(h, "ore", 99)).toBe(5 * matSellValue("ore"));
    expect(h.mats.ore).toBe(0);
    expect(sellMat(h, "ore", 1)).toBe(0);
  });
  it("sells gems for gold", () => {
    const h = { gold: 0, gems: { "ruby:2": 2 } as Record<string, number> };
    const paid = sellGem(h, "ruby:2", 1);
    expect(gemSellValue("ruby:2")).toBe(180);
    expect(paid).toBe(180);
    expect(h.gems["ruby:2"]).toBe(1);
  });
  it("sells enchantment stones for 15% of their shop price", () => {
    const h = { gold: 0, enchantStones: { "2": 3 } };
    expect(stoneSellValue(2)).toBe(1350);
    expect(sellStone(h, 2, 3)).toBe(4050);
    expect(h.enchantStones["2"]).toBe(0);
  });
});
