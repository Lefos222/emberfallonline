import type { Hero } from "./data";

/**
 * The Blood Arena's fight allowance: five duels every twelve hours.
 *
 * A window opens with the hero's first duel and refills twelve hours later, so the allowance is
 * never banked — waiting a day still pays five duels, not ten. A duel is spent on entry, win or
 * lose, like the Dungeon Gate's stamina, and the window lives in the save with the other counters.
 */

export const ARENA_PER_WINDOW = 5;
export const ARENA_WINDOW_MS = 12 * 60 * 60 * 1000;

export interface ArenaAllowance { arena?: { windowStart?: number; used?: number } }

/** When the current window opened, or 0 when there is no live window (never fought, or it lapsed). */
function liveWindow(h: ArenaAllowance, now: number) {
  const start = Math.floor(h.arena?.windowStart ?? 0);
  if (!Number.isFinite(start) || start <= 0) return 0;
  return now >= start && now - start < ARENA_WINDOW_MS ? start : 0;
}

/** Duels already spent in the current window. */
export function arenaFightsUsed(h: ArenaAllowance, now = Date.now()) {
  return liveWindow(h, now) ? Math.max(0, Math.floor(h.arena?.used ?? 0)) : 0;
}

/** Duels still available before the window refills. */
export const arenaFightsLeft = (h: ArenaAllowance, now = Date.now()) =>
  Math.max(0, ARENA_PER_WINDOW - arenaFightsUsed(h, now));

/** When the allowance returns: the end of the current window, or now when none is running. */
export function arenaResetAt(h: ArenaAllowance, now = Date.now()) {
  const start = liveWindow(h, now);
  return start ? start + ARENA_WINDOW_MS : now;
}

/** "4h 12m" / "9m" — how long until the allowance returns. */
export function waitLabel(ms: number) {
  const mins = Math.max(0, Math.ceil(ms / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** Why the hero cannot enter the arena, or null while a duel is available. */
export function arenaBlocker(h: ArenaAllowance, now = Date.now()): string | null {
  if (arenaFightsLeft(h, now) > 0) return null;
  return `No arena fights left — ${ARENA_PER_WINDOW} every 12 hours. The pit reopens in ${waitLabel(arenaResetAt(h, now) - now)}.`;
}

/** Spend one duel of the current window, opening a new one when the last has lapsed. */
export function spendArenaFight(h: Hero, now = Date.now()) {
  const start = liveWindow(h, now);
  h.arena = { windowStart: start || now, used: arenaFightsUsed(h, now) + 1 };
}
