/**
 * The anticheat limits enforced by the database (`_ac_power_cap` / `_ac_gold_cap` in
 * drizzle/migrations/0043_anticheat.sql). They are mirrored here only so tests can prove an honest,
 * fully geared hero never reaches them. Keep both copies identical.
 */
export const AC_MAX_LEVEL = 140;
export const AC_MAX_GOLD = 2_000_000_000;
export const AC_MAX_LEVEL_JUMP = 30;

const clampLevel = (level: number) => Math.min(AC_MAX_LEVEL, Math.max(1, Math.floor(level || 1)));

/**
 * Highest Battle Rating the server accepts for a hero of this level and Ascension. The rating
 * curve's 10% gain (RATING_GAIN in data.ts) is mirrored here, so an honest hero keeps the same
 * headroom under the cap.
 */
export const AC_RATING_GAIN = 1.1;

export function acPowerCap(level: number, paragon = 0): number {
  const p = Math.max(0, paragon || 0);
  return (
    650_000 *
    (1 + Math.pow(clampLevel(level) / AC_MAX_LEVEL, 1.7) * 2.4 + p * 0.03) *
    (1 + p * 0.03) *
    AC_RATING_GAIN
  );
}

/** Most gold the server accepts as earned in one save (four times this per hour). */
export function acGoldCap(level: number, paragon = 0): number {
  return 100_000 + 40_000 * Math.max(0, level || 0) + 20_000 * Math.max(0, paragon || 0);
}
