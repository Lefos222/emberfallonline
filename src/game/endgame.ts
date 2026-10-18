import { stageFoe, type Foe } from "./data";
import { TIER_BOSSES, BESTIARY, enemySprite, type SpriteRect, type TierBossId } from "./world";

export const ENDGAME_LEVEL = 20;
export const MAX_DIFFICULTY = 10;

export interface Modifier { id: string; name: string; desc: string; hp: number; atk: number; def: number; crit: number; reward: number }
export const MODIFIERS: Modifier[] = [
  { id: "frenzy", name: "Frenzy", desc: "Enemies hit 25% harder", hp: 1, atk: 1.25, def: 1, crit: 0, reward: 1.2 },
  { id: "bulwark", name: "Bulwark", desc: "Enemies have +40% defense", hp: 1, atk: 1, def: 1.4, crit: 0, reward: 1.15 },
  { id: "titan", name: "Titanic", desc: "Enemies have +50% health", hp: 1.5, atk: 1, def: 1, crit: 0, reward: 1.25 },
  { id: "deadly", name: "Deadly Precision", desc: "Enemies gain +15% crit", hp: 1, atk: 1, def: 1, crit: 15, reward: 1.15 },
];

/** ISO-like week index (UTC, weeks start Monday). */
export function weekIndex(now = Date.now()) {
  // Day 0 (1970-01-01) was a Thursday; +3 days aligns week boundaries to Monday 00:00 UTC.
  return Math.floor((Math.floor(now / 86400000) + 3) / 7);
}
export const weeklyModifier = (week: number) => MODIFIERS[((week % MODIFIERS.length) + MODIFIERS.length) % MODIFIERS.length];

export interface EndgameState { level: number; paragon: number; challenges?: Record<string, number>; weekly?: { week: number; kills: number; claimed: boolean } }

export const BOSS_ORDER: TierBossId[] = ["aegis", "gorefiend", "tenebris", "vulkan"];
/** Highest difficulty cleared for a boss (0 = none). Next difficulty unlocks after clearing the previous one. */
export const cleared = (h: EndgameState, id: string) => h.challenges?.[id] ?? 0;
export const bossUnlocked = (h: EndgameState, i: number) => i === 0 || cleared(h, BOSS_ORDER[i - 1]) >= 1;

export function challengeFoe(id: TierBossId, difficulty: number, mod: Modifier): Foe & { sprite: SpriteRect } {
  const i = BOSS_ORDER.indexOf(id);
  const stage = 20 + i * 6 + difficulty * 8;
  const f = stageFoe(stage % 10 === 0 ? stage + 1 : stage, 1 + difficulty * 0.12);
  return {
    ...f, name: `${TIER_BOSSES[id].name} · D${difficulty}`, boss: true, sprite: TIER_BOSSES[id].sprite,
    hp: Math.round(f.hp * 3.2 * mod.hp), atk: Math.round(f.atk * 1.3 * mod.atk), def: Math.round(f.def * 1.2 * mod.def), crit: Math.min(60, f.crit + mod.crit),
  };
}

export function challengeRewards(id: TierBossId, difficulty: number, mod: Modifier) {
  const i = BOSS_ORDER.indexOf(id);
  const m = mod.reward * (1 + i * 0.25);
  return {
    gold: Math.round(1500 * difficulty * difficulty * m),
    xp: Math.round(800 * difficulty * difficulty * m),
    bossCore: difficulty >= 3 ? Math.ceil(difficulty / 3) : 0,
    /** Minimum gear rarity from this clear: Legendary from D5, Mythic from D8. */
    minRarity: difficulty >= 8 ? 5 : difficulty >= 5 ? 4 : 3,
  };
}

/** Elite: a random bestiary monster with an elite prefix, at the hero's level. */
export const ELITE_PREFIX = ["Elite", "Enraged", "Ancient", "Corrupted"];
export function eliteFoe(level: number, rand = Math.random): Foe & { sprite: SpriteRect } {
  const row = Math.floor(rand() * BESTIARY.length), col = Math.floor(rand() * 12);
  const f = stageFoe(Math.max(11, level + 4) % 10 === 0 ? level + 5 : Math.max(11, level + 4), 1.6);
  return { ...f, boss: false, name: `${ELITE_PREFIX[Math.floor(rand() * ELITE_PREFIX.length)]} ${BESTIARY[row][col]}`, sprite: enemySprite(row, col) };
}

export const WEEKLY_GOAL = 5;
export const WEEKLY_REWARD = { gold: 15000, starshard: 20, bossCore: 3 };
/** Normalizes the weekly tracker to the current week (resets progress on a new week). */
export function currentWeekly(h: EndgameState, now = Date.now()) {
  const w = weekIndex(now);
  return h.weekly && h.weekly.week === w ? h.weekly : { week: w, kills: 0, claimed: false };
}
export function addWeeklyKill(h: EndgameState, now = Date.now()) {
  const cur = currentWeekly(h, now);
  h.weekly = { ...cur, kills: cur.kills + 1 };
}
export function canClaimWeekly(h: EndgameState, now = Date.now()) {
  const cur = currentWeekly(h, now);
  return cur.kills >= WEEKLY_GOAL && !cur.claimed;
}
