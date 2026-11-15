/**
 * What a won battle leaves behind on top of its gate's own reward.
 *
 * - Everyday gear: any won fight outside the arena has a BONUS_GEAR_CHANCE of dropping one extra
 *   grey (Common), green (Uncommon) or blue (Rare) piece, weighted by BONUS_GEAR_WEIGHTS.
 * - Bonus finds (chests, Soul Shards, enchantment stones, Fate Stones, XP Scrolls) are each rolled
 *   on their own odds, then only MAX_BONUS_FINDS of the hits are kept, picked at random.
 */
export const BONUS_GEAR_CHANCE = 0.25;
/** Relative odds of the bonus piece: grey, green, blue. */
export const BONUS_GEAR_WEIGHTS = [50, 33, 17] as const;
/** A won fight never keeps more than this many bonus finds. */
export const MAX_BONUS_FINDS = 2;

/** Rarity of the bonus everyday piece (0 grey, 1 green, 2 blue), or null when none drops. */
export function rollBonusGearRarity(rand: () => number = Math.random): 0 | 1 | 2 | null {
  if (rand() >= BONUS_GEAR_CHANCE) return null;
  const total = BONUS_GEAR_WEIGHTS.reduce((a, b) => a + b, 0);
  let roll = rand() * total;
  for (let i = 0; i < BONUS_GEAR_WEIGHTS.length; i++) {
    roll -= BONUS_GEAR_WEIGHTS[i];
    if (roll < 0) return i as 0 | 1 | 2;
  }
  return 2;
}

/** Keep at most `max` of the finds that hit, chosen at random (shuffled, then cut). */
export function keepFinds<T>(finds: T[], max = MAX_BONUS_FINDS, rand: () => number = Math.random): T[] {
  const pool = [...finds];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, max));
}
