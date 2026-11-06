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
  premiumState,
  vipXpMultiplier,
} from "../game/economy";

describe("premium economy configuration", () => {
  it("offers the five money tiers $10, $20, $30, $50 and $99.99", () => {
    expect(DIAMOND_PACKS.map((p) => p.priceCents)).toEqual([999, 1999, 2999, 4999, 9999]);
    for (const p of DIAMOND_PACKS) {
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(p.diamonds).toBeGreaterThan(0);
      expect(p.bonus).toBeLessThan(p.diamonds);
      expect(diamondPackTotal(p)).toBe(p.diamonds + p.bonus);
    }
  });

  it("sells gold packs for diamonds", () => {
    for (const p of GOLD_PACKS) {
      expect(p.diamonds).toBeGreaterThan(0);
      expect(p.gold).toBeGreaterThan(0);
    }
    expect(GOLD_PACKS.map((p) => p.id)).toEqual(["pouch", "coffer", "royal", "imperial"]);
  });

  it("keeps small stones at five diamonds", () => {
    expect(GEM_TIER_PRICES[0]).toBe(5);
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
  });

  it("has three VIP tiers with rising costs, days and rewards", () => {
    expect(VIP_PLANS).toHaveLength(3);
    expect(VIP_PLANS.map((v) => v.days)).toEqual([7, 15, 30]);
    for (let i = 1; i < VIP_PLANS.length; i++) {
      expect(VIP_PLANS[i].diamonds).toBeGreaterThan(VIP_PLANS[i - 1].diamonds);
      expect(VIP_PLANS[i].dailyGold).toBeGreaterThan(VIP_PLANS[i - 1].dailyGold);
      expect(VIP_PLANS[i].xpBonusPct).toBeGreaterThan(VIP_PLANS[i - 1].xpBonusPct);
    }
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
