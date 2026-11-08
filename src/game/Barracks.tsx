import { Clover, Heart, Sparkles, Swords, type LucideIcon } from "lucide-react";
import type { AttrId, AttrDrillState } from "./drills";
import { attrLevel, attrTrainCost, trainAttr } from "./drills";
import { update } from "./store";
import { Gold, fmt } from "./ui";
import type { Hero } from "./data";

/** The barracks' four cards: exactly the game's four attributes and nothing else. */
export const TRAINING_ICON: Record<AttrId, LucideIcon> = { str: Swords, int: Sparkles, agi: Clover, vit: Heart };
export const TRAINING_TINT: Record<AttrId, string> = { str: "#d1462f", int: "#a06bf0", agi: "#3fbf5a", vit: "#e04a4a" };
export const TRAINING_ATTRS: { id: AttrId; name: string; desc: string }[] = [
  { id: "str", name: "STRENGTH", desc: "+Phys attack, phys def, crit dmg, pen" },
  { id: "int", name: "INTELLIGENCE", desc: "+Magic attack, magic def, pen" },
  { id: "agi", name: "AGILITY", desc: "+Crit, dodge, accuracy, loot" },
  { id: "vit", name: "VITALITY", desc: "+Most health, both defenses" },
];

/**
 * The Barracks rework: four permanent stat tracks, each raised one level at a time with gold.
 * Ranks live in `hero.attrDrills` and join the shared stat pipeline through `drillAttrs`, so
 * there is no second stat engine. Levels never stop; only the gold price grows.
 */
export function BarracksTraining({ hero }: { hero: Hero }) {
  return (
    <div className="rounded-lg border border-[#3d2c25] bg-[#1a1210] p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-display text-lg text-gold">Barracks</div>
        <div className="text-xs text-muted-foreground">Four attributes, permanent. Every level costs gold; the price rises each time.</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {TRAINING_ATTRS.map((t) => {
          const Icon = TRAINING_ICON[t.id];
          const level = attrLevel(hero as unknown as AttrDrillState, t.id);
          const cost = attrTrainCost(hero as unknown as AttrDrillState, t.id);
          const affordable = hero.gold >= cost;
          return (
            <div key={t.id} className="flex flex-col rounded-md border border-[#3d2c25] bg-[#120c0a] p-3 text-center">
              <Icon className="mx-auto h-9 w-9" style={{ color: TRAINING_TINT[t.id] }} aria-hidden="true" />
              <div className="mt-1 font-display text-sm uppercase tracking-wider" style={{ color: "#e0d5c1" }}>{t.name}</div>
              <div className="font-display text-2xl text-gold" aria-label={`${t.name} level ${level}`}>{level}</div>
              <div className="min-h-10 text-[11px] leading-snug text-[#b9a893]">{t.desc}</div>
              <button className="btn-gold mt-2 w-full py-1.5 text-sm" disabled={!affordable}
                title={affordable ? `Raise ${t.name} to level ${level + 1}` : `Needs ${fmt(cost)} gold`}
                onClick={() => update((h) => { trainAttr(h as unknown as AttrDrillState, t.id); })}>
                <Gold n={cost} className="text-primary-foreground" />
              </button>
              <div className="mt-1 text-[10px] text-muted-foreground">Next: +1 {t.name.toLowerCase()} · level {level + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
