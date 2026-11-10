import { describe, expect, it } from "vitest";
import { WHEEL_SEGMENTS, wheelGoodChance } from "@/game/wheel";
import { BM_LUCKY_CHANCE, rollBlackMarket } from "@/game/black-market";
import { newHero } from "@/game/data";

describe("diamond luck", () => {
  it("has more than the old 8 wheel prizes", () => {
    expect(WHEEL_SEGMENTS.length).toBe(16);
  });
  it("wheel odds add up to 100%", () => {
    expect(+WHEEL_SEGMENTS.reduce((a, s) => a + s.weight, 0).toFixed(2)).toBe(100);
  });
  it("good wheel prizes hit 5% of spins", () => {
    expect(wheelGoodChance()).toBe(5);
  });
  it("Black Market lucky stock is a 5% roll", () => {
    expect(BM_LUCKY_CHANCE).toBe(0.05);
  });
  it("a lucky Black Market roll adds an Epic non-armour piece and a Sun Crystal", () => {
    const h = newHero("Tester", "warrior");
    rollBlackMarket(h, () => 0.01);
    expect(h.blackMarket!.lucky).toBe(true);
    expect(h.blackMarket!.items.some((i) => i.rarity === 3)).toBe(true);
    expect(h.blackMarket!.mats.some((m) => m.mat === "sunCrystal")).toBe(true);
  });
  it("an unlucky roll has no Sun Crystal", () => {
    const h = newHero("Tester", "warrior");
    rollBlackMarket(h, () => 0.9);
    expect(h.blackMarket!.lucky).toBe(false);
    expect(h.blackMarket!.mats.some((m) => m.mat === "sunCrystal")).toBe(false);
  });
});
