import type { Hero } from "./data";
import { scaledGold } from "./gold";

/**
 * The Gold Mine: the building beside the Guild Hall. It is the castle's offline earner — the
 * mine banks gold every hour whether the hero is in the game or not, and the hero collects the
 * cart whenever they like. The cart holds a full day of production, so a nightly visit keeps it
 * earning, and the ladder runs to Level 40 so the mine keeps pace with the whole game.
 *
 * Everything that decides the mine's economy lives here: the hourly rate, the cart's capacity and
 * the upgrade ladder. Banked gold is a timestamp plus its total (`hero.mine`), so it survives a
 * refresh and keeps filling while the player is away.
 */

/** The mine's top upgrade level. */
export const MINE_MAX_LEVEL = 40;

/** Hours of production the cart holds before it stops filling. */
export const MINE_STORE_HOURS = 24;

/** Gold the mine banks each hour: 240 at Level 1, rising with every upgrade. */
export const minePerHour = (level: number) =>
  Math.round(240 * Math.pow(clampLevel(level), 1.35));

/** Most gold the cart can hold at a level — a full day of production. */
export const mineCapacity = (level: number) => minePerHour(level) * MINE_STORE_HOURS;

/** Gold the next upgrade costs; scaled for the hero's level like every other gold price. */
export const mineUpgradeCost = (level: number, heroLevel = 1) =>
  scaledGold(Math.round(900 * Math.pow(clampLevel(level), 2)), heroLevel);

export interface MineState {
  level?: number;
  /** Gold banked at `lastAt`, before the time since then is counted. */
  stored?: number;
  /** Epoch milliseconds the cart's total was last brought up to date. */
  lastAt?: number;
}

const clampLevel = (level: number) =>
  Math.max(1, Math.min(MINE_MAX_LEVEL, Number.isFinite(level) ? Math.floor(level) : 1));

const safeWhole = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) ? Math.floor(value) : fallback;

/** The mine's upgrade level. */
export const mineLevel = (h: Pick<Hero, "mine">) => clampLevel(h.mine?.level ?? 1);

export interface MineStatus {
  level: number;
  perHour: number;
  /** Gold waiting in the cart right now. */
  stored: number;
  capacity: number;
  /** Share of the cart that is full, 0-1. */
  fill: number;
  /** True when the cart is full and production has stopped. */
  full: boolean;
  /** Milliseconds until the cart is full (0 when it already is). */
  msToFull: number;
  maxed: boolean;
  /** Cost of the next upgrade, or null at the top of the ladder. */
  upgradeCost: number | null;
  nextPerHour: number | null;
}

/** Read-only view of the mine, counting the time since the cart was last banked. */
export function mineStatus(h: Pick<Hero, "mine">, heroLevel = 1, now = Date.now()): MineStatus {
  const level = mineLevel(h);
  const perHour = minePerHour(level);
  const capacity = mineCapacity(level);
  const lastAt = Math.max(0, safeWhole(h.mine?.lastAt, 0));
  const banked = Math.max(0, Math.min(capacity, Number(h.mine?.stored ?? 0)));
  const elapsed = lastAt > 0 ? Math.max(0, now - lastAt) : 0;
  const stored = Math.min(capacity, banked + (perHour * elapsed) / 3_600_000);
  const missing = Math.max(0, capacity - stored);
  const maxed = level >= MINE_MAX_LEVEL;
  return {
    level,
    perHour,
    stored,
    capacity,
    fill: capacity > 0 ? Math.min(1, stored / capacity) : 0,
    full: missing <= 0.5,
    msToFull: perHour > 0 ? Math.round((missing / perHour) * 3_600_000) : 0,
    maxed,
    upgradeCost: maxed ? null : mineUpgradeCost(level, heroLevel),
    nextPerHour: maxed ? null : minePerHour(level + 1),
  };
}

/** The hero's mine, created or repaired in place for saves that predate the building. */
export function ensureMine(h: Hero, now = Date.now()): Required<MineState> {
  const current = h.mine ?? {};
  const mine: Required<MineState> = {
    level: clampLevel(current.level ?? 1),
    stored: Math.max(0, safeWhole(current.stored, 0)),
    lastAt: Math.max(0, safeWhole(current.lastAt, 0)) || now,
  };
  h.mine = mine;
  return mine;
}

/** Normalize the mine from an older save without touching anything else on the hero. */
export function normalizeMine(h: Hero, now = Date.now()) {
  ensureMine(h, now);
}

/** Bank everything the cart has earned so far and return its total. */
function bank(h: Hero, now: number) {
  const mine = ensureMine(h, now);
  const level = mineLevel(h);
  const stored = Math.min(mineCapacity(level), mine.stored + (minePerHour(level) * Math.max(0, now - mine.lastAt)) / 3_600_000);
  mine.stored = stored;
  mine.lastAt = now;
  return stored;
}

export interface MineCollect {
  gold: number;
  /** True when the cart was full, so some of a further hour was lost. */
  overflowed: boolean;
}

/** Collect the cart. Returns null when there is nothing worth collecting yet. */
export function collectMine(h: Hero, now = Date.now()): MineCollect | null {
  const level = mineLevel(h);
  const full = bank(h, now);
  const gold = Math.floor(full);
  if (gold < 1) return null;
  h.gold += gold;
  const mine = ensureMine(h, now);
  mine.stored = Math.max(0, full - gold);
  mine.lastAt = now;
  return { gold, overflowed: full >= mineCapacity(level) - 0.5 };
}

/** Upgrade the mine one level, paying with gold. Returns an error string, or null on success. */
export function upgradeMine(h: Hero, now = Date.now()): string | null {
  const level = mineLevel(h);
  if (level >= MINE_MAX_LEVEL) return "The Gold Mine is already at its highest level";
  const cost = mineUpgradeCost(level, h.level);
  if (!Number.isFinite(h.gold) || h.gold < cost) return `Not enough gold — ${cost.toLocaleString()} needed`;
  // Bank what the old level has already earned before the rate and capacity change.
  bank(h, now);
  const mine = ensureMine(h, now);
  h.gold -= cost;
  mine.level = level + 1;
  return null;
}
