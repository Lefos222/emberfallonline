import type { Hero } from "./data";
import { scaledGold } from "./gold";

type Levels = { buildings?: Record<string, number> };

/** The barracks has no final level: every grade keeps training the army harder for the rest of the game. */
export function barracksLevel(h: Levels): number {
  return Math.max(1, Math.floor(h.buildings?.["barracks"] ?? 1));
}
/** Gold to go from `level` to `level + 1`, scaled by the hero's own level like every other gold price. */
export const barracksCost = (level: number, heroLevel = 1) => scaledGold(160 * Math.pow(level, 1.35), heroLevel);
/** Every level drills the troops harder: 2% cheaper training per level, with extra instructor grades at 20, 25 and 30. */
export function trainingDiscount(h: Levels): number {
  const l = barracksLevel(h);
  const grades = (l >= 20 ? 0.05 : 0) + (l >= 25 ? 0.05 : 0) + (l >= 30 ? 0.05 : 0);
  return Math.min(0.6, (l - 1) * 0.02 + grades);
}
/** Batch sizes the barracks has drilled up to. */
export function batchSizes(h: Levels): number[] {
  const l = barracksLevel(h);
  return BATCH_UNLOCKS.filter((b) => l >= b.level).map((b) => b.size);
}
export const BATCH_UNLOCKS: { level: number; size: number }[] = [
  { level: 1, size: 1 },
  { level: 3, size: 5 },
  { level: 6, size: 10 },
  { level: 10, size: 25 },
  { level: 15, size: 50 },
  { level: 25, size: 100 },
];
export const BARRACKS_UNLOCKS: { level: number; name: string; desc: string }[] = [
  { level: 3, name: "Squad drills", desc: "+5 points in one training batch" },
  { level: 6, name: "Company drills", desc: "+10 points in one training batch" },
  { level: 10, name: "Legion drills", desc: "+25 points in one training batch" },
  { level: 15, name: "Warband drills", desc: "+50 points in one training batch" },
  { level: 20, name: "Instructor corps", desc: "Training gold cost drops a further 5%" },
  { level: 25, name: "Field battalions", desc: "+100 points in one training batch" },
  { level: 30, name: "Elite instructors", desc: "Training gold cost drops a further 5%" },
  { level: 40, name: "Void drillmasters", desc: "Advanced training ranks cost less crystal" },
  { level: 50, name: "Grandmasters at arms", desc: "Training gold cost drops a further 5%" },
];
/** Spend gold to raise the barracks one level. Returns an error string, or null on success. */
export function upgradeBarracks(h: Hero): string | null {
  const level = barracksLevel(h);
  const cost = barracksCost(level, h.level);
  if (h.gold < cost) return "Not enough gold";
  h.gold -= cost;
  h.buildings = { ...(h.buildings ?? {}), barracks: level + 1 };
  return null;
}
