import { zeroFx, type BonusFx } from "./crafting";
import type { Hero } from "./data";

// ============= Enlightenment: the post-20 permanent stat track =============
// Unlocked at level 20, fed by Battle Essence from every won fight. Each level
// grants +1% attack, defense and health (+0.2% crit), up to 50 levels. The
// essence cost grows exponentially, so the deep levels are a real grind that
// keeps daily play meaningful long after the campaign is cleared.

/** Enlightenment unlocks at this level — the late-game permanent stat track. */
export const ENLIGHTENMENT_LEVEL = 20;
/** Maximum Enlightenment levels. */
export const ENLIGHTENMENT_MAX = 50;
/** Battle Essence the first Enlightenment level costs; each level costs more. */
export const ENLIGHTENMENT_BASE = 10;
/** Exponential growth of the essence cost per level. */
export const ENLIGHTENMENT_GROWTH = 1.18;

/** The hero's current Enlightenment level. */
export const enlightenmentLevel = (h: Hero) =>
  Math.min(ENLIGHTENMENT_MAX, Math.max(0, Math.floor(h.enlightenment ?? 0)));

/** Battle Essence the hero has banked. */
export const battleEssence = (h: Hero) => Math.max(0, Math.floor(h.battleEssence ?? 0));

/** Whether Enlightenment is unlocked for this hero. */
export const enlightenmentUnlocked = (h: { level: number }) => h.level >= ENLIGHTENMENT_LEVEL;

/** Essence cost of the next Enlightenment level. */
export const enlightenmentCost = (level: number) =>
  Math.round(ENLIGHTENMENT_BASE * Math.pow(ENLIGHTENMENT_GROWTH, level));

/** Every stat bonus Enlightenment grants. Each level: +1% atk, +1% def, +1% hp, +0.2% crit. */
export function enlightenmentFx(h: Hero): BonusFx {
  const out = zeroFx();
  const lv = enlightenmentLevel(h);
  if (lv <= 0) return out;
  out.atkPct = lv;
  out.defPct = lv;
  out.hpPct = lv;
  out.crit = lv * 0.2;
  return out;
}

/** Buy one Enlightenment level with Battle Essence. Returns an error string, or null on success. */
export function buyEnlightenment(h: Hero): string | null {
  if (!enlightenmentUnlocked(h)) return `Unlocks at level ${ENLIGHTENMENT_LEVEL}`;
  const lv = enlightenmentLevel(h);
  if (lv >= ENLIGHTENMENT_MAX) return "Maximum Enlightenment reached";
  const cost = enlightenmentCost(lv);
  if (battleEssence(h) < cost) return `Need ${cost} Battle Essence`;
  h.battleEssence = battleEssence(h) - cost;
  h.enlightenment = lv + 1;
  return null;
}

/** Battle Essence earned from a won battle: 1 base + 1 per 10 levels, +2 for bosses. */
export function battleEssenceGain(level: number, boss: boolean): number {
  return 1 + Math.floor(level / 10) + (boss ? 2 : 0);
}

// ============= Soul Shards: chance-based battle drops for permanent infusions =============
// Soul Shards drop randomly from won battles — bosses drop more often and in
// larger stacks. They're spent at the Soul Forge for permanent stat infusions,
// each rank a small but permanent step that never resets.

export interface SoulInfusion {
  id: string;
  name: string;
  stat: keyof BonusFx;
  per: number;
  max: number;
  desc: string;
}

export const SOUL_INFUSIONS: SoulInfusion[] = [
  { id: "soul_atk", name: "Soul Strike", stat: "atkPct", per: 0.5, max: 20, desc: "Channel soul energy into raw attack power." },
  { id: "soul_def", name: "Soul Guard", stat: "defPct", per: 0.5, max: 20, desc: "Harden your body with the essence of fallen foes." },
  { id: "soul_hp", name: "Soul Vitality", stat: "hpPct", per: 1, max: 20, desc: "Draw life force from every victory." },
  { id: "soul_crit", name: "Soul Precision", stat: "crit", per: 0.3, max: 15, desc: "Read the flow of battle with perfect clarity." },
  { id: "soul_dodge", name: "Soul Evasion", stat: "dodge", per: 0.2, max: 15, desc: "Move with the ghost of every fallen enemy." },
  { id: "soul_pen", name: "Soul Pierce", stat: "pen", per: 0.3, max: 15, desc: "Find the gap in any defense." },
];

export const soulShards = (h: Hero) => Math.max(0, Math.floor(h.soulShards ?? 0));
export const soulRank = (h: Hero, id: string) => Math.max(0, Math.floor(h.soulInfusions?.[id] ?? 0));

/** Shards the next rank of an infusion costs. */
export const soulCost = (rank: number) => 3 + rank * 2;

/** Every soul infusion bonus the hero has, in the shared bonus shape. */
export function soulFx(h: Hero): BonusFx {
  const out = zeroFx();
  for (const inf of SOUL_INFUSIONS) {
    const r = soulRank(h, inf.id);
    if (r > 0) out[inf.stat] += inf.per * r;
  }
  return out;
}

/** Why the next rank can't be bought, or null when it can. */
export function soulBlocker(h: Hero, id: string): string | null {
  const inf = SOUL_INFUSIONS.find((s) => s.id === id);
  if (!inf) return "Unknown infusion";
  const rank = soulRank(h, id);
  if (rank >= inf.max) return "Maxed";
  if (soulShards(h) < soulCost(rank)) return `Need ${soulCost(rank)} Soul Shards`;
  return null;
}

/** Spend shards on one infusion rank. Returns an error string, or null on success. */
export function buySoulInfusion(h: Hero, id: string): string | null {
  const blocked = soulBlocker(h, id);
  if (blocked) return blocked;
  const inf = SOUL_INFUSIONS.find((s) => s.id === id)!;
  h.soulShards = soulShards(h) - soulCost(soulRank(h, id));
  h.soulInfusions = { ...(h.soulInfusions ?? {}), [id]: soulRank(h, id) + 1 };
  return null;
}

/** Chance a won battle drops Soul Shards. Bosses drop far more often and in larger stacks. */
export const SOUL_SHARD_CHANCE = 0.08;
export const SOUL_SHARD_BOSS_CHANCE = 0.25;

/** Roll soul shards from a won battle. Returns the count (0 = no drop). */
export function rollSoulShards(boss: boolean, rand: () => number = Math.random): number {
  const chance = boss ? SOUL_SHARD_BOSS_CHANCE : SOUL_SHARD_CHANCE;
  if (rand() > chance) return 0;
  return boss ? 2 + Math.floor(rand() * 2) : 1;
}
