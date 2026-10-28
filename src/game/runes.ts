import { scaledGold } from "./gold";
import { matCount, type BonusFx, type Mat, zeroFx, STAT_LABEL, type StatKey } from "./crafting";

/**
 * Runes: a standalone enhancement board separate from gear gems.
 * Runes are crafted from materials and socketed into rune slots that
 * unlock as the hero levels up. Each rune type gives a unique stat bonus
 * and can be upgraded by combining duplicates.
 */

export type RuneType = "fire" | "frost" | "lightning" | "earth" | "wind" | "shadow" | "light" | "void" | "blood" | "soul";

export interface RuneDef {
  id: RuneType;
  name: string;
  desc: string;
  stat: StatKey;
  per: number; // bonus per tier
  color: string;
}

export const RUNES: Record<RuneType, RuneDef> = {
  fire: { id: "fire", name: "Rune of Fire", desc: "Burns with relentless offensive power.", stat: "atkPct", per: 2, color: "#e2522a" },
  frost: { id: "frost", name: "Rune of Frost", desc: "Hardens the body against all harm.", stat: "defPct", per: 2, color: "#5bb8f0" },
  lightning: { id: "lightning", name: "Rune of Lightning", desc: "Crackling precision that finds every gap.", stat: "crit", per: 0.6, color: "#facc15" },
  earth: { id: "earth", name: "Rune of Earth", desc: "Roots you deep, thickening your hide.", stat: "hpPct", per: 2.5, color: "#a67c3a" },
  wind: { id: "wind", name: "Rune of Wind", desc: "Slips through strikes like a passing breeze.", stat: "dodge", per: 0.5, color: "#7dd3a0" },
  shadow: { id: "shadow", name: "Rune of Shadow", desc: "Darkness that deepens every wound.", stat: "critDmg", per: 3, color: "#8b5cf6" },
  light: { id: "light", name: "Rune of Light", desc: "Radiant mending that closes wounds.", stat: "heal", per: 2, color: "#fde68a" },
  void: { id: "void", name: "Rune of the Void", desc: "Punctures through armor and ward alike.", stat: "pen", per: 0.5, color: "#4c1d95" },
  blood: { id: "blood", name: "Rune of Blood", desc: "Fuel for the magic that burns within.", stat: "matkPct", per: 2, color: "#dc2626" },
  soul: { id: "soul", name: "Rune of the Soul", desc: "Guards the spirit against hostile magic.", stat: "mdefPct", per: 2, color: "#60a5fa" },
};

export const RUNE_TYPES = Object.keys(RUNES) as RuneType[];
export const RUNE_MAX_TIER = 6;
export const RUNE_TIER_NAMES = ["Crude", "Carved", "Inscribed", "Glowing", "Radiant", "Mythic"];
export const RUNE_SLOTS = 6;
/** Rune slots unlock progressively: slots 1-2 at level 1, then every 10 levels. */
export const RUNE_SLOT_LEVELS = [1, 1, 10, 20, 30, 40];

/** Rune key format: "fire:3" (type:tier). */
export const runeKey = (t: RuneType, tier: number) => `${t}:${tier}`;
export function parseRune(k: string): { type: RuneType; tier: number } | null {
  const [t, n] = k.split(":");
  const tier = Number(n);
  return t in RUNES && tier >= 1 && tier <= RUNE_MAX_TIER ? { type: t as RuneType, tier } : null;
}
export const runeName = (k: string) => { const r = parseRune(k); return r ? `${RUNE_TIER_NAMES[r.tier - 1]} ${RUNES[r.type].name}` : "?"; };
export const runeValue = (k: string) => { const r = parseRune(k); return r ? +(RUNES[r.type].per * r.tier).toFixed(1) : 0; };
export const runeStatText = (k: string) => { const r = parseRune(k); return r ? `+${runeValue(k)}${STAT_LABEL[RUNES[r.type].stat]}` : ""; };
export const runeColor = (k: string) => { const r = parseRune(k); return r ? RUNES[r.type].color : "#888"; };

/** Crafting a rune costs gold + materials; random type at base cost, targeted at triple. */
export const RUNE_CRAFT_COST = { ore: 10, gold: 300 };
export const RUNE_TARGET_COST = { ore: 30, gold: 900, essence: 1 };

export function runeCraftCost(level = 1, type?: RuneType) {
  const c = type ? RUNE_TARGET_COST : { ...RUNE_CRAFT_COST, essence: 0 };
  return { ore: c.ore, gold: scaledGold(c.gold, level), essence: c.essence };
}

interface RuneState {
  level: number; gold: number;
  mats?: Partial<Record<Mat, number>>;
  runes?: Record<string, number>; // pouch: key -> count
  runeBoard?: (string | null)[]; // equipped rune keys
}

export function craftRune(h: RuneState, rand = Math.random, type?: RuneType): string | null {
  const c = runeCraftCost(h.level, type);
  if (matCount(h, "ore") < c.ore) return "Not enough Ember Ore";
  if (h.gold < c.gold) return "Not enough gold";
  if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
  h.gold -= c.gold;
  h.mats = { ...(h.mats ?? {}) };
  h.mats.ore = (h.mats.ore ?? 0) - c.ore;
  h.mats.essence = (h.mats.essence ?? 0) - c.essence;
  const k = runeKey(type ?? RUNE_TYPES[Math.floor(rand() * RUNE_TYPES.length)], 1);
  h.runes = { ...(h.runes ?? {}), [k]: (h.runes?.[k] ?? 0) + 1 };
  return null;
}

export const RUNE_FUSE_COUNT = 3;
export function runeFuseCost(tier: number, level = 1) {
  return { gold: scaledGold(300 * tier * tier, level), essence: tier };
}

export function fuseRune(h: RuneState, key: string): string | null {
  const r = parseRune(key);
  if (!r) return "Invalid rune";
  if (r.tier >= RUNE_MAX_TIER) return "Already max tier";
  if ((h.runes?.[key] ?? 0) < RUNE_FUSE_COUNT) return `Needs ${RUNE_FUSE_COUNT} of this rune`;
  const c = runeFuseCost(r.tier, h.level);
  if (h.gold < c.gold) return "Not enough gold";
  if (matCount(h, "essence") < c.essence) return "Not enough Soul Essence";
  h.gold -= c.gold;
  h.mats = { ...(h.mats ?? {}) };
  h.mats.essence = (h.mats.essence ?? 0) - c.essence;
  const next = runeKey(r.type, r.tier + 1);
  h.runes = { ...h.runes, [key]: h.runes![key] - RUNE_FUSE_COUNT, [next]: (h.runes?.[next] ?? 0) + 1 };
  return null;
}

export function equipRune(h: { level: number; runes?: Record<string, number>; runeBoard?: (string | null)[] }, key: string, slot: number): string | null {
  if (slot < 0 || slot >= RUNE_SLOTS) return "No such slot";
  if (h.level < RUNE_SLOT_LEVELS[slot]) return `Slot ${slot + 1} unlocks at level ${RUNE_SLOT_LEVELS[slot]}`;
  if (!parseRune(key)) return "Invalid rune";
  if ((h.runes?.[key] ?? 0) < 1) return "You don't own that rune";
  const board = Array.from({ length: RUNE_SLOTS }, (_, i) => h.runeBoard?.[i] ?? null);
  // Return any rune currently in this slot to the pouch
  if (board[slot]) {
    const oldKey = board[slot]!;
    h.runes = { ...(h.runes ?? {}), [oldKey]: (h.runes?.[oldKey] ?? 0) + 1 };
  }
  board[slot] = key;
  h.runeBoard = board;
  h.runes = { ...h.runes, [key]: h.runes![key] - 1 };
  return null;
}

export function unequipRune(h: { runes?: Record<string, number>; runeBoard?: (string | null)[] }, slot: number): string | null {
  const board = Array.from({ length: RUNE_SLOTS }, (_, i) => h.runeBoard?.[i] ?? null);
  const key = board[slot];
  if (!key) return "Slot is empty";
  board[slot] = null;
  h.runeBoard = board;
  h.runes = { ...(h.runes ?? {}), [key]: (h.runes?.[key] ?? 0) + 1 };
  return null;
}

/** Combat bonus from equipped runes. */
export function runeFx(h: { runeBoard?: (string | null)[] }): BonusFx {
  const out = zeroFx();
  for (const key of h.runeBoard ?? []) {
    const r = key && parseRune(key);
    if (r) out[RUNES[r.type].stat] += runeValue(key!);
  }
  return out;
}

export const runePower = (h: { runeBoard?: (string | null)[] }) => {
  const fx = runeFx(h);
  return Math.round((fx.atkPct + fx.matkPct) * 10 + (fx.defPct + fx.mdefPct) * 8 + fx.hpPct * 6 + fx.crit * 20 + fx.critDmg * 5 + fx.pen * 15);
};
