import type { Mat } from "./crafting";

/** War Gates item roll: one material bundle OR one equipment item. Currency/XP stay separate. */
export const WAR_MATERIAL_CHANCE = 0.7;
export const warDropKind = (rand = Math.random): "materials" | "gear" => rand() < WAR_MATERIAL_CHANCE ? "materials" : "gear";
/** Dungeon Gate runs only drop an item bundle this often; the rest of the time a win pays XP and gold alone. */
export const DUNGEON_DROP_CHANCE = 0.5;
export const dungeonDrops = (rand = Math.random) => rand() < DUNGEON_DROP_CHANCE;

/**
 * A War Gates win never pays more than this many material units in one bundle: a cleared fight
 * should read as a few drops, not a pile. Every War Gate bundle is trimmed to it by capDropBundle.
 */
export const WAR_DROP_UNITS = 4;

/** Trim a material bundle to at most `max` units, keeping its entries in the order given. */
export function capDropBundle(bundle: Partial<Record<Mat, number>>, max = WAR_DROP_UNITS): Partial<Record<Mat, number>> {
  const out: Partial<Record<Mat, number>> = {};
  let left = max;
  for (const [k, v] of Object.entries(bundle) as [Mat, number | undefined][]) {
    if (left <= 0) break;
    const n = Math.min(v ?? 0, left);
    if (n > 0) { out[k] = n; left -= n; }
  }
  return out;
}

/**
 * Crystals a boss clear pays, deliberately scarce: one Frost Crystal from every rank, a Dragon
 * Scale from D3, Void from D6 and Abyssal Shards from D8. The two rarest crystals (Sun from D6,
 * Titan from D8) replace a common one instead of adding to it, so a clear never pays more than
 * WAR_DROP_UNITS.
 */
export function bossCrystals(d: number, rand = Math.random): Partial<Record<Mat, number>> {
  const out: Partial<Record<Mat, number>> = { frostCrystal: 1 };
  if (d >= 3) out.dragonScale = 1;
  if (d >= 6) out.voidCrystal = 1;
  if (d >= 8) out.abyssalShard = 1;
  if (d >= 6 && rand() < 0.15) { delete out.voidCrystal; out.sunCrystal = 1; }
  if (d >= 8 && rand() < 0.12) { delete out.abyssalShard; out.titanHeart = 1; }
  return capDropBundle(out);
}
