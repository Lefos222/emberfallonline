import { tr } from "./i18n";
import { MatIcon } from "./MatIcon";
import { MATS, RECIPES, recipeMats, type Mat } from "./crafting";
import { SYNTH_LEVELS, SYNTH_TIER_COUNT, setCost, tierName } from "./synthesis";
import { RARITIES } from "./data";
import { fmt } from "./ui";

/** Read-only reference built from the live recipe and set tables, so it never drifts from real costs. */
function MatList({ mats }: { mats: Partial<Record<Mat, number>> }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {(Object.entries(mats) as [Mat, number][]).map(([m, n]) => (
        <span key={m} className="inline-flex items-center gap-1"><MatIcon mat={m} size={16} /> {fmt(n)} {MATS[m].name}</span>
      ))}
    </div>
  );
}

export function CraftingGuide() {
  const armourMats = (Object.keys(MATS) as Mat[]).filter((m) => MATS[m].rarity >= 2);
  return (
    <div className="space-y-5 text-sm">
      <section className="slot p-3">
        <h3 className="mb-2 font-display text-lg text-gold">{tr("How to craft armour")}</h3>
        <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
          <li>{tr("Win battles, elites and Dungeon Gate boss challenges to gather materials.")}</li>
          <li>{tr("Standard recipes: pick an armour slot, then forge a recipe your level allows.")}</li>
          <li>{tr("Synthesis: forge each of the eight pieces of a set, then wear them to change your look.")}</li>
          <li>{tr("The newest sets need materials that drop only from Dungeon Gate boss challenges.")}</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 font-display text-lg text-gold">{tr("Where materials drop")}</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {armourMats.map((m) => (
            <div key={m} className="slot flex items-start gap-2 p-2" style={{ borderColor: `var(--r${Math.min(5, MATS[m].rarity)})` }}>
              <MatIcon mat={m} size={28} />
              <div>
                <div className="font-bold">{MATS[m].name}</div>
                <div className="text-xs text-muted-foreground">{MATS[m].src}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-display text-lg text-gold">{tr("Forge armour tiers")}</h3>
        <div className="space-y-2">
          {RECIPES.map((r) => (
            <div key={r.id} className="slot p-2" style={{ borderColor: `var(--r${r.rarity})` }}>
              <div className="font-bold">{r.name} <span className="text-xs text-muted-foreground">{RARITIES[r.rarity].name} {tr("· Lv")} {r.minLevel}+</span></div>
              <MatList mats={recipeMats(r, "armour")} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-display text-lg text-gold">{tr("Synthesis sets (whole set)")}</h3>
        <div className="space-y-2">
          {Array.from({ length: SYNTH_TIER_COUNT }, (_, i) => i + 1).map((t) => (
            <div key={t} className="slot p-2">
              <div className="font-bold">{tierName(t)} <span className="text-xs text-muted-foreground">{tr("· Lv")} {SYNTH_LEVELS[t - 1]}+</span></div>
              <MatList mats={setCost(t)} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
