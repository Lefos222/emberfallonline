import { scaledGold } from "./gold";

/**
 * Enchantment Stones: grades 2-9 of stone, each one worth a growing chance on the Forge's
 * enchantment roll. Two stones of a grade plus gold forge one of the next grade, and the Auction
 * House shop sells every grade for gold.
 *
 * Grade 1 (the plain diamond-shaped stone that used to sit in `hero.mats.enchantStone`) was
 * removed from the game: every source that used to pay it now pays a Lv 2 stone instead, and
 * `migrateEnchantStones` folds any leftover stacks from older saves into grade 2.
 */
export const STONE_LEVELS = 9;
/** The lowest stone grade that still exists; the old grade 1 stone was removed. */
export const MIN_STONE_LEVEL = 2;
/** Success bonus added by a stone of each grade. */
export const STONE_BONUS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
/** Stone colours, grade 1 to 9 (the stone chart's ramp). */
export const STONE_COLORS = [
  "#cfd6e4",
  "#8fd0ff",
  "#3fc7c0",
  "#23a85a",
  "#3f80ff",
  "#d4283c",
  "#9b4dd8",
  "#f2902f",
  "#ff5cae",
];
/** Base gold price of each grade in the Auction House shop, before level scaling. */
export const STONE_PRICE = [4000, 9000, 20000, 45000, 95000, 190000, 380000, 760000, 1500000];
/** Gold added to two stones to forge the next grade (grades 1 → 2 up to 8 → 9). */
export const COMBINE_GOLD = [200, 400, 600, 800, 1000, 1400, 1800, 2200];
/** Chance a stone survives a failed enchantment, so a bad roll is not always a total loss. */
export const STONE_FAIL_SAVE_CHANCE = 0.25;

export const clampStone = (level: number) =>
  Math.max(MIN_STONE_LEVEL, Math.min(STONE_LEVELS, Math.round(Number.isFinite(level) ? level : MIN_STONE_LEVEL)));

export const stoneName = (level: number) => `Lv ${clampStone(level)} Enchantment Stone`;
export const stoneBonus = (level: number) => STONE_BONUS[clampStone(level) - 1];
export const stoneColor = (level: number) => STONE_COLORS[clampStone(level) - 1];

/** Gold a stone of this grade costs in the shop, scaled by the buyer's level. */
export const stonePrice = (level: number, heroLevel = 1) =>
  scaledGold(STONE_PRICE[clampStone(level) - 1], heroLevel);
/** Gold two stones of this grade need to be forged into one of the next grade. */
export const combineGold = (level: number, heroLevel = 1) =>
  scaledGold(COMBINE_GOLD[clampStone(level) - 1] ?? 0, heroLevel);

/** The saved field the stone helpers read and write: grade → count (see `Hero.enchantStones`). */
export interface StoneState {
  enchantStones?: Record<string, number>;
}

/** How many stones of a grade the hero holds. The removed grade 1 always answers zero. */
export function stoneCount(h: StoneState, level: number): number {
  const lvl = Math.round(Number.isFinite(level) ? level : 0);
  if (lvl < MIN_STONE_LEVEL || lvl > STONE_LEVELS) return 0;
  return Math.max(0, Math.floor(h.enchantStones?.[String(lvl)] ?? 0));
}

/** Write a stone count back onto the save. */
function setStones(h: StoneState, lvl: number, n: number) {
  const value = Math.max(0, Math.floor(n));
  h.enchantStones = { ...(h.enchantStones ?? {}), [String(lvl)]: value };
}

/** Add stones to the pouch. */
export function addStones(h: StoneState, level: number, n = 1) {
  if (n === 0) return;
  const lvl = clampStone(level);
  setStones(h, lvl, stoneCount(h, lvl) + n);
}

/** Spend stones of one grade. Returns false (and spends nothing) when there are not enough. */
export function spendStones(h: StoneState, level: number, n = 1): boolean {
  const lvl = clampStone(level);
  if (stoneCount(h, lvl) < n) return false;
  setStones(h, lvl, stoneCount(h, lvl) - n);
  return true;
}

/** Stone grades the hero actually holds, lowest first. */
export function heldStoneLevels(h: StoneState): number[] {
  const out: number[] = [];
  for (let lvl = MIN_STONE_LEVEL; lvl <= STONE_LEVELS; lvl += 1) if (stoneCount(h, lvl) > 0) out.push(lvl);
  return out;
}

/** Total stones held, any grade. */
export const totalStones = (h: StoneState) =>
  heldStoneLevels(h).reduce((sum, lvl) => sum + stoneCount(h, lvl), 0);

/**
 * Fold the removed grade-1 stone into grade 2. Older saves kept it in `mats.enchantStone`, and a
 * few server RPCs (the Wheel, Spire chests, guild raids) still mint that key, so this runs on every
 * save load and turns those stacks into the lowest stone that still exists.
 */
export function migrateEnchantStones(h: {
  mats?: object;
  enchantStones?: Record<string, number>;
}) {
  const mats = h.mats as Record<string, number | undefined> | undefined;
  const legacy = Math.max(0, Math.floor(mats?.["enchantStone"] ?? 0));
  const stray = Math.max(0, Math.floor(h.enchantStones?.["1"] ?? 0));
  const lift = legacy + stray;
  if (legacy && mats) delete mats["enchantStone"];
  if (!lift && !stray) return;
  const stones = { ...(h.enchantStones ?? {}) };
  delete stones["1"];
  stones[String(MIN_STONE_LEVEL)] = Math.max(0, Math.floor(stones[String(MIN_STONE_LEVEL)] ?? 0)) + lift;
  h.enchantStones = stones;
}

/** Forge two stones of a grade plus gold into one of the next grade. */
export function combineStones(
  h: StoneState & { gold: number; level?: number },
  level: number,
): string | null {
  const lvl = clampStone(level);
  if (lvl >= STONE_LEVELS) return "That is already the highest grade";
  if (stoneCount(h, lvl) < 2) return `Needs two Lv ${lvl} stones`;
  const gold = combineGold(lvl, h.level ?? 1);
  if (h.gold < gold) return `Needs ${gold.toLocaleString()} gold`;
  h.gold -= gold;
  spendStones(h, lvl, 2);
  addStones(h, lvl + 1, 1);
  return null;
}

/**
 * Forge every pair of stones the hero holds, lowest grade first, so a full pouch can be tidied in
 * one press. Stops when a pair cannot be paid for and reports how many were made.
 */
export function combineAllStones(h: StoneState & { gold: number; level?: number }): { made: number; error?: string } {
  let made = 0;
  for (let lvl = MIN_STONE_LEVEL; lvl < STONE_LEVELS; lvl += 1) {
    while (stoneCount(h, lvl) >= 2) {
      const err = combineStones(h, lvl);
      if (err) return { made, error: err };
      made += 1;
    }
  }
  return { made };
}

/** The grade a hero of this level usually finds, before the fight's own bonus. */
export const stoneGradeFor = (level: number) => clampStone(1 + Math.floor(Math.max(0, level) / 12));

/**
 * Stones a won battle sometimes leaves behind. Bosses always drop (and drop higher), elites often,
 * ordinary fights now and then. About a third of the time a stone comes one grade above the norm.
 */
export function rollStoneDrop(
  level: number,
  boss = false,
  elite = false,
  rand = Math.random,
): { level: number; n: number } | null {
  const chance = boss ? 1 : elite ? 0.62 : 0.37;
  if (rand() >= chance) return null;
  const swing = rand() < 0.33 ? 1 : 0;
  const grade = clampStone(stoneGradeFor(level) + (boss ? 2 : elite ? 1 : 0) + swing);
  const n = boss && rand() < 0.5 ? 2 : 1;
  return { level: grade, n };
}
