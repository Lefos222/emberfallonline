import { describe, expect, it } from "vitest";
import {
  DIAMOND_PACKS,
  DIAMOND_SHOP,
  GEM_TIER_PRICES,
  GOLD_PACKS,
  MATERIAL_PRICES,
  MATERIAL_ORDER,
  VIP_PLANS,
  diamondPackTotal,
  materialBaseCost,
  premiumState,
  vipXpMultiplier,
} from "../game/economy";
import { VIP_DAYS, vipBlitzFactor, vipPrice } from "../game/vip-perks";

describe("premium economy configuration", () => {
  it("prices the five Diamond packs 10% above the old tiers", () => {
    expect(DIAMOND_PACKS.map((p) => p.priceCents)).toEqual([1099, 2199, 3299, 5499, 10999]);
    for (const p of DIAMOND_PACKS) {
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(p.diamonds).toBeGreaterThan(0);
      expect(p.bonus).toBeLessThan(p.diamonds);
      expect(diamondPackTotal(p)).toBe(p.diamonds + p.bonus);
    }
  });

  it("sells gold packs for diamonds at the raised prices", () => {
    for (const p of GOLD_PACKS) {
      expect(p.diamonds).toBeGreaterThan(0);
      expect(p.gold).toBeGreaterThan(0);
    }
    expect(GOLD_PACKS.map((p) => p.id)).toEqual(["pouch", "coffer", "royal", "imperial"]);
    expect(GOLD_PACKS.map((p) => p.diamonds)).toEqual([55, 242, 825, 2200]);
  });

  it("keeps small stones at six diamonds", () => {
    expect(GEM_TIER_PRICES[0]).toBe(6);
    expect(GEM_TIER_PRICES[1]).toBeGreaterThan(GEM_TIER_PRICES[0]);
    expect(GEM_TIER_PRICES[2]).toBeGreaterThan(GEM_TIER_PRICES[1]);
  });

  it("prices every material and keeps one-unit prices small", () => {
    expect(MATERIAL_ORDER).toHaveLength(Object.keys(MATERIAL_PRICES).length);
    for (const mat of MATERIAL_ORDER) {
      const prices = MATERIAL_PRICES[mat];
      expect(prices.one).toBeGreaterThanOrEqual(5);
      expect(prices.five).toBeGreaterThan(prices.one);
    }
    // Five singles are never cheaper than the bundle.
    for (const mat of MATERIAL_ORDER) {
      expect(MATERIAL_PRICES[mat].five).toBeLessThanOrEqual(MATERIAL_PRICES[mat].one * 5);
      expect(materialBaseCost(mat, 5)).toBe(MATERIAL_PRICES[mat].five);
      expect(materialBaseCost(mat, 6)).toBe(MATERIAL_PRICES[mat].five + MATERIAL_PRICES[mat].one);
    }
  });

  it("sells every VIP tier as exactly one month", () => {
    expect(VIP_PLANS).toHaveLength(3);
    expect(VIP_PLANS.map((v) => v.days)).toEqual([VIP_DAYS, VIP_DAYS, VIP_DAYS]);
    expect(VIP_DAYS).toBe(30);
    for (let i = 1; i < VIP_PLANS.length; i++) {
      const plan = VIP_PLANS[i];
      const prev = VIP_PLANS[i - 1];
      expect(plan.diamonds).toBeGreaterThan(prev.diamonds);
      expect(plan.dailyGold).toBeGreaterThan(prev.dailyGold);
      expect(plan.xpBonusPct).toBeGreaterThan(prev.xpBonusPct);
      expect(plan.goldBonusPct).toBeGreaterThan(prev.goldBonusPct);
      expect(plan.blitzSpeedPct).toBeGreaterThan(prev.blitzSpeedPct);
      expect(plan.shopDiscountPct).toBeGreaterThan(prev.shopDiscountPct);
    }
    // The membership carries the extra VIP premium over the shop-wide rise.
    expect(VIP_PLANS[0].diamonds).toBe(129);
  });

  it("discounts Diamond prices and shortens blitzes for members", () => {
    expect(vipPrice(100, 0)).toBe(100);
    expect(vipPrice(100, 1)).toBe(95);
    expect(vipPrice(100, 3)).toBe(85);
    expect(vipBlitzFactor(0)).toBe(1);
    expect(vipBlitzFactor(1)).toBeCloseTo(0.9);
    expect(vipBlitzFactor(3)).toBeCloseTo(0.7);
  });

  it("shop item ids are unique", () => {
    expect(new Set(DIAMOND_SHOP.map((i) => i.id)).size).toBe(DIAMOND_SHOP.length);
  });
});

describe("premiumState", () => {
  it("defaults to zero balance and no VIP for old saves", () => {
    const p = premiumState({ srv: {} });
    expect(p.balance).toBe(0);
    expect(p.vip.level).toBe(0);
    expect(p.claimedToday).toBe(false);
  });
  it("reads balance and active VIP", () => {
    const until = new Date(Date.now() + 86400000).toISOString();
    const p = premiumState({
      srv: {
        premium: {
          balance: 500,
          vip: { level: 2, until },
          claimed: new Date().toISOString().slice(0, 10),
        },
      },
    });
    expect(p.balance).toBe(500);
    expect(p.vip.level).toBe(2);
    expect(p.claimedToday).toBe(true);
  });
  it("treats an expired membership as inactive", () => {
    const until = new Date(Date.now() - 86400000).toISOString();
    expect(
      premiumState({ srv: { premium: { balance: 1, vip: { level: 3, until } } } }).vip.level,
    ).toBe(0);
  });
  it("raises battle XP for an active VIP tier", () => {
    const until = new Date(Date.now() + 86400000).toISOString();
    const hero = { srv: { premium: { vip: { level: 2, until } } } };
    expect(vipXpMultiplier(hero)).toBeCloseTo(1.2);
    expect(vipXpMultiplier({ srv: {} })).toBe(1);
  });
});
