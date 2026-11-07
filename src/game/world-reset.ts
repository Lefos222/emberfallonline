import { newHero, type Hero } from "./data";

/**
 * World reset stamp.
 *
 * The reset runs in the app instead of a database script: every character loaded with a
 * save that does not carry this exact stamp is rebuilt from scratch and written back on the
 * spot, so a player starts again from level 0 the next time they open the game.
 *
 * Bump this value to wipe the world again. Browser drafts from before the reset carry an
 * older stamp (or none at all), so the next load discards them instead of restoring old
 * progress.
 */
export const WORLD_RESET_ID = "2026-11-07-world-reset";

/** True for a save written before the current reset, or for a stale browser draft. */
export const isPreResetSave = (h: Pick<Hero, "resetAt">) => h.resetAt !== WORLD_RESET_ID;

/**
 * Rebuild a saved hero as a clean level-0 character: only name and class survive, with the
 * common starter kit, no gold, and every progression track gone.
 */
export function resetHero(h: Pick<Hero, "name" | "cls">): Hero {
  const fresh = newHero(h.name, h.cls);
  return { ...fresh, level: 0, gold: 0, xp: 0, paragon: 0, stage: 1, spire: 1, wins: 0, resetAt: WORLD_RESET_ID };
}
