/** War Gates item roll: one material bundle OR one equipment item. Currency/XP stay separate. */
export const WAR_MATERIAL_CHANCE = 0.7;
export const warDropKind = (rand = Math.random): "materials" | "gear" => rand() < WAR_MATERIAL_CHANCE ? "materials" : "gear";