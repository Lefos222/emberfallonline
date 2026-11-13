import { scaledFoe, type Foe, type Hero } from "./data";

/** Everything the scaling reads: what the hero trained, and how high they stand. */
type ScalingHero = Pick<Hero, "attrs" | "level"> & Partial<Pick<Hero, "paragon">>;

/** Monsters keep pace with a hero's training: +0.18% per trained attribute point. */
export const FOE_ATTR_SCALE = 0.0018;
/** ...at most doubling their health and damage from attributes alone. */
export const FOE_ATTR_CAP = 1;

/** Monsters also keep pace with the hero's level: +3% for every level above their own fight. */
export const FOE_LEVEL_SCALE = 0.03;
/** ...up to thirty levels, so a deep hero never meets a one-turn tutorial. */
export const FOE_LEVEL_CAP = 30;

/** The opening stages are the gentlest of the campaign, so their monsters take the biggest lift. */
export const FOE_OPENING_BONUS = 2.4;
export const FOE_OPENING_STAGES = 12;

/** Attack and defence follow health more slowly: the world gets tougher, never instantly lethal. */
const FOE_ATK_POWER = 0.45;
const FOE_DEF_POWER = 0.5;

const attrPoints = (h: ScalingHero) => {
  const a = h.attrs ?? ({} as Hero["attrs"]);
  return Math.max(0, (a.str ?? 0) + (a.int ?? 0) + (a.agi ?? 0) + (a.vit ?? 0));
};

/**
 * How much tougher this hero's monsters are than the fight's own numbers: the opening-stage lift,
 * the hero's trained attributes, and how far the hero has out-levelled the fight, multiplied.
 */
export function foeScale(foeLevel: number, h: ScalingHero): number {
  const attrs = 1 + Math.min(FOE_ATTR_CAP, attrPoints(h) * FOE_ATTR_SCALE);
  const above = Math.max(0, Math.floor(h.level + (h.paragon ?? 0)) - Math.floor(foeLevel));
  const levels = 1 + Math.min(FOE_LEVEL_CAP, above) * FOE_LEVEL_SCALE;
  const opening = 1 + FOE_OPENING_BONUS * Math.exp(-Math.max(1, Math.floor(foeLevel)) / FOE_OPENING_STAGES);
  return opening * attrs * levels;
}

/** A prepared foe remembers the fight's own numbers so it can be scaled again after any training. */
type Prepared<T> = T & { baseFoe?: { hp: number; atk: number; def: number; level: number } };

/**
 * Every monster fight goes through here (the single `start` in Game.tsx, and the gate previews that
 * show it): the world levels a foe up toward the hero first (see scaledFoe), then its stats grow
 * with the hero's own attributes and level, so a hero who trains hard meets a world that kept pace.
 * The marker keeps a foe that is previewed and then fought from being scaled twice.
 */
export function prepareFoe<T extends Foe>(foe: T, h: ScalingHero): T {
  const base = (foe as Prepared<T>).baseFoe ?? { hp: foe.hp, atk: foe.atk, def: foe.def, level: foe.level };
  const up = scaledFoe({ ...foe, ...base }, h.level);
  const f = foeScale(base.level, h);
  return {
    ...up,
    baseFoe: base,
    hp: Math.round(up.hp * f),
    atk: Math.round(up.atk * Math.pow(f, FOE_ATK_POWER)),
    def: Math.round(up.def * Math.pow(f, FOE_DEF_POWER)),
  };
}
