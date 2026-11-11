import { addMats } from "./crafting";
import type { Hero } from "./data";

/** Minigame Hall pastimes (fishing lives here too, with its own limit in fishing.ts). */
export type MinigameId = "runes" | "archery" | "dice";
export const MINIGAME_PLAYS: Record<MinigameId, number> = { runes: 5, archery: 5, dice: 5 };

const day = () => new Date().toISOString().slice(0, 10);

export function playsLeft(h: Pick<Hero, "minigames">, id: MinigameId): number {
  const m = h.minigames;
  const used = m && m.day === day() ? m.plays[id] ?? 0 : 0;
  return Math.max(0, MINIGAME_PLAYS[id] - used);
}

/** Gold for a score 0..1, scaled gently with level; a strong round also pays a few materials. */
export function minigameGold(level: number, score: number) {
  return Math.round(200 * Math.max(0, Math.min(1, score)) * (1 + Math.max(1, level) * 0.02));
}

/** Spends one play and pays for the score. Returns the gold paid, or null when no plays are left. */
export function playMinigame(h: Hero, id: MinigameId, score: number): number | null {
  if (playsLeft(h, id) <= 0) return null;
  const today = day();
  const m = h.minigames && h.minigames.day === today ? h.minigames : { day: today, plays: {} };
  m.plays[id] = (m.plays[id] ?? 0) + 1;
  h.minigames = { day: m.day, plays: { ...m.plays } };
  const g = minigameGold(h.level, score);
  h.gold += g;
  if (score >= 0.8) addMats(h, id === "runes" ? { crystal: 1 } : id === "archery" ? { hide: 3 } : { bloom: 3 });
  return g;
}
