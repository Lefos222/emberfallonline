import type { Hero } from "./data";

/** XP Scrolls: a rare drop from won battles, read from the bag for a lump of experience. */
export const XP_SCROLL_DROP = 0.06;
export const XP_SCROLL_BOSS_DROP = 0.25;

export function rollXpScroll(boss: boolean, rand: () => number = Math.random): number {
  return rand() < (boss ? XP_SCROLL_BOSS_DROP : XP_SCROLL_DROP) ? 1 : 0;
}

/** Experience one scroll gives a hero of this level. */
export const xpScrollValue = (level: number) => 400 + Math.max(1, level) * 180;

export const addXpScrolls = (h: Hero, n: number) => { h.xpScrolls = (h.xpScrolls ?? 0) + n; };
