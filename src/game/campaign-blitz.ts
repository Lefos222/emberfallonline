import { stageRewards, type Hero } from "./data";
import { blitzesLeft, BLITZ_PER_DAY, spendBlitz, type BlitzState } from "./conquest";
import { grant } from "./logic";

/**
 * Campaign blitz. `hero.stage` is the next stage to fight, so everything below it is
 * already cleared and may be blitzed. It spends the same daily allowance as the
 * Conquest Gate (see conquest.ts) — one ration for both gates.
 */

/** Deepest campaign stage the hero has already cleared. */
export const campaignStagesCleared = (h: Pick<Hero, "stage">) => Math.max(0, h.stage - 1);

export interface CampaignBlitzResult {
  stages: number;
  xp: number;
  gold: number;
}

/** What a campaign blitz to `target` pays in total: the same rewards those stages pay when fought. */
export function campaignBlitzRewards(target: number): CampaignBlitzResult {
  let xp = 0,
    gold = 0;
  for (let stage = 1; stage <= target; stage++) {
    const r = stageRewards(stage);
    xp += r.xp;
    gold += r.gold;
  }
  return { stages: target, xp, gold };
}

/**
 * A campaign blitz may only reach a stage the hero has already cleared, and only
 * while today's shared allowance lasts.
 */
export function campaignBlitzBlocker(
  h: Pick<Hero, "stage"> & BlitzState,
  target: number,
  now = Date.now(),
): string | null {
  const cap = campaignStagesCleared(h);
  if (cap < 1)
    return "Clear your first campaign stage before blitzing — there is nothing to skip yet.";
  if (!Number.isFinite(target) || target < 1) return "Choose how many stages to blitz.";
  if (target > cap) return `You can blitz up to stage ${cap} — the deepest stage you have cleared.`;
  if (blitzesLeft(h, now) < 1)
    return `No blitzes left today — ${BLITZ_PER_DAY} per day for both gates, back at Greek midnight.`;
  return null;
}

/** Instantly auto-clear campaign stages 1..target using one of today's blitzes. Returns an error message, or null on success. */
export function campaignBlitz(h: Hero, target: number, now = Date.now()): string | null {
  const blocked = campaignBlitzBlocker(h, target, now);
  if (blocked) return blocked;
  const rw = campaignBlitzRewards(target);
  spendBlitz(h, now);
  grant(h, rw.xp, rw.gold);
  return null;
}
