import { greekDayStart } from "./events";
import type { Hero } from "./data";

/**
 * Dungeon Gate stamina. Every dungeon run — boss challenges, elite hunts, material
 * expeditions and relic trials — costs 10 stamina whether it is won or lost: 200 a
 * Greek day, so twenty runs daily. Campaign and Conquest fights never touch it.
 * Stamina Potions are a rare dungeon drop and top the bar back up.
 */

export const STAMINA_PER_DAY = 200;
export const STAMINA_PER_RUN = 10;
/** Dungeon runs one full bar pays for. */
export const DUNGEON_RUNS_PER_DAY = STAMINA_PER_DAY / STAMINA_PER_RUN;
/** Stamina one potion restores. */
export const POTION_STAMINA = 50;
/** Chance a won dungeon run drops a Stamina Potion — deliberately rare. */
export const POTION_DROP_CHANCE = 0.04;

export interface StaminaState {
  stamina?: { day?: string; used?: number };
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

/** Why a dungeon run cannot start, or null when the hero has stamina. */
export function staminaBlocker(h: StaminaState, now = Date.now()): string | null {
  if (staminaLeft(h, now) >= STAMINA_PER_RUN) return null;
  return `Out of stamina — ${STAMINA_PER_DAY} a day, ${STAMINA_PER_RUN} per dungeon run. It refills at Greek midnight; a Stamina Potion restores ${POTION_STAMINA}.`;
}

/** Spend the stamina of one dungeon run. */
export function spendStamina(h: Hero, now = Date.now()) {
  h.stamina = { day: staminaDay(now), used: staminaUsed(h, now) + STAMINA_PER_RUN };
}

/** Stamina Potions the hero is carrying. */
export const potionCount = (h: StaminaState) => Math.max(0, Math.floor(h.staminaPotions ?? 0));

/** Add potions to the bag. */
export function addPotions(h: Hero, n = 1) {
  if (n <= 0) return;
  h.staminaPotions = potionCount(h) + Math.floor(n);
}

/** Drink one potion: refills POTION_STAMINA, never past a full bar. Returns an error string, or null. */
export function drinkStaminaPotion(h: Hero, now = Date.now()): string | null {
  if (potionCount(h) <= 0) return "No Stamina Potions";
  const left = staminaLeft(h, now);
  if (left >= STAMINA_PER_DAY) return "Stamina is already full";
  const restored = Math.min(POTION_STAMINA, STAMINA_PER_DAY - left);
  h.staminaPotions = potionCount(h) - 1;
  h.stamina = { day: staminaDay(now), used: staminaUsed(h, now) - restored };
  return null;
}

/** Roll a Stamina Potion from a won dungeon run. Returns 1 on a drop, 0 otherwise. */
export function rollStaminaPotion(rand: () => number = Math.random): number {
  return rand() < POTION_DROP_CHANCE ? 1 : 0;
}

/** When the bar refills: the next Greek midnight. */
export const staminaResetAt = (now = Date.now()) => greekDayStart(now) + 86400000;
