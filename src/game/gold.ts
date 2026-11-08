/** Gold prices in Ember Fall rise with the hero's level: every cost the player pays in gold is
 *  multiplied by this factor, so the castle's shops, forge and barracks stay a real sink as levels
 *  climb instead of getting cheaper in practice. Level 1 leaves every legacy price unchanged. */
export const GOLD_PER_LEVEL = 0.02;

export function goldScale(level = 1) {
  const l = Number.isFinite(level) ? level : 1;
  return 1 + Math.max(0, l - 1) * GOLD_PER_LEVEL;
}

/** A gold price scaled for a hero's level. */
export const scaledGold = (base: number, level = 1) => Math.round(base * goldScale(level));

/** Every gold reward earned in play — battles, arenas, events and chests — pays this much
 *  more than its table prints, so the hero's purse fills a little faster. The bonus scales gently
 *  with the hero's level so endgame gold keeps pace with the rising costs. */
export const GOLD_GAIN_BONUS = 0.29;
/** Extra gold gain per level, so higher-level heroes see the +29% scaling pay out. */
export const GOLD_GAIN_PER_LEVEL = 0.002;

/** A gold reward with the game's level-scaled gold-gain bonus applied. */
export const goldGain = (gold: number, level = 1) =>
  Math.round(gold * (1 + GOLD_GAIN_BONUS + Math.max(0, level - 1) * GOLD_GAIN_PER_LEVEL));
