import type { FighterInput } from './combat';
import { object } from './services-contract';

export const SCROLLS = {
  dmg: { name: 'Damage Scroll', price: 2000, bonus: 20 },
  def: { name: 'Defence Scroll', price: 2000, bonus: 20 },
  xp: { name: 'Experience Scroll', price: 1500, bonus: 20 },
} as const;
export type ScrollKind = keyof typeof SCROLLS;
export const isScroll = (v: unknown): v is ScrollKind => typeof v === 'string' && v in SCROLLS;
export function scrollState(hero: unknown) {
  const srv = object(object(hero)['srv']);
  const counts = (v: unknown): Record<ScrollKind, number> => {
    const data = object(v);
    const n = (k: ScrollKind) => Number.isInteger(data[k]) && Number(data[k]) > 0 ? Number(data[k]) : 0;
    return { dmg: n('dmg'), def: n('def'), xp: n('xp') };
  };
  return { owned: counts(srv['scrolls']), buffs: counts(srv['buffs']) };
}
export function activeScrolls(value: unknown): ScrollKind[] {
  const active = object(value)['active'];
  if (!Array.isArray(active) || !active.every(isScroll) || new Set(active).size !== active.length) throw new Error('Scroll battle confirmation is incomplete. Your charges will not be retried automatically.');
  return active;
}
/** Apply only the server-confirmed battle snapshot, never the decremented remaining counts. */
export function scrollFighter(f: FighterInput, active: ScrollKind[]): FighterInput {
  return { ...f, atk: active.includes('dmg') ? Math.round(f.atk * 1.2) : f.atk, def: active.includes('def') ? Math.round(f.def * 1.2) : f.def, scrolls: [...active] };
}
export const scrollXp = (xp: number, multiplier = 1) => Math.round(xp * multiplier);