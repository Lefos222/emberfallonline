import { object } from './services-contract';

/** Premium monetization configuration. Prices here must stay identical to the SQL in the
 *  premium_diamonds_vip migration — the server is authoritative, this file is display + validation. */

export interface DiamondPack { id: string; name: string; eurCents: number; diamonds: number; bonus: number }
export const DIAMOND_PACKS: DiamondPack[] = [
  { id: 'starter', name: 'Starter Pack', eurCents: 199, diamonds: 200, bonus: 0 },
  { id: 'small', name: 'Small Pack', eurCents: 499, diamonds: 550, bonus: 50 },
  { id: 'adventurer', name: 'Adventurer Pack', eurCents: 999, diamonds: 1200, bonus: 200 },
  { id: 'hero', name: 'Hero Pack', eurCents: 1999, diamonds: 2600, bonus: 600 },
  { id: 'champion', name: 'Champion Pack', eurCents: 4999, diamonds: 7000, bonus: 2000 },
  { id: 'legendary', name: 'Legendary Pack', eurCents: 9999, diamonds: 15000, bonus: 5000 },
];

export interface GoldPack { id: string; name: string; diamonds: number; gold: number }
export const GOLD_PACKS: GoldPack[] = [
  { id: 'pouch', name: 'Gold Pouch', diamonds: 100, gold: 10000 },
  { id: 'chest', name: 'Gold Chest', diamonds: 450, gold: 50000 },
  { id: 'royal', name: 'Royal Treasury', diamonds: 1500, gold: 200000 },
  { id: 'imperial', name: 'Imperial Treasury', diamonds: 4000, gold: 600000 },
];

export interface VipLevel { level: number; name: string; diamonds30: number; dailyGold: number; dailyResources: number; perks: string[] }
export const VIP_LEVELS: VipLevel[] = [
  { level: 1, name: 'Supporter', diamonds30: 300, dailyGold: 1000, dailyResources: 1, perks: ['VIP badge', 'Daily gold bonus', 'VIP nameplate'] },
  { level: 2, name: 'Adventurer', diamonds30: 800, dailyGold: 2500, dailyResources: 2, perks: ['Everything from Supporter', 'Daily resource package', 'Exclusive profile frame'] },
  { level: 3, name: 'Champion', diamonds30: 2000, dailyGold: 6000, dailyResources: 3, perks: ['Everything from Adventurer', 'Champion title', 'Special cosmetic collection'] },
  { level: 4, name: 'Royal', diamonds30: 4500, dailyGold: 12000, dailyResources: 4, perks: ['Everything from Champion', 'Royal outfit appearance', 'VIP missions'] },
  { level: 5, name: 'Imperial', diamonds30: 9000, dailyGold: 25000, dailyResources: 5, perks: ['Everything from Royal', 'Imperial nameplate effects', 'Premium cosmetic collection'] },
];

export interface DiamondItem { id: string; name: string; diamonds: number; kind: 'cosmetic' | 'scrolls' | 'resources'; description: string }
export const DIAMOND_SHOP: DiamondItem[] = [
  { id: 'wings_celestial', name: 'Celestial Wings', diamonds: 1200, kind: 'cosmetic', description: 'Exclusive radiant wing appearance' },
  { id: 'outfit_royal', name: 'Royal Outfit', diamonds: 900, kind: 'cosmetic', description: 'Exclusive regal character outfit' },
  { id: 'aura_ember', name: 'Ember Aura', diamonds: 600, kind: 'cosmetic', description: 'A smouldering aura surrounds your character' },
  { id: 'frame_diamond', name: 'Diamond Frame', diamonds: 800, kind: 'cosmetic', description: 'Prestigious portrait frame' },
  { id: 'title_immortal', name: 'Immortal Title', diamonds: 500, kind: 'cosmetic', description: 'The "Immortal" title' },
  { id: 'scroll_bundle', name: 'War Scroll Bundle', diamonds: 400, kind: 'scrolls', description: '5 Damage, 5 Defence and 5 Experience Scrolls' },
  { id: 'resource_bundle', name: 'Gatherer’s Cache', diamonds: 300, kind: 'resources', description: '5 of every common gathering resource' },
];

export interface PremiumState {
  balance: number;
  vip: { level: number; until: string | null };
  claimedToday: boolean;
  history: { at: string; kind: string; amount: number; detail: string }[];
}

export function premiumState(hero: unknown): PremiumState {
  const p = object(object(object(hero)['srv'])['premium']);
  const vip = object(p['vip']);
  const until = typeof vip['until'] === 'string' ? vip['until'] : null;
  const active = until !== null && Date.parse(until) > Date.now();
  const history = Array.isArray(p['history']) ? p['history'] as PremiumState['history'] : [];
  return {
    balance: Number.isInteger(p['balance']) && Number(p['balance']) > 0 ? Number(p['balance']) : 0,
    vip: { level: active && Number.isInteger(vip['level']) ? Number(vip['level']) : 0, until },
    claimedToday: typeof p['claimed'] === 'string' && p['claimed'] === new Date().toISOString().slice(0, 10),
    history,
  };
}
