import { useState } from "react";
import { itemName, tr } from "./i18n";
import { Button } from "@/components/ui/button";
import { MatIcon } from "./MatIcon";
import { MATS, hasMats, spendMats, type Mat } from "./crafting";
import { invCap, makeItem, type Item } from "./data";
import { scaledGold } from "./gold";
import { update, useGame } from "./store";
import { Gold, ItemCard, fmt } from "./ui";
import { EPIC_SETS, EPIC_SLOTS, type EpicSet, type EpicSlot } from "./epic-armour";

/** Gold an Epic Armour piece costs for this hero. */
export const epicGold = (s: EpicSet, level: number) => scaledGold(s.gold, level);

/** Forge one Epic Armour piece. Returns an error or the new item. */
export function forgeEpic(h: Parameters<typeof spendMats>[0] & { level: number; paragon: number; gold: number; inventory: Item[]; cls: Item["cls"] }, set: EpicSet, slot: EpicSlot, cap: number): Item | string {
  if (h.level + h.paragon < set.minLevel) return `Requires level ${set.minLevel}`;
  const gold = epicGold(set, h.level);
  if (h.gold < gold) return "Not enough gold";
  if (!hasMats(h, set.mats)) return "Missing materials";
  if (h.inventory.length >= cap) return "Bag is full";
  h.gold -= gold;
  spendMats(h, set.mats);
  const base = makeItem(h.cls, h.level + Math.floor(h.paragon / 2), 4, slot);
  const it: Item = { ...base, crafted: true, epic: set.id, name: `${set.name} ${base.name.split(" ").slice(1).join(" ")}`.trim() };
  h.inventory.unshift(it);
  return it;
}

/** The Epic Armours tab beside Synthesis. */
export function EpicArmoursTab() {
  const { hero } = useGame();
  const [slot, setSlot] = useState<EpicSlot>("armour");
  const [last, setLast] = useState<Item | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  if (!hero) return null;
  const forge = (s: EpicSet) => {
    update((h) => {
      const out = forgeEpic(h, s, slot, invCap(h));
      if (typeof out === "string") setMsg({ ok: false, t: out });
      else { setLast(out); setMsg({ ok: true, t: `Forged ${itemName(out.name)}!` }); }
    });
  };
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{tr("Epic Armours are forged sets whose every piece carries far higher stats than its rarity. Each set needs its own rare materials, and each of those drops from one place only.")}</p>
      <div className="mb-3 flex flex-wrap gap-1">
        {EPIC_SLOTS.map((s) => <Button key={s} size="sm" variant={slot === s ? "default" : "ghost"} onClick={() => setSlot(s)}>{tr(s)}</Button>)}
      </div>
      {msg && <p className={`mb-2 text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-2">
          {EPIC_SETS.map((s) => {
            const locked = hero.level + hero.paragon < s.minLevel;
            const can = !locked && hasMats(hero, s.mats) && hero.gold >= epicGold(s, hero.level);
            return (
              <div key={s.id} className="slot epic-row p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <b className="font-display text-base text-r4">{tr(s.name)}</b>
                    <span className="ml-2 text-xs text-muted-foreground">{tr("Lv")} {s.minLevel}+ · ×{s.mult} {tr("stats")}</span>
                    <p className="text-xs text-muted-foreground">{tr(s.desc)}</p>
                  </div>
                  <Button variant="ghost" className="btn-gold px-3 py-1 text-xs" disabled={!can} onClick={() => forge(s)}>
                    {tr("Forge")} · <Gold n={epicGold(s, hero.level)} className="text-primary-foreground" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {(Object.entries(s.mats) as [Mat, number][]).map(([m, n]) => {
                    const have = hero.mats?.[m] ?? 0;
                    return (
                      <span key={m} className={`flex items-center gap-1 ${have >= n ? "" : "text-hp"}`} title={`${MATS[m].name} — ${MATS[m].src}`}>
                        <MatIcon mat={m} size={20} /> {fmt(have)}/{fmt(n)} {MATS[m].name}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div>
          {last ? <ItemCard item={last} /> : <p className="py-10 text-center text-muted-foreground">{tr("Your newest Epic Armour appears here.")}</p>}
        </div>
      </div>
    </div>
  );
}
