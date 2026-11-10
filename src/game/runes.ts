import { addFx, zeroFx, matCount, type BonusFx, type Mat } from "./crafting";
import type { Hero } from "./data";
import { scaledGold } from "./gold";
import flame from "@/assets/runes/flame.webp";
import life from "@/assets/runes/life.webp";
import shield from "@/assets/runes/shield.webp";
import star from "@/assets/runes/star.webp";
import wind from "@/assets/runes/wind.webp";
import fang from "@/assets/runes/fang.webp";

/**
 * Runes: six carved stones inscribed with the new crystals and gold. Every rank is a permanent
 * percentage bonus that joins `computeStats`' shared pipeline beside Renown, so no second stat
 * engine exists. Ranks are saved in `hero.runes`.
 */
export interface Rune { id: string; name: string; desc: string; stat: keyof BonusFx; per: number; img: string }

export const RUNE_MAX = 10;
export const RUNES: Rune[] = [
  { id: "flame", name: "Flame Rune", desc: "Physical and magic attack.", stat: "atkPct", per: 1.2, img: flame },
  { id: "life", name: "Life Rune", desc: "Maximum health.", stat: "hpPct", per: 1.5, img: life },
  { id: "shield", name: "Shield Rune", desc: "Defence.", stat: "defPct", per: 1.2, img: shield },
  { id: "star", name: "Star Rune", desc: "Critical chance.", stat: "crit", per: 0.4, img: star },
  { id: "wind", name: "Wind Rune", desc: "Dodge chance.", stat: "dodge", per: 0.4, img: wind },
  { id: "fang", name: "Fang Rune", desc: "Critical damage.", stat: "critDmg", per: 1.5, img: fang },
];

export const runeRank = (h: Pick<Hero, "runes">, id: string) => Math.max(0, Math.min(RUNE_MAX, Math.floor(h.runes?.[id] ?? 0)));

/** Cost of carving the next rank (rank = the current rank, 0-9). */
export function runeCost(rank: number, level = 1): { gold: number; mats: Partial<Record<Mat, number>> } {
  const mats: Partial<Record<Mat, number>> = { frostCrystal: 2 + rank * 2 };
  if (rank >= 4) mats.voidCrystal = rank - 2;
  if (rank >= 8) mats.sunCrystal = rank - 6;
  return { gold: scaledGold(5000 * (rank + 1) * (rank + 1), level), mats };
}

export function runeBlocker(h: Hero, id: string): string | null {
  if (!RUNES.some((r) => r.id === id)) return "Unknown rune";
  const rank = runeRank(h, id);
  if (rank >= RUNE_MAX) return "Fully carved";
  const c = runeCost(rank, h.level);
  if (h.gold < c.gold) return "Not enough gold";
  for (const [k, v] of Object.entries(c.mats) as [Mat, number][]) if (matCount(h, k) < v) return "Not enough crystals";
  return null;
}

export function carveRune(h: Hero, id: string): string | null {
  const err = runeBlocker(h, id);
  if (err) return err;
  const rank = runeRank(h, id);
  const c = runeCost(rank, h.level);
  h.gold -= c.gold;
  h.mats = { ...(h.mats ?? {}) };
  for (const [k, v] of Object.entries(c.mats) as [Mat, number][]) h.mats[k] = matCount(h, k) - v;
  h.runes = { ...(h.runes ?? {}), [id]: rank + 1 };
  return null;
}

export function runeFx(h: Pick<Hero, "runes">): BonusFx {
  const out = zeroFx();
  for (const r of RUNES) { const n = runeRank(h, r.id); if (n) addFx(out, { [r.stat]: r.per * n }); }
  return out;
}
