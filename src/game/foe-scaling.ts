import type { Hero } from "./data";

/** Extra monster health/attack/defence per trained attribute point: 0.12%, capped at +50%. */
export const FOE_ATTR_SCALE = 0.0012;
export const FOE_ATTR_CAP = 0.5;

/** How much tougher monsters get for this hero's trained attributes. */
export function foeAttrFactor(h: Pick<Hero, "attrs">): number {
  const a = h.attrs ?? ({} as Hero["attrs"]);
  const pts = Math.max(0, (a.str ?? 0) + (a.int ?? 0) + (a.agi ?? 0) + (a.vit ?? 0));
  return 1 + Math.min(FOE_ATTR_CAP, pts * FOE_ATTR_SCALE);
}

/** Monsters (never arena players) grow with the hero's attributes so levelling stays a challenge. */
export function scaleFoeToHero<T extends { hp: number; atk: number; def: number }>(foe: T, h: Pick<Hero, "attrs">): T {
  const f = foeAttrFactor(h);
  if (f === 1) return foe;
  return { ...foe, hp: Math.round(foe.hp * f), atk: Math.round(foe.atk * f), def: Math.round(foe.def * f) };
}
