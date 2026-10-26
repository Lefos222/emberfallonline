import { Crosshair, Eye, Heart, Lock, Shield, Swords, Trophy, Wind, type LucideIcon } from "lucide-react";
import type { Hero } from "./data";
import { BARRACKS_MAX, BARRACKS_UNLOCKS, barracksCost, barracksLevel, trainingDiscount, upgradeBarracks } from "./barracks";
import { DRILLS, drillBlocker, drillCost, drillRank, drillText, trainDrill } from "./drills";
import { update } from "./store";
import { Gold } from "./ui";

/** Barracks upgrade card: level, cost and everything that unlocks on the way to level 30. */
export function BarracksUpgrade({ hero }: { hero: Hero }) {
  const level = barracksLevel(hero);
  const maxed = level >= BARRACKS_MAX;
  const cost = barracksCost(level, hero.level);
  const discount = Math.round(trainingDiscount(hero) * 100);
  return (
    <div className="slot mb-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg text-gold"><Trophy className="mr-1 inline h-4 w-4" />Barracks level {level} / {BARRACKS_MAX}</div>
          <div className="text-xs text-muted-foreground">Training costs {discount}% less gold. Bigger batches, instructor grades and the drill yard unlock as it levels up.</div>
        </div>
        <button className="btn-gold px-4 py-2" disabled={maxed || hero.gold < cost} onClick={() => update((h) => { upgradeBarracks(h); })}>
          {maxed ? "Fully upgraded" : <>Upgrade level {level + 1} <Gold n={cost} className="text-primary-foreground" /></>}
        </button>
      </div>
      <div className="bar-track mt-3 h-2"><div className="bar-xp h-full" style={{ width: Math.round((level / BARRACKS_MAX) * 100) + "%" }} /></div>
      <div className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {BARRACKS_UNLOCKS.map((u) => (
          <div key={u.level} className={"flex items-start gap-2 " + (level >= u.level ? "" : "opacity-50")}>
            {level >= u.level ? <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> : <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            <span><b>Lv {u.level} · {u.name}</b><span className="block text-muted-foreground">{u.desc}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DRILL_ICONS: Record<string, LucideIcon> = {
  weapons: Swords, shields: Shield, endurance: Heart, focus: Crosshair, marksman: Eye, footwork: Wind,
};

/**
 * The drill yard: permanent barracks tracks beside the four attributes. Each rank is paid for in
 * gold (rising with the rank and the hero's level) and needs the barracks building leveled up.
 */
export function DrillTracks({ hero }: { hero: Hero }) {
  const level = barracksLevel(hero);
  return (
    <div className="mt-6">
      <div className="mb-1 flex items-center gap-2 font-display text-sm text-gold"><Swords className="h-4 w-4" />Barracks drills</div>
      <p className="mb-3 text-xs text-muted-foreground">
        Permanent training beside the attributes: every rank is bought with gold, costs more than the last,
        and the deeper drills need the barracks itself upgraded.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DRILLS.map((d) => {
          const Icon = DRILL_ICONS[d.id] ?? Swords;
          const rank = drillRank(hero, d.id);
          const cost = drillCost(d, rank, hero.level);
          const blocked = drillBlocker(hero, d.id);
          const locked = level < d.barracks;
          return (
            <div key={d.id} className={"slot p-3 " + (locked ? "opacity-60" : "")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display"><Icon className="h-4 w-4 text-gold" />{d.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">Rank {rank}/{d.max}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{d.desc}</div>
              <div className="mt-1 text-xs">Now <b>{rank ? drillText(d, rank) : "—"}</b> · next <b className="text-gold">{drillText(d, 1)}</b></div>
              <button className="btn-gold mt-2 w-full py-1.5 text-sm" disabled={!!blocked} title={blocked ?? "Train this rank"}
                onClick={() => update((h) => { trainDrill(h, d.id); })}>
                {rank >= d.max ? "Fully drilled" : locked ? <>Barracks level {d.barracks}</> : <>Train rank {rank + 1} <Gold n={cost} className="text-primary-foreground" /></>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
