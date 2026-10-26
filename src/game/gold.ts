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
