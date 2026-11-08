import { enhanceChance, type Item } from "./data";
import type { CraftState } from "./crafting";

/**
 * Fate Stones: a rare, single-grade stone that refines gear at the Forge instead of gold. Unlike the
 * nine grades of Enchantment Stone, one Fate Stone adds a flat slice of success to any refinement step
 * and is spent whether the metal holds or not — fate takes its price either way.
 *
 * Fate Stones live in `hero.mats.fateStone` like every other material, so battles, the Auction House
 * shop and old saves all read them through the same `matCount` path.
 */
/** Success a Fate Stone adds to the plain enhancement roll. */
export const FATE_SUCCESS_BONUS = 0.25;
/** Base gold price of one Fate Stone in the Auction House shop, before level scaling and house discount. */
export const FATE_STONE_PRICE = 120000;

/** Fate Stones one refinement step costs: one, plus another every five enhancement levels already made. */
export const fateStoneCost = (it: Item) => 1 + Math.floor(Math.max(0, it.enh) / 5);

/** Chance a Fate Stone refinement succeeds: the plain roll plus a flat bonus, never a certainty. */
export const enhanceFateChance = (it: Item) =>
  Math.min(0.95, enhanceChance(it) + FATE_SUCCESS_BONUS);

type FateState = Pick<CraftState, "mats">;

/** How many Fate Stones the hero holds. */
export const fateStoneCount = (h: FateState) => Math.max(0, Math.floor(h.mats?.fateStone ?? 0));

/** Add Fate Stones to the pouch. */
export function addFateStones(h: FateState, n = 1) {
  if (n === 0) return;
  h.mats = { ...(h.mats ?? {}), fateStone: Math.max(0, fateStoneCount(h) + Math.floor(n)) };
}

/** Spend Fate Stones. Returns false (and spends nothing) when there are not enough. */
export function spendFateStones(h: FateState, n = 1): boolean {
  if (fateStoneCount(h) < n) return false;
  addFateStones(h, -n);
  return true;
}

/**
 * A won battle sometimes leaves a Fate Stone behind. Rare everywhere, a little likelier from elites and
 * bosses, so it stays a treat rather than a routine payout.
 */
export function rollFateStone(boss = false, elite = false, rand = Math.random): number {
  const chance = boss ? 0.3 : elite ? 0.16 : 0.05;
  if (rand() >= chance) return 0;
  return boss && rand() < 0.4 ? 2 : 1;
}
