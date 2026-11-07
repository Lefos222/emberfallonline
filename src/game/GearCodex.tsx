import { useState } from "react";
import {
  CLASSES,
  GEAR_ERAS,
  RARITIES,
  SLOTS,
  iconCount,
  itemStats,
  type HeroClass,
  type Item,
  type Slot,
} from "./data";
import { GearIcon } from "./GearIcon";

const SLOT_LABEL: Record<Slot, string> = {
  helmet: "Head", armour: "Chest", boots: "Feet", belt: "Waist",
  weapon: "Weapon", ring: "Ring", talisman: "Amulet",
};

/**
 * Read-only equipment catalogue: every painted icon from both gear updates (the original
 * class sheet and the relic sheet) with the exact stats the shared item formula gives it.
 * It never touches the save — this is the "before and after the patch" reference.
 */
export function GearCodex({ cls }: { cls: HeroClass }) {
  const [band, setBand] = useState<number>(GEAR_ERAS[0].band);
  const [rarity, setRarity] = useState(2);
  const [pick, setPick] = useState<{ slot: Slot; icon: number } | null>(null);

  const sample = (slot: Slot, icon: number): Item => ({
    id: `codex-${band}-${slot}-${icon}`,
    slot, cls, rarity, ilvl: 30, icon, art: band, enh: 0,
    name: `${RARITIES[rarity].name} ${SLOT_LABEL[slot]}`,
  });

  const picked = pick ? sample(pick.slot, pick.icon) : null;
  const pickedStats = picked ? itemStats(picked) : null;

  return (
    <details className="slot mt-4 p-3" aria-label="Gear codex">
      <summary className="cursor-pointer font-display text-sm text-gold">
        Gear codex · every icon &amp; stat
      </summary>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {CLASSES[cls].name} · both painted gear updates are kept side by side. Pick an era, a rarity and any icon.
        Synthesis sets keep their own separate sheet.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex gap-1" role="group" aria-label="Gear era">
          {GEAR_ERAS.map((era) => (
            <button key={era.name} type="button"
              className={`rounded px-2 py-1 font-bold ${band === era.band ? "rarity-5 text-gold" : "bg-secondary"}`}
              aria-pressed={band === era.band}
              onClick={() => setBand(era.band)}>{era.name}</button>
          ))}
        </div>
        <select value={rarity} onChange={(e) => setRarity(Number(e.target.value))}
          className="rounded bg-secondary px-2 py-1" aria-label="Codex rarity">
          {RARITIES.map((r, i) => <option key={r.name} value={i}>{r.name}</option>)}
        </select>
        <span className="text-muted-foreground">Item level 30</span>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {SLOTS.map((slot) => (
          <div key={slot} className="rounded border border-border/50 p-1.5">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{SLOT_LABEL[slot]}</div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: iconCount(slot) }, (_, icon) => {
                const it = sample(slot, icon);
                const s = itemStats(it);
                return (
                  <button key={icon} type="button"
                    className={`rounded p-0.5 transition hover:ring-2 hover:ring-gold ${pick?.slot === slot && pick.icon === icon ? "ring-2 ring-gold" : ""}`}
                    aria-label={`${it.name} ${slot} icon ${icon + 1}`}
                    title={`${it.name} · ATK ${s.atk} · DEF ${s.def} · HP ${s.hp} · CRIT ${s.crit}%`}
                    onClick={() => setPick({ slot, icon })}>
                    <GearIcon item={it} size={32} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {picked && pickedStats && (
        <div className="mt-3 flex items-center gap-3 rounded border border-gold/40 bg-background/60 p-2" role="status">
          <GearIcon item={picked} size={54} />
          <div>
            <div className="font-display text-sm text-gold">{picked.name}</div>
            <div className="text-xs">
              ATK +{pickedStats.atk} · DEF +{pickedStats.def} · HP +{pickedStats.hp} · CRIT +{pickedStats.crit}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {GEAR_ERAS.find((e) => e.band === band)?.note} · {RARITIES[rarity].name} · item level 30
            </div>
          </div>
        </div>
      )}
    </details>
  );
}
