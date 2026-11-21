import { MATS, matCount, parseGem, type Mat } from "./crafting";
import { STONE_PRICE, clampStone, stoneCount, type StoneState } from "./enchant";

/**
 * Selling anything from the bag: every material, gem and Enchantment Stone has a gold price,
 * so nothing a hero carries is dead weight. Gear keeps its own `sellValue` in data.ts.
 */
/** Gold one unit of a material sells for, by its rarity (0 common → 5 mythic). */
export const MAT_SELL_BY_RARITY = [4, 12, 35, 110, 380, 1400] as const;
export const matSellValue = (m: Mat) => MAT_SELL_BY_RARITY[Math.max(0, Math.min(5, MATS[m].rarity))] ?? 4;
/** Gold one gem sells for: 60 at tier 1, tripling per tier. */
export const gemSellValue = (key: string) => { const g = parseGem(key); return g ? 60 * 3 ** (g.tier - 1) : 0; };
/** Enchantment Stones sell back for 15% of their base shop price. */
export const stoneSellValue = (level: number) => Math.round((STONE_PRICE[clampStone(level) - 1] ?? 0) * 0.15);

type Sellable = StoneState & { gold: number; mats?: Partial<Record<Mat, number>>; gems?: Record<string, number> };

/** Each seller takes at most what the hero owns and returns the gold paid (0 when nothing sold). */
export function sellMat(h: Sellable, m: Mat, qty: number): number {
  const n = Math.min(Math.floor(qty), matCount(h, m)); if (n <= 0) return 0;
  h.mats = { ...(h.mats ?? {}), [m]: matCount(h, m) - n };
  const g = n * matSellValue(m); h.gold += g; return g;
}
export function sellGem(h: Sellable, key: string, qty: number): number {
  const have = h.gems?.[key] ?? 0; const n = Math.min(Math.floor(qty), have); if (n <= 0 || !parseGem(key)) return 0;
  h.gems = { ...(h.gems ?? {}), [key]: have - n };
  const g = n * gemSellValue(key); h.gold += g; return g;
}
export function sellStone(h: Sellable, level: number, qty: number): number {
  const have = stoneCount(h, level); const n = Math.min(Math.floor(qty), have); if (n <= 0) return 0;
  h.enchantStones = { ...(h.enchantStones ?? {}), [String(clampStone(level))]: have - n };
  const g = n * stoneSellValue(level); h.gold += g; return g;
}
