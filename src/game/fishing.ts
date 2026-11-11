import { addMats } from "./crafting";
import type { Hero } from "./data";

/** The Fishing Pier: a non-battle daily pastime. Ten casts per UTC day; a timed reel decides the catch. */
export const FISHING_CASTS_PER_DAY = 10;

export interface Catch { id: string; name: string; gold: number; mats?: Record<string, number> }
/** Better reels (closer to the centre of the zone) land rarer fish. */
export const CATCHES: Catch[] = [
  { id: "minnow", name: "Ember Minnow", gold: 150 },
  { id: "perch", name: "Mire Perch", gold: 300, mats: { bloom: 4 } },
  { id: "pike", name: "Frostfin Pike", gold: 600, mats: { hide: 6 } },
  { id: "eel", name: "Starlit Eel", gold: 1000, mats: { essence: 3 } },
  { id: "koi", name: "Golden Koi", gold: 2500, mats: { crystal: 2 } },
];

const day = () => new Date().toISOString().slice(0, 10);

export function castsLeft(h: Pick<Hero, "fishing">): number {
  const f = h.fishing;
  return f && f.day === day() ? Math.max(0, FISHING_CASTS_PER_DAY - f.casts) : FISHING_CASTS_PER_DAY;
}

/**
 * Quality is how close the reel stopped to the zone's centre: 0 = missed, 1 = dead centre.
 * A miss still spends the cast. Gold scales gently with level.
 */
export function catchFor(quality: number, rand = Math.random): Catch | null {
  if (quality <= 0) return null;
  const tier = Math.min(CATCHES.length - 1, Math.floor(quality * 4 + rand() * 1.2));
  return CATCHES[tier]!;
}

export function reel(h: Hero, quality: number, rand = Math.random): Catch | null | "none" {
  if (castsLeft(h) <= 0) return "none";
  const today = day();
  const f = h.fishing && h.fishing.day === today ? h.fishing : { day: today, casts: 0, caught: h.fishing?.caught ?? 0 };
  f.casts += 1;
  const c = catchFor(quality, rand);
  if (c) {
    f.caught = (f.caught ?? 0) + 1;
    h.gold += Math.round(c.gold * (1 + Math.max(1, h.level) * 0.02));
    if (c.mats) addMats(h, c.mats);
  }
  h.fishing = { ...f };
  return c;
}
