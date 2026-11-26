import { useMemo } from "react";
import { Swords } from "lucide-react";
import { Sprite } from "./Sprite";
import { BattleCharacter } from "./BattleArt";
import { HeroPortrait } from "./HeroPortrait";
import { tr, tName } from "./i18n";
import type { HeroClass } from "./data";
import type { SpriteRect } from "./world";
import type { HeroFace } from "./customization";
import type { Unit } from "./combat";

/** One hero as the static combat screen shows them. Cosmetic fields are optional. */
export interface StageHero {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  crit: number;
  dodge: number;
  cls?: HeroClass;
  gender?: "male" | "female";
  look?: number | null;
  synth?: number | null;
  face?: Partial<HeroFace> | null;
  /** Damage this hero dealt in the fight, when the caller tracks contribution. */
  damage?: number;
}

/** One enemy (or boss) card. */
export interface StageFoe {
  id: string;
  name: string;
  level?: number;
  hp: number;
  maxHp: number;
  atk?: number;
  def?: number;
  crit?: number;
  dodge?: number;
  boss?: boolean;
  elite?: boolean;
  cls?: HeroClass;
  sprite?: SpriteRect;
  /** A painted monster image, when the foe has one (see the Party Spire's floors). */
  img?: string;
}

const bar = (hp: number, max: number) => Math.max(0, Math.min(100, (hp / Math.max(1, max)) * 100));

function StatLine({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/40 py-0.5 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${muted ? "text-muted-foreground" : ""}`}>{value}</span>
    </div>
  );
}

function FoeArt({ foe, className = "" }: { foe: StageFoe; className?: string }) {
  // The painted monster art, or a class model for named human opponents.
  const unit = useMemo(
    () =>
      ({
        id: foe.id,
        side: "foe",
        name: foe.name,
        img: "",
        sprite: foe.sprite,
        cls: foe.cls,
        boss: foe.boss,
        elite: foe.elite,
        level: foe.level ?? 1,
        maxHp: foe.maxHp,
        hp: foe.hp,
        atk: foe.atk ?? 0,
        def: foe.def ?? 0,
        crit: foe.crit ?? 0,
        critDmg: 200,
        dodge: foe.dodge ?? 0,
        pen: 0,
        acc: 0,
        block: 0,
        heal: 0,
      }) as Unit,
    [foe],
  );
  if (foe.img) {
    return <img src={foe.img} alt={foe.name} className={`h-full w-full object-contain ${className}`} />;
  }
  if (foe.sprite && !foe.cls) {
    return (
      <div className={`flex h-full w-full items-end justify-center ${className}`}>
        <Sprite rect={foe.sprite} className="max-h-full w-auto" />
      </div>
    );
  }
  return (
    <div className={`h-full w-full ${className}`}>
      <BattleCharacter u={unit} />
    </div>
  );
}

function HeroCard({ h }: { h: StageHero }) {
  const fallen = h.hp <= 0;
  return (
    <article className={`slot flex flex-col gap-1 p-2 ${fallen ? "opacity-45" : ""}`}>
      <div className="relative mx-auto aspect-square w-full max-w-28 overflow-hidden rounded border border-border/70 bg-background/60">
        <HeroPortrait
          cls={h.cls ?? "warrior"}
          gender={h.gender ?? "male"}
          face={h.face}
          synth={h.synth}
          look={h.look}
          className="h-full w-full"
        />
        {fallen && <span className="absolute inset-0 flex items-center justify-center bg-background/60 font-display text-sm font-black text-blood">{tr("Fallen")}</span>}
      </div>
      <div className="flex items-baseline justify-between gap-1 text-[11px] font-bold">
        <span className="truncate">{h.name}</span>
        <span className="shrink-0 text-muted-foreground">{tr("Lv")} {h.level}</span>
      </div>
      <div className="bar-track h-2.5">
        <div className="bar-hp h-full transition-all" style={{ width: `${bar(h.hp, h.maxHp)}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{Math.max(0, Math.round(h.hp)).toLocaleString()} / {Math.round(h.maxHp).toLocaleString()}</span>
        {h.damage !== undefined && <span>{tr("Dealt")} {Math.round(h.damage).toLocaleString()}</span>}
      </div>
    </article>
  );
}

function FoeCard({ foe }: { foe: StageFoe }) {
  const fallen = foe.hp <= 0;
  return (
    <article className={`slot flex flex-col gap-1 p-2 ${fallen ? "opacity-45" : ""}`}>
      <div className={`relative mx-auto aspect-square w-full max-w-36 overflow-hidden rounded border bg-background/60 ${foe.boss ? "border-blood/70" : "border-border/70"}`}>
        <FoeArt foe={foe} />
        {fallen && <span className="absolute inset-0 flex items-center justify-center bg-background/60 font-display text-sm font-black text-blood">{tr("Fallen")}</span>}
      </div>
      <div className="flex items-baseline justify-between gap-1 text-[11px] font-bold">
        <span className="truncate">
          {foe.boss && <span className="mr-0.5 text-blood">☠ </span>}
          {foe.elite && <span className="mr-0.5 text-r4">★ </span>}
          {tName(foe.name)}
        </span>
        {foe.level !== undefined && <span className="shrink-0 text-muted-foreground">{tr("Lv")} {foe.level}</span>}
      </div>
      <div className="bar-track h-2.5">
        <div className="bar-hp h-full transition-all" style={{ width: `${bar(foe.hp, foe.maxHp)}%` }} />
      </div>
      <div className="text-[9px] text-muted-foreground">
        {Math.max(0, Math.round(foe.hp)).toLocaleString()} / {Math.round(foe.maxHp).toLocaleString()}
      </div>
    </article>
  );
}

/**
 * The static combat screen: both sides as cards, their health and stats, and the blow-by-blow
 * text of the fight that was already calculated. Nothing here is animated or interactive — it is
 * an encounter report, Shakes & Fidget style, not a playable battlefield.
 */
export function CombatStage({
  title,
  subtitle,
  heroes,
  foes,
  log,
  round,
  outcome,
  header,
  footer,
}: {
  title?: string;
  subtitle?: string;
  heroes: StageHero[];
  foes: StageFoe[];
  log: string[];
  round?: number;
  outcome?: "won" | "lost" | "fallen" | "summit" | null;
  /** Extra controls above the stage (a Leave button, the climb's progress, …). */
  header?: React.ReactNode;
  /** The screen's buttons, under the log. */
  footer?: React.ReactNode;
}) {
  const heroCols = heroes.length > 2 ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col gap-2 p-3 md:p-4">
      {(title || header) && (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {title && <div className="truncate font-display text-xl panel-title md:text-2xl">{title}</div>}
            {subtitle && <div className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-2">{header}</div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 items-start gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
        <div className={`grid ${heroCols} gap-2`}>
          {heroes.slice(0, 4).map((h) => <HeroCard key={h.id} h={h} />)}
        </div>

        <div className="flex flex-col items-center justify-center gap-1 self-center px-1 text-center">
          <Swords className="h-5 w-5 text-gold/70" aria-hidden="true" />
          <span className="font-display text-lg text-muted-foreground">vs</span>
          {round !== undefined && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tr("Round")} {round}</span>}
        </div>

        <div className="grid gap-2">
          {foes.map((f) => <FoeCard key={f.id} foe={f} />)}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="slot hidden p-2 md:block" aria-label={tr("Character stats")}>
          <h3 className="mb-1 font-display text-xs uppercase tracking-widest text-gold">{tr("Character stats")}</h3>
          {heroes.map((h) => (
            <div key={h.id} className="mb-1.5">
              <div className="truncate text-[11px] font-bold">{h.name}</div>
              <StatLine label={tr("Attack")} value={Math.round(h.atk).toLocaleString()} />
              <StatLine label={tr("Defense")} value={Math.round(h.def).toLocaleString()} />
              <StatLine label={tr("Crit")} value={`${Math.round(h.crit)}%`} />
              <StatLine label={tr("Dodge")} value={`${Math.round(h.dodge)}%`} />
              {h.damage !== undefined && <StatLine label={tr("Damage dealt")} value={Math.round(h.damage).toLocaleString()} />}
            </div>
          ))}
        </section>

        <section className="slot flex min-h-24 flex-col p-2" aria-label={tr("Hit damage updates")}>
          <h3 className="mb-1 font-display text-xs uppercase tracking-widest text-gold">{tr("Hit damage updates")}</h3>
          <div className="max-h-32 min-h-0 flex-1 overflow-y-auto text-[11px] leading-snug">
            {log.length === 0 && <p className="text-muted-foreground">{tr("The fight has not started.")}</p>}
            {log.map((line, i) => (
              <div key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{line}</div>
            ))}
          </div>
          {outcome && (
            <div className={`mt-1 text-center font-display text-lg font-black ${outcome === "won" || outcome === "summit" ? "text-gold" : "text-blood"}`}>
              {outcome === "won" ? tr("VICTORY") : outcome === "summit" ? tr("Summit conquered") : outcome === "fallen" ? tr("The party fell") : tr("DEFEAT")}
            </div>
          )}
        </section>

        <section className="slot hidden p-2 md:block" aria-label={tr("Enemy stats")}>
          <h3 className="mb-1 font-display text-xs uppercase tracking-widest text-blood">{tr("Enemy stats")}</h3>
          {foes.map((f) => (
            <div key={f.id} className="mb-1.5">
              <div className="truncate text-[11px] font-bold">{tName(f.name)}</div>
              {f.atk !== undefined && <StatLine label={tr("Attack")} value={Math.round(f.atk).toLocaleString()} />}
              {f.def !== undefined && <StatLine label={tr("Defense")} value={Math.round(f.def).toLocaleString()} />}
              {f.crit !== undefined && <StatLine label={tr("Crit")} value={`${Math.round(f.crit)}%`} />}
              {f.dodge !== undefined && <StatLine label={tr("Dodge")} value={`${Math.round(f.dodge)}%`} />}
            </div>
          ))}
        </section>
      </div>

      {footer && <div className="flex flex-col items-center gap-2 pb-1">{footer}</div>}
    </div>
  );
}
