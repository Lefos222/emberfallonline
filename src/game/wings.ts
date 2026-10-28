import { scaledGold } from "./gold";
import { matCount, type BonusFx, type Mat, zeroFx } from "./crafting";

/**
 * Wings: upgradeable cosmetic + stat bonuses from the Sky Altar.
 * Each wing tier is unlocked and upgraded with gold and a special
 * "feather" material earned from battles. Feeds into computeStats.
 */

export interface Wing {
  id: string;
  name: string;
  desc: string;
  req: number;
  fx: Partial<BonusFx>;
  goldBase: number;
  mats: Partial<Record<Mat, number>>;
  max: number;
}

export const WINGS: Wing[] = [
  { id: "ember_wings", name: "Ember Wings", desc: "Wings of living flame, the first ascent.", req: 10, fx: { atkPct: 2, hpPct: 2 }, goldBase: 3000, mats: { ore: 15, essence: 5 }, max: 20 },
  { id: "frost_wings", name: "Frost Wings", desc: "Crystalline pinions that bite like winter.", req: 20, fx: { defPct: 3, mdefPct: 3 }, goldBase: 10000, mats: { ore: 30, essence: 12, crystal: 5 }, max: 20 },
  { id: "storm_wings", name: "Storm Wings", desc: "Feathers crackling with captured lightning.", req: 30, fx: { atkPct: 3, crit: 1, acc: 1 }, goldBase: 25000, mats: { ore: 60, essence: 20, starshard: 10 }, max: 20 },
  { id: "shadow_wings", name: "Shadow Wings", desc: "Wings woven from the void between stars.", req: 40, fx: { atkPct: 4, dodge: 1.5, critDmg: 4 }, goldBase: 70000, mats: { ore: 120, essence: 35, starshard: 20, crystal: 10 }, max: 20 },
  { id: "divine_wings", name: "Divine Wings", desc: "Radiant wings blessed by the old gods.", req: 55, fx: { atkPct: 5, hpPct: 5, defPct: 3, heal: 3 }, goldBase: 250000, mats: { ore: 250, essence: 80, starshard: 40, bossCore: 15 }, max: 20 },
  { id: "chaos_wings", name: "Chaos Wings", desc: "Wings of pure entropy, bending reality itself.", req: 70, fx: { atkPct: 7, hpPct: 7, crit: 2, critDmg: 8, pen: 2, acc: 2 }, goldBase: 800000, mats: { ore: 500, essence: 200, starshard: 80, bossCore: 30, crystal: 40 }, max: 20 },
];

export const WING_UNLOCK_LEVEL = 10;

export const wingLevel = (h: { wings?: Record<string, number> }, id: string) => h.wings?.[id] ?? 0;
export const ownsWing = (h: { wings?: Record<string, number> }, id: string) => wingLevel(h, id) > 0;
export const activeWing = (h: { wing?: string }) => h.wing ?? null;

export function wingUpgradeCost(w: Wing, level: number, heroLevel = 1) {
  return {
    gold: scaledGold(w.goldBase * Math.pow(level + 1, 1.5), heroLevel),
    mats: Object.fromEntries(Object.entries(w.mats).map(([k, v]) => [k, Math.ceil((v ?? 0) * (level + 1))])) as Partial<Record<Mat, number>>,
  };
}

export function wingBlocker(h: { level: number; gold: number; wings?: Record<string, number>; mats?: Partial<Record<Mat, number>> }, id: string): string | null {
  const w = WINGS.find((x) => x.id === id);
  if (!w) return "Unknown wing";
  const lvl = wingLevel(h, id);
  if (lvl >= w.max) return "Max level";
  if (lvl === 0 && h.level < w.req) return `Requires level ${w.req}`;
  const cost = wingUpgradeCost(w, lvl, h.level);
  if (h.gold < cost.gold) return "Not enough gold";
  for (const [k, v] of Object.entries(cost.mats) as [Mat, number][]) {
    if (matCount(h, k) < v) return `Need ${v} ${k}`;
  }
  return null;
}

export function upgradeWing(h: { level: number; gold: number; wing?: string; wings?: Record<string, number>; mats?: Partial<Record<Mat, number>> }, id: string): string | null {
  const blocked = wingBlocker(h, id);
  if (blocked) return blocked;
  const w = WINGS.find((x) => x.id === id)!;
  const lvl = wingLevel(h, id);
  const cost = wingUpgradeCost(w, lvl, h.level);
  h.gold -= cost.gold;
  h.mats = { ...(h.mats ?? {}) };
  for (const [k, v] of Object.entries(cost.mats) as [Mat, number][]) {
    h.mats[k] = (h.mats[k] ?? 0) - v;
  }
  h.wings = { ...(h.wings ?? {}), [id]: lvl + 1 };
  if (!h.wing) h.wing = id;
  return null;
}

export function setActiveWing(h: { wing?: string }, id: string | null) {
  h.wing = id ?? undefined;
}

/** Combat bonus from all owned wings — active wing contributes double. */
export function wingFx(h: { wing?: string; wings?: Record<string, number> }): BonusFx {
  const out = zeroFx();
  if (!h.wings) return out;
  const active = h.wing;
  for (const w of WINGS) {
    const lvl = wingLevel(h, w.id);
    if (lvl <= 0) continue;
    const mult = w.id === active ? 2 : 1;
    for (const [k, v] of Object.entries(w.fx) as [keyof BonusFx, number][]) {
      out[k] += (v ?? 0) * lvl * mult;
    }
  }
  return out;
}

export const wingPower = (h: { wing?: string; wings?: Record<string, number> }) => {
  const fx = wingFx(h);
  return Math.round((fx.atkPct + fx.matkPct) * 10 + (fx.defPct + fx.mdefPct) * 8 + fx.hpPct * 6 + fx.crit * 20 + fx.critDmg * 5);
};
