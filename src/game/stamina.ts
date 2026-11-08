import { greekDayStart } from "./events";
import type { Hero } from "./data";

/**
 * Stamina, 200 a Greek day.
 *
 * Every Campaign Gate battle costs 20 stamina and every Dungeon Gate run costs 10 — the bar is
 * spent on entry, so a loss costs exactly as much as a win. Stamina Potions restore 50 each and
 * at most five may be drunk per day; they are a rare drop and also sold for gold at the Auction
 * House. The bar refills at Greek midnight like the dailies.
 */

export const STAMINA_PER_DAY = 500;
/** Stamina one Campaign Gate battle costs. */
export const CAMPAIGN_STAMINA = 20;
/** Stamina one Dungeon Gate run costs. */
export const DUNGEON_STAMINA = 10;
/** Legacy name for the dungeon cost (see DUNGEON_STAMINA). */
export const STAMINA_PER_RUN = DUNGEON_STAMINA;
/** Campaign battles one full bar pays for. */
export const CAMPAIGN_BATTLES_PER_DAY = STAMINA_PER_DAY / CAMPAIGN_STAMINA;
/** Dungeon runs one full bar pays for. */
export const DUNGEON_RUNS_PER_DAY = STAMINA_PER_DAY / DUNGEON_STAMINA;
/** Stamina one potion restores. */
export const POTION_STAMINA = 50;
/** Stamina Potions a hero may drink per Greek day. */
export const POTION_PER_DAY = 5;
/** Chance a won dungeon run drops a Stamina Potion — deliberately rare. */
export const POTION_DROP_CHANCE = 0.04;

export interface StaminaState {
  stamina?: { day?: string; used?: number; potions?: number };
  staminaPotions?: number;
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

/** Why a battle costing this much stamina cannot start, or null when the hero can pay. */
export function staminaBlocker(h: StaminaState, cost = CAMPAIGN_STAMINA, now = Date.now()): string | null {
  if (staminaLeft(h, now) >= cost) return null;
  return `Out of stamina — a Campaign Gate battle costs ${CAMPAIGN_STAMINA} and a dungeon run ${DUNGEON_STAMINA} of your ${STAMINA_PER_DAY} a day. It refills at Greek midnight; a Stamina Potion restores ${POTION_STAMINA}.`;
}

/** Spend the stamina of one battle or dungeon run. */
export function spendStamina(h: Hero, cost = CAMPAIGN_STAMINA, now = Date.now()) {
  h.stamina = { ...(h.stamina ?? {}), day: staminaDay(now), used: staminaUsed(h, now) + Math.max(0, cost) };
}

/** Stamina Potions the hero is carrying. */
export const potionCount = (h: StaminaState) => Math.max(0, Math.floor(h.staminaPotions ?? 0));

/** Stamina Potions already drunk today. */
export function potionUses(h: StaminaState, now = Date.now()) {
  const s = h.stamina;
  return s?.day === staminaDay(now) ? Math.max(0, Math.floor(s.potions ?? 0)) : 0;
}

/** Stamina Potions the hero may still drink today. */
export const potionUsesLeft = (h: StaminaState, now = Date.now()) =>
  Math.max(0, POTION_PER_DAY - potionUses(h, now));

/** Add potions to the bag. */
export function addPotions(h: StaminaState, n = 1) {
  if (n <= 0) return;
  h.staminaPotions = potionCount(h) + Math.floor(n);
}

/** Drink one potion: refills POTION_STAMINA, never past a full bar and never past the daily cap.
 *  Returns an error string, or null on success. */
export function drinkStaminaPotion(h: StaminaState, now = Date.now()): string | null {
  if (potionCount(h) <= 0) return "No Stamina Potions";
  if (potionUsesLeft(h, now) <= 0) return `You have already drunk ${POTION_PER_DAY} Stamina Potions today — the limit refills at Greek midnight.`;
  const left = staminaLeft(h, now);
  if (left >= STAMINA_PER_DAY) return "Stamina is already full";
  const restored = Math.min(POTION_STAMINA, STAMINA_PER_DAY - left);
  h.staminaPotions = potionCount(h) - 1;
  h.stamina = {
    ...(h.stamina ?? {}),
    day: staminaDay(now),
    used: staminaUsed(h, now) - restored,
    potions: potionUses(h, now) + 1,
  };
  return null;
}

/** Roll a Stamina Potion from a won dungeon run. Returns 1 on a drop, 0 otherwise. */
export function rollStaminaPotion(rand: () => number = Math.random): number {
  return rand() < POTION_DROP_CHANCE ? 1 : 0;
}

/** When the bar refills: the next Greek midnight. */
export const staminaResetAt = (now = Date.now()) => greekDayStart(now) + 86400000;
