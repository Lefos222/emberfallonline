import type { Hero } from "./data";
import { scaledGold } from "./gold";
export const ROSE_BASE_GOLD = 1000;
export const rosePrice = (level: number) => scaledGold(ROSE_BASE_GOLD, level);
export const friendshipPoints = (h: Pick<Hero, "srv">) => Math.max(0, Number(h.srv?.friendship?.points ?? 0));
export const roseCount = (h: Pick<Hero, "srv">) => Math.max(0, Number(h.srv?.friendship?.roses ?? 0));
/** Uncapped linear health bonus enters the same combat-stat pipeline as all other progression. */
export const friendshipHealthPct = (h: Pick<Hero, "srv">) => friendshipPoints(h) * 0.1;