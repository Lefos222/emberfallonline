import { battleEssenceGain, enlightenmentUnlocked, rollSoulShards } from "./enlightenment";
import { mountBlitzPct } from "./mounts";
import type { Hero } from "./data";
import { grant } from "./logic";
import { vipBlitzFactor, vipLevelOf } from "./vip-perks";

/**
 * A blitz is a run, not an instant payout: starting one sends the hero up the climb. The
 * rewards land when the run ends, every battle is locked while it lasts, and 25 Diamonds
 * finish it on the spot. A shallow run takes 20 minutes; a run that sweeps a deep climb
 * takes up to 50, so the long ones cost the hero real time.
 */

/** The shortest a blitz can take — a shallow run. */
export const BLITZ_MIN_MS = 20 * 60_000;

/** The longest a blitz can take — a run to the deepest floors. */
export const BLITZ_MAX_MS = 50 * 60_000;

/** Blitz depth (floors or stages covered) at which a run takes the full 50 minutes. */
export const BLITZ_FULL_DEPTH = 100;

/**
 * How long a blitz to `target` floors (or stages) takes: 20 minutes for a shallow run, rising
 * one minute per few floors to the 50-minute cap at BLITZ_FULL_DEPTH. Whole minutes, so the
 * countdown always reads cleanly.
 */
export function blitzDurationMs(target: number, vipLevel = 0, mountPct = 0): number {
  const depth = Math.min(
    1,
    Math.max(0, (Math.max(1, Math.floor(target || 1)) - 1) / (BLITZ_FULL_DEPTH - 1)),
  );
  const minutes = 20 + Math.round(depth * 30);
  // VIP membership is the "faster blitz": up to 30% shorter, never under ten minutes.
  // A ridden mount cuts a further percentage (see mounts.ts).
  return Math.max(10, Math.round(minutes * vipBlitzFactor(vipLevel) * (1 - Math.max(0, Math.min(25, mountPct)) / 100))) * 60_000;
}

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

/** The whole length of a run, so a progress bar can tell how far along it is. */
export const blitzRunTotal = (run: Pick<BlitzRun, "target" | "durationMs">) =>
  run.durationMs ?? blitzDurationMs(run.target);

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
  const durationMs = blitzDurationMs(run.target, vipLevelOf(h), mountBlitzPct(h));
  h.blitzRun = { ...run, startedAt: now, endsAt: now + durationMs, durationMs };
  return null;
}

/** What a finished run paid. */
export interface BlitzReceipt {
  gate: BlitzGate;
  target: number;
  xp: number;
  gold: number;
  tokens: number;
  /** Battle Essence (Enlightenment) and Soul Shards (Soul Forge) the run's fights left behind. */
  essence: number;
  shards: number;
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
  // The run's fights feed the same post-20 tracks a won battle does (see enlightenment.ts).
  const fights = Math.max(1, Math.min(10, Math.ceil(run.target / 10)));
  const essence = enlightenmentUnlocked(h) ? battleEssenceGain(h.level + (h.paragon ?? 0), false) * fights : 0;
  let shards = 0;
  for (let i = 0; i < fights; i++) shards += rollSoulShards(false);
  if (essence) h.battleEssence = Math.max(0, Math.floor(h.battleEssence ?? 0)) + essence;
  if (shards) h.soulShards = Math.max(0, Math.floor(h.soulShards ?? 0)) + shards;
  delete h.blitzRun;
  return { gate: run.gate, target: run.target, xp, gold: run.gold, tokens, essence, shards };
}

/** Pay the run once its clock is up. Returns the receipt, or null while it still runs. */
export function settleBlitzRun(h: Hero, now = Date.now()): BlitzReceipt | null {
  return blitzRunning(h, now) ? null : finishBlitzRun(h);
}
