import { scaledGold } from "./gold";
import { barracksLevel } from "./barracks";
import type { BonusFx } from "./crafting";

/**
 * Barracks drills: the permanent training tracks the barracks offers beside the four attributes.
 * Each rank is bought with gold, so the building keeps being worth upgrading long after the
 * attribute training is done. The bonuses feed straight into the shared stat computation.
 */
export type DrillStat = "atkPct" | "defPct" | "hpPct" | "crit" | "acc" | "dodge";

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
};

export const DRILLS: Drill[] = [
  { id: "weapons", name: "Weapon Drill", stat: "atkPct", per: 1, max: 10, base: 900, barracks: 1, desc: "Drill every swing until the arm never tires." },
  { id: "shields", name: "Shield Wall Drill", stat: "defPct", per: 1, max: 10, base: 900, barracks: 3, desc: "Locking shields, rank after rank." },
  { id: "endurance", name: "Endurance Runs", stat: "hpPct", per: 1.5, max: 10, base: 1100, barracks: 6, desc: "Long marches that harden the body." },
  { id: "focus", name: "Focus Drills", stat: "crit", per: 0.5, max: 10, base: 1300, barracks: 10, desc: "Reading the opening in a guard." },
  { id: "marksman", name: "Marksman Drill", stat: "acc", per: 0.5, max: 8, base: 1000, barracks: 14, desc: "Nothing but the mark and the breath." },
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
