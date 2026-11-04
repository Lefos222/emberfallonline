import { greekDayStart } from "./events";
import type { Hero } from "./data";

/**
 * Campaign Gate stamina. Only a lost campaign fight spends it: 300 a Greek day, 10 per loss,
 * so a losing streak costs at most 30 fights daily while winning is always free. Conquest
 * floors, dungeons, the arena and activities never touch it.
 */

export const STAMINA_PER_DAY = 300;
export const STAMINA_PER_FIGHT = 10;
/** Lost campaign fights one full bar pays for. */
export const CAMPAIGN_FIGHTS_PER_DAY = STAMINA_PER_DAY / STAMINA_PER_FIGHT;

export interface StaminaState {
  stamina?: { day?: string; used?: number };
}

/** Greek day the bar is on, so it refills at Greek midnight like the dailies. */
export const staminaDay = (now = Date.now()) =>
  new Date(greekDayStart(now)).toISOString().slice(0, 10);

/** Stamina already spent today. */
export function staminaUsed(h: StaminaState, now = Date.now()) {
  const s = h.stamina;
  return s?.day === staminaDay(now) ? Math.max(0, Math.floor(s.used ?? 0)) : 0;
}

/** Stamina still available today. */
export const staminaLeft = (h: StaminaState, now = Date.now()) =>
  Math.max(0, STAMINA_PER_DAY - staminaUsed(h, now));

/** Why a campaign fight cannot start, or null when the hero has stamina. */
export function staminaBlocker(h: StaminaState, now = Date.now()): string | null {
  if (staminaLeft(h, now) >= STAMINA_PER_FIGHT) return null;
  return `Out of stamina — ${STAMINA_PER_DAY} a day, ${STAMINA_PER_FIGHT} per lost campaign fight. It refills at Greek midnight.`;
}

/** Spend the stamina of one lost campaign fight. */
export function spendStamina(h: Hero, now = Date.now()) {
  h.stamina = { day: staminaDay(now), used: staminaUsed(h, now) + STAMINA_PER_FIGHT };
}

/** Settle a campaign fight: only a loss costs stamina, a win leaves the bar untouched. */
export function settleCampaignStamina(h: Hero, won: boolean, now = Date.now()) {
  if (!won) spendStamina(h, now);
}

/** When the bar refills: the next Greek midnight. */
export const staminaResetAt = (now = Date.now()) => greekDayStart(now) + 86400000;
