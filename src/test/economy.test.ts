import { describe, expect, it } from 'vitest';
import { DIAMOND_PACKS, DIAMOND_SHOP, GOLD_PACKS, VIP_LEVELS, premiumState } from '../game/economy';

describe('premium economy configuration', () => {
  it('diamond packs use integer cents and positive amounts', () => {
    for (const p of DIAMOND_PACKS) {
      expect(Number.isInteger(p.eurCents)).toBe(true);
      expect(p.diamonds).toBeGreaterThan(0);
      expect(p.bonus).toBeLessThan(p.diamonds);
    }
  });
  it('gold packs cost diamonds and grant gold', () => {
    for (const p of GOLD_PACKS) {
      expect(p.diamonds).toBeGreaterThan(0);
      expect(p.gold).toBeGreaterThan(0);
    }
    expect(GOLD_PACKS.map(p => p.id)).toEqual(['pouch', 'chest', 'royal', 'imperial']);
  });
  it('has exactly five VIP levels with rising costs and rewards', () => {
    expect(VIP_LEVELS).toHaveLength(5);
    for (let i = 1; i < VIP_LEVELS.length; i++) {
      expect(VIP_LEVELS[i].diamonds30).toBeGreaterThan(VIP_LEVELS[i - 1].diamonds30);
      expect(VIP_LEVELS[i].dailyGold).toBeGreaterThan(VIP_LEVELS[i - 1].dailyGold);
    }
  });
  it('shop item ids are unique', () => {
    expect(new Set(DIAMOND_SHOP.map(i => i.id)).size).toBe(DIAMOND_SHOP.length);
  });
});

describe('premiumState', () => {
  it('defaults to zero balance and no VIP for old saves', () => {
    const p = premiumState({ srv: {} });
    expect(p.balance).toBe(0);
    expect(p.vip.level).toBe(0);
    expect(p.claimedToday).toBe(false);
  });
  it('reads balance and active VIP', () => {
    const until = new Date(Date.now() + 86400000).toISOString();
    const p = premiumState({ srv: { premium: { balance: 500, vip: { level: 3, until }, claimed: new Date().toISOString().slice(0, 10) } } });
    expect(p.balance).toBe(500);
    expect(p.vip.level).toBe(3);
    expect(p.claimedToday).toBe(true);
  });
  it('treats an expired membership as inactive', () => {
    const until = new Date(Date.now() - 86400000).toISOString();
    expect(premiumState({ srv: { premium: { balance: 1, vip: { level: 5, until } } } }).vip.level).toBe(0);
  });
});
