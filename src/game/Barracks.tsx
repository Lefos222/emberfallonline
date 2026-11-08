import { ChevronRight, Clover, Crosshair, Eye, Heart, HeartPulse, Lock, Shield, ShieldCheck, Sparkles, Swords, Trophy, Wind, type LucideIcon } from "lucide-react";
import type { Hero } from "./data";
import { BARRACKS_UNLOCKS, barracksCost, barracksLevel, trainingDiscount, upgradeBarracks } from "./barracks";
import {
  ADVANCED_DRILLS, ATTRIBUTE_DRILLS, DRILLS, advancedBlocker, advancedCost, advancedRank, attrDrillBlocker, attrDrillCost, attrDrillRank,
  drillBlocker, drillCost, drillRank, drillText, trainAdvanced, trainAttributeDrill, trainDrill,
} from "./drills";
import { update } from "./store";
import { Gold, VoidCrystals } from "./ui";

/** Barracks upgrade card: level, cost and everything that unlocks along the way. The building never maxes out. */
export function BarracksUpgrade({ hero }: { hero: Hero }) {
  const level = barracksLevel(hero);
  const cost = barracksCost(level, hero.level);
  const discount = Math.round(trainingDiscount(hero) * 100);
  const next = BARRACKS_UNLOCKS.find((u) => u.level > level);
  return (
    <div className="slot mb-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg text-gold"><Trophy className="mr-1 inline h-4 w-4" />Barracks level {level}</div>
          <div className="text-xs text-muted-foreground">
            Training costs {discount}% less gold. Bigger batches, instructor grades and the drill yard unlock as it levels up —
            the building has no final level.
          </div>
        </div>
        <button className="btn-gold px-4 py-2" disabled={hero.gold < cost} onClick={() => update((h) => { upgradeBarracks(h); })}>
          Upgrade level {level + 1} <Gold n={cost} className="text-primary-foreground" />
        </button>
      </div>
      <div className="bar-track mt-3 h-2"><div className="bar-xp h-full" style={{ width: Math.round(Math.min(1, discount / 60) * 100) + "%" }} /></div>
      {next && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5" />Next at level {next.level}: <b>{next.name}</b> — {next.desc}
        </div>
      )}
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
  vitality: HeartPulse, weapons: Swords, shields: Shield, endurance: Heart, recovery: Sparkles,
  focus: Crosshair, toughness: Heart, marksman: Eye, guardwork: ShieldCheck, footwork: Wind,
};

const ATTR_DRILL_ICONS: Record<string, LucideIcon> = { str: Swords, int: Sparkles, agi: Clover, vit: Heart };

/**
 * Attribute drills: the four attributes themselves, upgraded rank by rank in the barracks.
 * Each rank permanently banks points of that attribute, on top of the training batches above.
 */
export function AttributeDrills({ hero }: { hero: Hero }) {
  const level = barracksLevel(hero);
  return (
    <div className="mt-6">
      <div className="mb-1 flex items-center gap-2 font-display text-sm text-gold"><Swords className="h-4 w-4" />Attribute drills</div>
      <p className="mb-3 text-xs text-muted-foreground">
        Permanent upgrades for the four attributes: every rank banks its points for good, costs more than
        the last, and the deeper ranks need the barracks itself upgraded.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {ATTRIBUTE_DRILLS.map((d) => {
          const Icon = ATTR_DRILL_ICONS[d.id] ?? Swords;
          const rank = attrDrillRank(hero, d.id);
          const cost = attrDrillCost(d, rank, hero.level);
          const blocked = attrDrillBlocker(hero, d.id);
          const locked = level < d.barracks;
          return (
            <div key={d.id} className={"slot p-3 text-center " + (locked ? "opacity-60" : "")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display"><Icon className="h-4 w-4 text-gold" />{d.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">Rank {rank}/{d.max}</span>
              </div>
              <div className="mt-1 font-display text-2xl text-gold">+{d.per * rank}</div>
              <div className="text-xs text-muted-foreground">{d.desc}</div>
              <div className="mt-1 text-xs">Next rank <b className="text-gold">+{d.per} {d.name}</b></div>
              <button className="btn-gold mt-2 w-full py-1.5 text-sm" disabled={!!blocked} title={blocked ?? `Drill rank ${rank + 1}`}
                onClick={() => update((h) => { trainAttributeDrill(h, d.id); })}>
                {rank >= d.max ? "Fully drilled" : locked ? <>Barracks level {d.barracks}</> : <>Train rank {rank + 1} <Gold n={cost} className="text-primary-foreground" /></>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ADVANCED_ICONS: Record<string, LucideIcon> = { str: Swords, int: Sparkles, agi: Clover, vit: Heart };

/**
 * The advanced wing: stronger versions of the four attribute drills, paid for in Void Crystals
 * instead of gold. There is no final rank — the crystals a hero earns keep turning into strength.
 */
export function AdvancedTraining({ hero }: { hero: Hero }) {
  const level = barracksLevel(hero);
  const crystals = hero.voidCrystals ?? 0;
  return (
    <div className="mt-6">
      <div className="mb-1 flex flex-wrap items-center gap-2 font-display text-sm text-gold">
        <VoidCrystals n={crystals} />
        <span>Advanced training</span>
        <span className="text-xs font-normal text-muted-foreground">· paid in Void Crystals · no rank limit</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        The barracks' deepest drills: every rank banks five points of an attribute for good and costs Void
        Crystals, earned from level-ups and from every boss you defeat. Ranks never run out.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {ADVANCED_DRILLS.map((d) => {
          const Icon = ADVANCED_ICONS[d.id] ?? Swords;
          const rank = advancedRank(hero, d.id);
          const cost = advancedCost(d, rank, level);
          const blocked = advancedBlocker(hero, d.id);
          const locked = level < d.barracks;
          return (
            <div key={d.id} className={"slot p-3 text-center " + (locked ? "opacity-60" : "")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display"><Icon className="h-4 w-4 text-void" />Advanced {d.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">Rank {rank}</span>
              </div>
              <div className="mt-1 font-display text-2xl text-void">+{d.per * rank}</div>
              <div className="text-xs text-muted-foreground">{d.desc}</div>
              <div className="mt-1 text-xs">Next rank <b className="text-void">+{d.per} {d.name}</b></div>
              <button className="btn-gold mt-2 w-full py-1.5 text-sm" disabled={!!blocked} title={blocked ?? `Advanced rank ${rank + 1}`}
                onClick={() => update((h) => { trainAdvanced(h, d.id); })}>
                {locked ? <>Barracks level {d.barracks}</> : <>Train rank {rank + 1} <VoidCrystals n={cost} className="text-primary-foreground" /></>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
