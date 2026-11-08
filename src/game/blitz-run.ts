import type { Hero } from "./data";
import { grant } from "./logic";

/**
 * A blitz is a run, not an instant payout: starting one sends the hero out for ten
 * minutes. The rewards land when the run ends, every battle is locked while it lasts,
 * and 25 Diamonds finish it on the spot.
 */

/** How long a blitz run takes. */
export const BLITZ_DURATION_MS = 10 * 60_000;

/** Version 1.00: a campaign blitz pays 70% less XP than fighting those stages, so it is a gold and
 *  clear shortcut rather than the fastest way to level. The Conquest Gate's blitz pays no XP at all. */
export const BLITZ_XP_SHARE = 0.3;

/** Diamonds a player pays to end a running blitz immediately. */
export const BLITZ_SKIP_DIAMONDS = 25;

export type BlitzGate = "campaign" | "conquest";
export type BlitzRun = NonNullable<Hero["blitzRun"]>;

export const BLITZ_RUNNING =
  "A blitz is already running — wait for it to finish, or finish it now for 25 Diamonds.";

/** The blitz still on the save: running, or finished and waiting to be paid out. */
export const blitzRun = (h: Pick<Hero, "blitzRun">) => h.blitzRun ?? null;

/** Milliseconds left on the run; 0 when nothing is running. */
export const blitzLeft = (h: Pick<Hero, "blitzRun">, now = Date.now()) =>
  h.blitzRun ? Math.max(0, h.blitzRun.endsAt - now) : 0;

/** True while the hero is out on a blitz — no battles can start until it lands. */
export const blitzRunning = (h: Pick<Hero, "blitzRun">, now = Date.now()) => blitzLeft(h, now) > 0;

/** Countdown as "9:41". */
export function formatBlitzLeft(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Why no battle may start right now, or null when the hero is free to fight. */
export function battleLockedByBlitz(h: Pick<Hero, "blitzRun">, now = Date.now()): string | null {
  const run = blitzRun(h);
  if (!run || run.endsAt <= now) return null;
  return `Your blitz is still running — ${formatBlitzLeft(run.endsAt - now)} left. Finish it for ${BLITZ_SKIP_DIAMONDS} Diamonds to fight now.`;
}

/** Send the hero out on a run. Returns an error message, or null once the run has started. */
export function startBlitzRun(
  h: Hero,
  run: Omit<BlitzRun, "startedAt" | "endsAt">,
  now = Date.now(),
): string | null {
  if (blitzRunning(h, now)) return BLITZ_RUNNING;
  h.blitzRun = { ...run, startedAt: now, endsAt: now + BLITZ_DURATION_MS };
  return null;
}

/** What a finished run paid. */
export interface BlitzReceipt {
  gate: BlitzGate;
  target: number;
  xp: number;
  gold: number;
  tokens: number;
}

/** Pay a run onto the save and take it off the hero, whether or not its clock has run out. */
export function finishBlitzRun(h: Hero): BlitzReceipt | null {
  const run = blitzRun(h);
  if (!run) return null;
  // Only the Campaign Gate feeds the level bar: a conquest run banks gold and tokens, never XP.
  const xp = run.gate === "campaign" ? run.xp : 0;
  grant(h, xp, run.gold);
  const tokens = run.tokens ?? 0;
  if (tokens)
    h.conquest = { ...(h.conquest ?? {}), tokens: Math.max(0, (h.conquest?.tokens ?? 0) + tokens) };
  delete h.blitzRun;
  return { gate: run.gate, target: run.target, xp, gold: run.gold, tokens };
}

/** Pay the run once its ten minutes are up. Returns the receipt, or null while it still runs. */
export function settleBlitzRun(h: Hero, now = Date.now()): BlitzReceipt | null {
  return blitzRunning(h, now) ? null : finishBlitzRun(h);
}
