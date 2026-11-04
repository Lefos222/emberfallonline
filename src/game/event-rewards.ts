// ============= Event reward gate: boss events pay out every fifth boss kill =============
// A world boss returns every two hours, so one kill must not hand out the whole event reward.
// Each won boss encounter counts as one participation on the hero's save; the gold, XP and loot
// pay out on the fifth kill, and the tally starts over for the next reward.

import { EVENT_BOSS_KILLS_REQUIRED, type WorldEvent } from "./events";

/** Save fields the gate reads and writes. */
export interface EventBossProgress {
  eventBoss?: Record<string, number>;
}

/** Boss events (world boss and the weekly season) are the encounters this gate covers. */
export const isBossEvent = (ev: Pick<WorldEvent, "kind">) =>
  ev.kind === "boss" || ev.kind === "season";

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
