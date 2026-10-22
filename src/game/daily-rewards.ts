import type { HeroClass } from './data';
import type { ScrollKind } from './scrolls';

/** Display preview only; claim_login calculates and grants these online. */
export function dailyLoginItems(cls: HeroClass, streak: number) {
  const gem = cls === 'mage' ? 'amethyst:1' : cls === 'archer' ? 'topaz:1' : 'ruby:1';
  const scrolls: ScrollKind[] = ['dmg', 'def', 'xp'];
  const scroll = scrolls[Math.max(0, streak - 1) % 3] ?? 'dmg';
  return { mats: { ore: 5, fragment: 2, starshard: 1 }, gems: { [gem]: 1 }, scrolls: { [scroll]: 1 } };
}