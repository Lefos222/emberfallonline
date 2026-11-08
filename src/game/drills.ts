import { scaledGold } from "./gold";
import { barracksLevel } from "./barracks";
import { zeroFx } from "./crafting";
import type { BonusFx, StatKey } from "./crafting";

/**
 * Barracks drills: the permanent training tracks the barracks offers beside the four attributes.
 * Each rank is bought with gold, so the building keeps being worth upgrading long after the
 * attribute training is done. The bonuses feed straight into the shared stat computation.
 */
export type DrillStat = "atkPct" | "defPct" | "hpPct" | "crit" | "acc" | "dodge" | "block" | "heal";

export interface Drill {
  id: string;
  name: string;
  /** What one rank grants, in the stat's own unit. */
  stat: DrillStat;
  per: number;
  max: number;
  /** Gold of the first rank; every further rank costs more. */
  base: number;
  /** Barracks building level that unlocks the drill. */
  barracks: number;
  desc: string;
}

export const DRILL_STAT_LABEL: Record<DrillStat, string> = {
  atkPct: "attack", defPct: "defense", hpPct: "health", crit: "crit chance", acc: "accuracy", dodge: "dodge",
  block: "block", heal: "healing power",
};

/** Health is the drill yard's first lesson and its deepest one, so every hero can always buy more life. */
export const DRILLS: Drill[] = [
  { id: "vitality", name: "Vital Reserves", stat: "hpPct", per: 2, max: 10, base: 800, barracks: 1, desc: "Deep-breathing drills that widen your well of life." },
  { id: "weapons", name: "Weapon Drill", stat: "atkPct", per: 1, max: 10, base: 900, barracks: 1, desc: "Drill every swing until the arm never tires." },
  { id: "shields", name: "Shield Wall Drill", stat: "defPct", per: 1, max: 10, base: 900, barracks: 3, desc: "Locking shields, rank after rank." },
  { id: "endurance", name: "Endurance Runs", stat: "hpPct", per: 1.5, max: 10, base: 1100, barracks: 6, desc: "Long marches that harden the body." },
  { id: "recovery", name: "Battlefield Recovery", stat: "heal", per: 1, max: 10, base: 1400, barracks: 8, desc: "Field dressings that make every restoration count." },
  { id: "focus", name: "Focus Drills", stat: "crit", per: 0.5, max: 10, base: 1300, barracks: 10, desc: "Reading the opening in a guard." },
  { id: "toughness", name: "Body Tempering", stat: "hpPct", per: 3, max: 10, base: 4500, barracks: 12, desc: "Strike the body until it stops yielding." },
  { id: "marksman", name: "Marksman Drill", stat: "acc", per: 0.5, max: 8, base: 1000, barracks: 14, desc: "Nothing but the mark and the breath." },
  { id: "guardwork", name: "Guard Drill", stat: "block", per: 0.5, max: 10, base: 1600, barracks: 16, desc: "Turn the blade aside instead of taking it." },
  { id: "footwork", name: "Footwork Drill", stat: "dodge", per: 0.5, max: 8, base: 1000, barracks: 18, desc: "Steps that leave a blade cutting air." },
];

/** What a hero must bring to the drill yard to be trained. */
export interface DrillState { drills?: Record<string, number>; buildings?: Record<string, number>; gold: number; level: number }

/** Ranks a hero has drilled in one track. */
export const drillRank = (h: Pick<DrillState, "drills">, id: string) => Math.max(0, h.drills?.[id] ?? 0);

/** Gold for the next rank of a drill: each rank costs more, and the price scales with the hero's level. */
export const drillCost = (d: Drill, rank: number, level = 1) => scaledGold(d.base * Math.pow(rank + 1, 1.7), level);

/** What one rank of a drill is worth as text (per rank, or banked so far). */
export const drillText = (d: Drill, ranks = 1) => `+${+(d.per * ranks).toFixed(1)}% ${DRILL_STAT_LABEL[d.stat]}`;

/** Every bonus the hero's drilled ranks grant, in the shared bonus shape. */
export function drillFx(h: Pick<DrillState, "drills">): Partial<BonusFx> {
  const out: Partial<BonusFx> = {};
  for (const d of DRILLS) {
    const r = drillRank(h, d.id);
    if (r > 0) out[d.stat] = (out[d.stat] ?? 0) + d.per * r;
  }
  return out;
}

/** Why the next rank can't be trained, or null when it can. */
export function drillBlocker(h: DrillState, id: string): string | null {
  const d = DRILLS.find((x) => x.id === id);
  if (!d) return "Unknown drill";
  const rank = drillRank(h, id);
  if (rank >= d.max) return "Fully drilled";
  if (barracksLevel(h) < d.barracks) return `Requires barracks level ${d.barracks}`;
  if (h.gold < drillCost(d, rank, h.level)) return "Not enough gold";
  return null;
}

/** Buy one rank of a drill with gold. Returns an error message, or null on success. */
export function trainDrill(h: DrillState, id: string): string | null {
  const blocked = drillBlocker(h, id);
  if (blocked) return blocked;
  const d = DRILLS.find((x) => x.id === id)!;
  h.gold -= drillCost(d, drillRank(h, id), h.level);
  h.drills = { ...(h.drills ?? {}), [id]: drillRank(h, id) + 1 };
  return null;
}

/**
 * Attribute drills: the barracks' permanent training of the four attributes themselves.
 * Unlike the one-off attribute training batches, a rank is a fixed step that stays bought,
 * so the barracks keeps offering something to upgrade long after a hero's gold is spent.
 */
export type AttrId = "str" | "int" | "agi" | "vit";

export interface AttributeDrill {
  id: AttrId;
  name: string;
  /** Attribute points one rank grants. */
  per: number;
  max: number;
  /** Gold of the first rank; every further rank costs more. */
  base: number;
  /** Barracks building level that unlocks the drill. */
  barracks: number;
  desc: string;
}

export const ATTRIBUTE_DRILLS: AttributeDrill[] = [
  { id: "str", name: "Strength", per: 1, max: 10, base: 2200, barracks: 2, desc: "Loaded marches and heavy-bag drills that build raw Strength." },
  { id: "int", name: "Intelligence", per: 1, max: 10, base: 2600, barracks: 5, desc: "Sigil study and warding drills that sharpen Intelligence." },
  { id: "agi", name: "Agility", per: 1, max: 10, base: 3000, barracks: 9, desc: "Balance, reflex and footwork drills that build Agility." },
  { id: "vit", name: "Vitality", per: 1, max: 10, base: 3400, barracks: 13, desc: "Conditioning drills that deepen Vitality and endurance." },
];

/** Attribute drill ranks live beside the other barracks drills, keyed by attribute. */
export interface AttrDrillState extends DrillState { attrDrills?: Record<string, number> }

export const attrDrillRank = (h: Pick<AttrDrillState, "attrDrills">, id: string) => Math.max(0, Math.floor(h.attrDrills?.[id] ?? 0));

/** Gold for the next rank: each rank costs more, and the price scales with the hero's level. */
export const attrDrillCost = (d: AttributeDrill, rank: number, level = 1) => scaledGold(d.base * Math.pow(rank + 1, 1.6), level);

/** What the banked ranks of one attribute drill are worth as text. */
export const attrDrillText = (d: AttributeDrill, ranks = 1) => `+${d.per * ranks} ${d.name}`;

/** Every attribute point the hero's drills have banked, basic and advanced alike. */
export function drillAttrs(h: { attrDrills?: Record<string, number>; advancedDrills?: Record<string, number> }): Record<AttrId, number> {
  const out: Record<AttrId, number> = { str: 0, int: 0, agi: 0, vit: 0 };
  for (const d of ATTRIBUTE_DRILLS) out[d.id] += d.per * attrDrillRank(h, d.id);
  for (const d of ADVANCED_DRILLS) out[d.id] += d.per * advancedRank(h, d.id);
  return out;
}

/** Why the next attribute rank can't be trained, or null when it can. */
export function attrDrillBlocker(h: AttrDrillState, id: string): string | null {
  const d = ATTRIBUTE_DRILLS.find((x) => x.id === id);
  if (!d) return "Unknown drill";
  if (attrDrillRank(h, id) >= d.max) return "Fully drilled";
  if (barracksLevel(h) < d.barracks) return `Requires barracks level ${d.barracks}`;
  if (h.gold < attrDrillCost(d, attrDrillRank(h, id), h.level)) return "Not enough gold";
  return null;
}

/** Buy one rank of an attribute drill with gold. Returns an error message, or null on success. */
export function trainAttributeDrill(h: AttrDrillState, id: string): string | null {
  const blocked = attrDrillBlocker(h, id);
  if (blocked) return blocked;
  const d = ATTRIBUTE_DRILLS.find((x) => x.id === id)!;
  h.gold -= attrDrillCost(d, attrDrillRank(h, id), h.level);
  h.attrDrills = { ...(h.attrDrills ?? {}), [id]: attrDrillRank(h, id) + 1 };
  return null;
}

// ---------- Advanced training (Void Crystals) ----------

/**
 * The barracks' advanced wing. Each rank is a far stronger step than a basic attribute drill —
 * five attribute points — and is paid for in Void Crystals instead of gold. Ranks never end, so a
 * hero always has somewhere to pour the crystals their level-ups and boss kills earn.
 */
export interface AdvancedDrill {
  id: AttrId;
  name: string;
  /** Attribute points one rank grants. */
  per: number;
  /** Void Crystals of the first rank; every further rank costs more. */
  base: number;
  /** Barracks level that opens the advanced wing for this attribute. */
  barracks: number;
  desc: string;
}

export const ADVANCED_DRILLS: AdvancedDrill[] = [
  { id: "str", name: "Strength", per: 5, base: 3, barracks: 15, desc: "Iron discipline: every rank banks five points of Strength." },
  { id: "int", name: "Intelligence", per: 5, base: 3, barracks: 18, desc: "Void-sigil study: every rank banks five points of Intelligence." },
  { id: "agi", name: "Agility", per: 5, base: 3, barracks: 21, desc: "Shadowfoot drills: every rank banks five points of Agility." },
  { id: "vit", name: "Vitality", per: 5, base: 3, barracks: 24, desc: "Deep-void conditioning: every rank banks five points of Vitality." },
];

/** What advanced training needs to begin. */
export interface AdvancedState {
  advancedDrills?: Record<string, number>;
  buildings?: Record<string, number>;
  voidCrystals?: number;
}

export const advancedRank = (h: Pick<AdvancedState, "advancedDrills">, id: string) =>
  Math.max(0, Math.floor(h.advancedDrills?.[id] ?? 0));

/** Ranks a barracks this deep has drilled into its advanced wing (a small crystal discount from level 40). */
export const advancedDiscount = (barracks: number) => (barracks >= 40 ? 0.85 : 1);

/** Void Crystals for the next rank: every rank costs more than the last. */
export const advancedCost = (d: AdvancedDrill, rank: number, barracks = 1) =>
  Math.max(1, Math.round((d.base + rank * 2.2) * advancedDiscount(barracks)));

/** Why the next advanced rank can't be trained, or null when it can. */
export function advancedBlocker(h: AdvancedState, id: string): string | null {
  const d = ADVANCED_DRILLS.find((x) => x.id === id);
  if (!d) return "Unknown drill";
  if (barracksLevel(h) < d.barracks) return `Requires barracks level ${d.barracks}`;
  if ((h.voidCrystals ?? 0) < advancedCost(d, advancedRank(h, id), barracksLevel(h))) return "Not enough Void Crystals";
  return null;
}

/** Spend Void Crystals on one advanced rank. Returns an error message, or null on success. */
export function trainAdvanced(h: AdvancedState, id: string): string | null {
  const blocked = advancedBlocker(h, id);
  if (blocked) return blocked;
  const d = ADVANCED_DRILLS.find((x) => x.id === id)!;
  h.voidCrystals = (h.voidCrystals ?? 0) - advancedCost(d, advancedRank(h, id), barracksLevel(h));
  h.advancedDrills = { ...(h.advancedDrills ?? {}), [id]: advancedRank(h, id) + 1 };
  return null;
}

// ---------- Individual stat training (gold) ----------

/**
 * Individual stat trainings: the reworked barracks attribute training. Instead of four bundled
 * attributes (Str/Int/Agi/Vit), each combat stat is its own permanent gold-paid track. Every rank
 * banks a fixed percentage bonus that feeds the shared stat pipeline through statTrainFx.
 * Gold scaling is capped at rank 5 and only costs gold; all others are open-ended.
 */
export interface StatTraining {
  id: string;
  name: string;
  /** BonusFx key this training contributes to. */
  stat: StatKey;
  /** Bonus per rank, in the stat's own unit (percent). */
  per: number;
  max: number;
  /** Gold of the first rank; every further rank costs more. */
  base: number;
  /** Barracks building level that unlocks this training. */
  barracks: number;
  desc: string;
}

export const STAT_TRAININGS: StatTraining[] = [
  // Physical group
  { id: "physAtk", name: "Physical Attack", stat: "atkPct", per: 1, max: 10, base: 800, barracks: 1, desc: "Heavy-bag drills that sharpen every swing." },
  { id: "physDef", name: "Physical Defense", stat: "defPct", per: 1, max: 10, base: 800, barracks: 1, desc: "Locking shields, rank after rank." },
  { id: "critDmg", name: "Crit Damage", stat: "critDmg", per: 3, max: 10, base: 1200, barracks: 3, desc: "Reading the opening in a guard for deeper strikes." },
  { id: "physPen", name: "Armor Pen", stat: "pen", per: 0.5, max: 8, base: 1000, barracks: 5, desc: "Piercing drills that punch clean through armour." },
  // Magic group
  { id: "magAtk", name: "Magic Attack", stat: "matkPct", per: 1, max: 10, base: 900, barracks: 2, desc: "Sigil study that sharpens spell power." },
  { id: "magDef", name: "Magic Defense", stat: "mdefPct", per: 1, max: 10, base: 900, barracks: 3, desc: "Warding drills that harden against magic." },
  { id: "magPen", name: "Magic Pen", stat: "mpen", per: 0.5, max: 8, base: 1100, barracks: 6, desc: "Runebind drills that carve through magical defences." },
  // Agility group
  { id: "crit", name: "Crit Chance", stat: "crit", per: 0.5, max: 10, base: 1000, barracks: 4, desc: "Focus drills that find the weak point." },
  { id: "dodge", name: "Dodge", stat: "dodge", per: 0.5, max: 8, base: 1000, barracks: 6, desc: "Footwork that leaves a blade cutting air." },
  { id: "accuracy", name: "Accuracy", stat: "acc", per: 0.5, max: 8, base: 1000, barracks: 5, desc: "Marksman drills — nothing but the mark." },
  { id: "loot", name: "Loot Chance", stat: "loot", per: 1, max: 10, base: 1500, barracks: 8, desc: "Scavenger drills that find more gear in the field." },
  // Health
  { id: "health", name: "Health", stat: "hpPct", per: 2, max: 10, base: 700, barracks: 1, desc: "Conditioning drills that widen your well of life." },
  // Gold scaling — capped at 5, gold only
  { id: "goldScale", name: "Gold Scaling", stat: "goldScale", per: 5, max: 5, base: 5000, barracks: 10, desc: "Quartermaster drills that squeeze more gold from every victory." },
];

/** State needed to read and train individual stat ranks. */
export interface StatTrainState {
  statTrains?: Record<string, number>;
  buildings?: Record<string, number>;
  gold: number;
  level: number;
}

export const statTrainRank = (h: Pick<StatTrainState, "statTrains">, id: string) =>
  Math.max(0, Math.floor(h.statTrains?.[id] ?? 0));

/** Gold for the next rank: each rank costs more, scaled by the hero's level. */
export const statTrainCost = (d: StatTraining, rank: number, level = 1) =>
  scaledGold(d.base * Math.pow(rank + 1, 1.6), level);

/** Every bonus the hero's individual stat trainings grant, in the shared bonus shape. */
export function statTrainFx(h: Pick<StatTrainState, "statTrains">): BonusFx {
  const out = zeroFx();
  for (const d of STAT_TRAININGS) {
    const r = statTrainRank(h, d.id);
    if (r > 0) out[d.stat] += d.per * r;
  }
  return out;
}

/** Why the next rank can't be trained, or null when it can. */
export function statTrainBlocker(h: StatTrainState, id: string): string | null {
  const d = STAT_TRAININGS.find((x) => x.id === id);
  if (!d) return "Unknown training";
  if (statTrainRank(h, id) >= d.max) return "Fully trained";
  if (barracksLevel(h) < d.barracks) return `Requires barracks level ${d.barracks}`;
  if (h.gold < statTrainCost(d, statTrainRank(h, id), h.level)) return "Not enough gold";
  return null;
}

/** Buy one rank of an individual stat training with gold. Returns an error message, or null on success. */
export function trainStat(h: StatTrainState, id: string): string | null {
  const blocked = statTrainBlocker(h, id);
  if (blocked) return blocked;
  const d = STAT_TRAININGS.find((x) => x.id === id)!;
  h.gold -= statTrainCost(d, statTrainRank(h, id), h.level);
  h.statTrains = { ...(h.statTrains ?? {}), [id]: statTrainRank(h, id) + 1 };
  return null;
}
