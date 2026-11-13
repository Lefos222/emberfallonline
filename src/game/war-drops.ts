/** War Gates item roll: one material bundle OR one equipment item. Currency/XP stay separate. */
export const WAR_MATERIAL_CHANCE = 0.7;
export const warDropKind = (rand = Math.random): "materials" | "gear" => rand() < WAR_MATERIAL_CHANCE ? "materials" : "gear";
/** Dungeon Gate runs only drop an item bundle this often; the rest of the time a win pays XP and gold alone. */
export const DUNGEON_DROP_CHANCE = 0.5;
export const dungeonDrops = (rand = Math.random) => rand() < DUNGEON_DROP_CHANCE;

/** Boss crystals per clear, deliberately scarce: rare crystals only from deep ranks and only sometimes. */
export function bossCrystals(d: number, rand = Math.random): Record<string, number> {
  const out: Record<string, number> = { frostCrystal: Math.ceil(d / 3), dragonScale: Math.ceil(d / 4) };
  if (d >= 4) { out['voidCrystal'] = Math.floor(d / 4); out['abyssalShard'] = Math.floor(d / 5) || 0; }
  if (d >= 6 && rand() < 0.15) out['sunCrystal'] = 1;
  if (d >= 6 && rand() < 0.12) out['titanHeart'] = 1;
  for (const k of Object.keys(out)) if (!out[k]) delete out[k];
  return out;
}
