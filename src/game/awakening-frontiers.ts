import type { Hero } from './data';
import { stageFoe } from './data';
import type { Mat } from './crafting';
import type { SpriteRect } from './world';
import { supabase } from '@/integrations/supabase/client';
import { adoptServerSave, getState, withServerHero } from './store';
import { object, requestKey, returnedSave } from './services-contract';

export type FrontierKind = 'citadel' | 'grove' | 'observatory' | 'hunt' | 'event';
export interface FrontierRun { id: string; kind: FrontierKind; node: number; started: string }
export interface FrontierState {
  marks?: number; seals?: number; fronts?: Partial<Record<FrontierKind, number>>;
  day?: string; week?: string; window?: string; dailyWins?: number; weeklyWins?: number;
  dailyClaimed?: boolean; weeklyClaimed?: boolean; huntUsed?: number; eventUsed?: number;
  huntBest?: number; eventBest?: number; run?: FrontierRun | null;
}
export const FRONTIERS: { id: FrontierKind; name: string; desc: string; art: number }[] = [
  { id: 'citadel', name: 'Ashen Citadel', desc: 'Break the siege. Every fifth encounter faces a commander.', art: 0 },
  { id: 'grove', name: 'Verdant Expanse', desc: 'Reclaim the wild sanctuaries from their ancient guardians.', art: 1 },
  { id: 'observatory', name: 'Shattered Observatory', desc: 'Recover the lost stars across an endless expedition.', art: 2 },
  { id: 'hunt', name: 'Warden Bounties', desc: 'Three hunts each UTC day. Victories earn Eclipse Seals.', art: 1 },
  { id: 'event', name: 'Eclipse Incursion', desc: 'Opens at 00, 06, 12 and 18 UTC for one hour. Two entries per opening.', art: 2 },
];
export const FRONTIER_SHOP: { id: string; mat: Mat; qty: number; currency: 'marks' | 'seals'; cost: number }[] = [
  { id: 'ember', mat: 'aetherEmber', qty: 5, currency: 'marks', cost: 20 },
  { id: 'voidsteel', mat: 'voidsteel', qty: 2, currency: 'marks', cost: 60 },
  { id: 'fate', mat: 'fateStone', qty: 1, currency: 'marks', cost: 45 },
  { id: 'pearl', mat: 'celestialPearl', qty: 1, currency: 'seals', cost: 12 },
  { id: 'heart', mat: 'eclipsedHeart', qty: 1, currency: 'seals', cost: 40 },
  { id: 'sun', mat: 'sunCrystal', qty: 1, currency: 'seals', cost: 8 },
];
export const eclipseWindow = (now = Date.now()) => {
  const start = Math.floor(now / 21_600_000) * 21_600_000;
  return { open: now < start + 3_600_000, start, end: start + 3_600_000, next: start + 21_600_000 };
};
export function frontierState(h: Hero, now = Date.now()): FrontierState {
  const a: FrontierState = { ...h.srv?.awakeningExpansion };
  const date = new Date(now); const day = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  const week = date.toISOString().slice(0, 10);
  if (a.day !== day) Object.assign(a, { day, dailyWins: 0, huntUsed: 0, dailyClaimed: false });
  if (a.week !== week) Object.assign(a, { week, weeklyWins: 0, weeklyClaimed: false });
  if (a.window !== String(Math.floor(now / 21_600_000))) a.eventUsed = 0;
  return a;
}
export function frontierFoe(kind: FrontierKind, node: number, level: number, sprite: SpriteRect) {
  const f = stageFoe(level, 1.5); const k = Math.pow(1.035, Math.min(node, 1000));
  const boss = kind === 'hunt' || kind === 'event' || node % 5 === 0;
  return { ...f, name: FRONTIERS.find(x => x.id === kind)?.name ?? kind, boss, sprite,
    hp: Math.round(f.hp * k * (boss ? 2 : 1.4)), atk: Math.round(f.atk * Math.sqrt(k)), def: Math.round(f.def * Math.pow(k, .35)) };
}
export async function frontierCall(action: 'begin' | 'settle' | 'buy' | 'claim', key: string, won = false): Promise<FrontierState> {
  const id = getState().heroId;
  if (!id) throw new Error('Select a character first.');
  const op = `frontier:${action}:${key}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  const state = await withServerHero(async heroId => {
    const { data, error } = await supabase.rpc('awakening_frontier', { _hero: heroId, _action: action, _key: key, _req: req, _won: won });
    if (error) throw new Error(error.message);
    const root = object(data); const a = object(root['state']);
    if (action === 'begin') {
      const r = object(a['run']);
      if (typeof r['id'] !== 'string' || typeof r['kind'] !== 'string' || !Number.isInteger(r['node'])) throw new Error('Expedition not found');
    }
    adoptServerSave(heroId, returnedSave(data));
    return a as FrontierState;
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
  return state;
}