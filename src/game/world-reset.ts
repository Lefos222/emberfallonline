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

/**
 * True for a save written before the current reset, or for a stale browser draft.
 *
 * Disabled: the reset was wiping characters to level 0 on every login because the
 * post-reset stamp was not persisting (cloud save errors left the old stamp in the
 * database, so the next login treated the character as pre-reset again).  Returning
 * false here stops the reset entirely so existing characters keep their progress.
 * Re-enable by restoring the `h.resetAt !== WORLD_RESET_ID` comparison.
 */
export const isPreResetSave = (_h: Pick<Hero, "resetAt">) => false;

/**
 * Rebuild a saved hero as a clean level-0 character: only name and class survive, with the
 * common starter kit, no gold, and every progression track gone.
 */
export function resetHero(h: Pick<Hero, "name" | "cls">): Hero {
  const fresh = newHero(h.name, h.cls);
  return { ...fresh, level: 0, gold: 0, xp: 0, paragon: 0, stage: 1, spire: 1, wins: 0, resetAt: WORLD_RESET_ID };
}
