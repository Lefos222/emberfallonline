// ============= Event reward gate: gated events pay out every third win =============
// Sieges and the Blood Moon return often, so one win must not hand out the whole event reward.
// Each won encounter counts as one participation on the hero's save; the full purse pays out on
// the third win, and the tally starts over for the next reward.

import { EVENT_BOSS_KILLS_REQUIRED, type WorldEvent } from "./events";

/** Save fields the gate reads and writes. */
export interface EventBossProgress {
  eventBoss?: Record<string, number>;
}

/** Gated events (sieges and the Blood Moon) are the encounters this gate covers. */
export const isBossEvent = (ev: Pick<WorldEvent, "bonus">) => !!ev.bonus.gated;

/** Boss kills this character has landed in the event since the last payout. */
export const eventBossKills = (h: EventBossProgress, eventId: string) =>
  Math.min(EVENT_BOSS_KILLS_REQUIRED - 1, Math.max(0, Math.floor(h.eventBoss?.[eventId] ?? 0)));

/** Count one boss kill. The fifth lands the reward and resets the tally. */
export function countEventBossKill(
  h: EventBossProgress,
  eventId: string,
): { kills: number; rewarded: boolean } {
  const kills = eventBossKills(h, eventId) + 1;
  const rewarded = kills >= EVENT_BOSS_KILLS_REQUIRED;
  h.eventBoss = { ...(h.eventBoss ?? {}), [eventId]: rewarded ? 0 : kills };
  return { kills: rewarded ? EVENT_BOSS_KILLS_REQUIRED : kills, rewarded };
}
