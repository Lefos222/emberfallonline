import { t } from "./i18n";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Verdict } from "./battle-advice";
import type { Hero } from "./data";
import { STAMINA_PER_DAY, potionCount, staminaLeft } from "./stamina";
import { fmt } from "./ui";

/**
 * Shared pieces of the three gates (Campaign, Endless Conquest and Dungeon): the stamina plate,
 * the slim meters every card uses, the fight-danger verdict and the stage/floor picker.
 *
 * Presentation only — every cost, reward and restriction still comes from the gate that passes
 * it in (see stamina.ts, conquest.ts and endgame.ts).
 */

/** A slim progress bar. `fill` picks its colour from the bar-* classes in styles.css. */
export function Meter({
  value,
  max,
  fill = "bar-xp",
  label,
  className = "",
}: {
  value: number;
  max: number;
  fill?: string;
  label?: string;
  className?: string;
}) {
  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  return (
    <div
      className={`bar-track h-2.5 w-full ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      aria-valuenow={Math.round(Math.max(0, Math.min(value, safeMax)))}
    >
      <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * The stamina plate both gates share: what is left, how many runs it pays for, the potion pouch.
 * `compact` trims it to the single line the gates' status strips use, so the whole gate fits on
 * one screen without scrolling.
 */
export function StaminaMeter({
  hero,
  cost,
  unit,
  compact = false,
}: {
  hero: Hero;
  cost: number;
  unit: "battle" | "run";
  compact?: boolean;
}) {
  const left = staminaLeft(hero);
  const runs = Math.floor(left / Math.max(1, cost));
  const potions = potionCount(hero);
  const short = left < cost;
  if (compact) {
    return (
      <div
        className="slot flex items-center gap-2 px-2.5 py-1.5 text-xs"
        title={`${cost} per ${unit} · refills at Greek midnight`}
      >
        <span className="font-display text-gold">{t("Stamina")}</span>
        <b className={short ? "text-hp" : ""}>{fmt(left)}</b>
        <span className="text-muted-foreground">/ {STAMINA_PER_DAY}</span>
        <span className="w-16 shrink-0">
          <Meter
            value={left}
            max={STAMINA_PER_DAY}
            fill="bar-stamina"
            label={t("Stamina left today")}
          />
        </span>
        <span className="text-muted-foreground">
          · {runs} {unit}
          {runs === 1 ? "" : "s"} {t("left")}
        </span>
        {potions > 0 && (
          <span className="text-muted-foreground">
            · {potions} {t("potion")}
            {potions === 1 ? "" : "s"}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="slot p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-gold">{t("Stamina")}</span>
        <span className={`font-bold ${short ? "text-hp" : ""}`}>
          {fmt(left)}
          <span className="text-xs font-normal text-muted-foreground"> / {STAMINA_PER_DAY}</span>
        </span>
      </div>
      <Meter
        value={left}
        max={STAMINA_PER_DAY}
        fill="bar-stamina"
        label={t("Stamina left today")}
        className="mt-1.5"
      />
      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
        <span>
          <b className="text-foreground">{cost}</b> {t("per")} {unit} · ≈
          <b className="text-foreground">{runs}</b> {unit}
          {runs === 1 ? "" : "s"} {t("left")}{" "}
        </span>
        <span>
          {potions > 0
            ? `${potions} potion${potions === 1 ? "" : "s"} in the pouch`
            : t("Refills at Greek midnight")}
        </span>
      </div>
    </div>
  );
}

/** The colour language every gate shares for a fight's verdict (see forecastFight in battle-advice.ts). */
export const VERDICT_STYLE: Record<Verdict, { t: string; c: string }> = {
  Easy: { t: "Easy", c: "text-r1" },
  Fair: { t: "Fair", c: "text-r4" },
  Hard: { t: "Hard", c: "text-hp" },
  Deadly: { t: "Deadly", c: "text-blood" },
};

/** How the chosen fight compares to the hero, in the game's own colour language. */
export function DangerPill({
  danger,
  className = "",
}: {
  danger: { t: string; c: string };
  className?: string;
}) {
  return (
    <span
      className={`rounded bg-background/85 px-2 py-0.5 font-display text-xs font-bold ${danger.c} ${className}`}
      title={t("How this fight compares to your battle rating")}
    >
      {danger.t}
    </span>
  );
}

/**
 * The stage (or floor) picker: one clear number field flanked by steps, plus the last few stages
 * as one-tap chips so nobody has to type a number on a phone.
 */
export function StageStepper({
  value,
  max,
  onChange,
  title,
  noun,
  inputLabel,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  title: string;
  noun: string;
  inputLabel: string;
}) {
  const top = Math.max(1, max);
  const from = Math.max(1, top - 4);
  const chips = Array.from({ length: top - from + 1 }, (_, i) => from + i);
  return (
    <div className="slot p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-sm text-gold">{title}</span>
        <span className="text-[11px] text-muted-foreground">
          {value >= top
            ? `Your frontier — the furthest ${noun} you have reached`
            : `${top - value} behind your frontier`}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <button
          className="btn-ghost h-9 px-2 text-xs"
          aria-label={`Back ten ${noun}s`}
          disabled={value <= 1}
          onClick={() => onChange(value - 10)}
        >
          −10
        </button>
        <button
          className="btn-blood flex h-10 w-10 shrink-0 items-center justify-center"
          aria-label={`Previous ${noun}`}
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={top}
          value={value}
          aria-label={inputLabel}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
          className="w-24 rounded border border-border bg-background px-2 py-1.5 text-center font-display text-3xl text-gold"
        />
        <button
          className="btn-blood flex h-10 w-10 shrink-0 items-center justify-center"
          aria-label={`Next ${noun}`}
          disabled={value >= top}
          onClick={() => onChange(value + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          className="btn-ghost h-9 px-2 text-xs"
          aria-label={`Ahead ten ${noun}s`}
          disabled={value >= top}
          onClick={() => onChange(value + 10)}
        >
          +10
        </button>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {chips.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-pressed={n === value}
            title={n === top ? `Your frontier — ${noun} ${n}` : `${noun} ${n}`}
            className={`${n === value ? "btn-gold" : "btn-ghost"} px-2.5 py-1 text-xs`}
          >
            {n}
            {n === top && (
              <span className="ml-1 text-[10px] uppercase tracking-wide opacity-80">
                {t("frontier")}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One row of a gate's rating ladder: the floor, what it asks, and where the hero stands. */
export interface LadderFloor {
  floor: number;
  required: number;
  /** A boss floor asks a spike above its neighbours — marked so the spike reads as planned. */
  boss?: boolean;
  met: boolean;
  gap: number;
}

/**
 * The gate's rating ladder: what every floor asks of a hero, in Battle Rating, and whether the
 * hero reading it covers that floor (see floorRequirement in floor-rating.ts). Floors past the
 * frontier are shown but not pickable — the climb still starts from the deepest floor reached.
 */
export function FloorLadder({
  rows,
  current,
  frontier,
  onPick,
  noun,
  rating,
}: {
  rows: LadderFloor[];
  current: number;
  frontier: number;
  onPick: (n: number) => void;
  /** "Floor" or "Stage", already in the player's language. */
  noun: string;
  rating: number;
}) {
  const active = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    active.current?.scrollIntoView?.({ block: "nearest" });
  }, [current]);
  if (!rows.length) return null;
  return (
    <div className="slot p-2.5">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="font-display text-sm text-gold">{t("Rating by floor")}</span>
        <span className="text-[11px] text-muted-foreground">
          {t("Battle Rating each floor asks of you")} · {t("You")}{" "}
          <b className="text-foreground">{fmt(rating)}</b>
        </span>
      </div>
      <ul className="max-h-40 space-y-0.5 overflow-y-auto pr-1">
        {rows.map((r) => {
          const locked = r.floor > frontier;
          const here = r.floor === current;
          return (
            <li key={r.floor} ref={here ? active : undefined}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onPick(r.floor)}
                aria-current={here ? "true" : undefined}
                title={locked ? t("Clear the floor below it first") : undefined}
                className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[11px] ${
                  here ? "bg-gold/15 ring-1 ring-gold/40" : "hover:bg-background/60"
                } ${locked ? "opacity-50" : ""}`}
              >
                <span className="w-20 shrink-0 tabular-nums">
                  {noun} <b className="text-foreground">{r.floor}</b>
                  {r.boss && (
                    <span className="ml-1 text-[9px] uppercase tracking-wide text-blood">
                      {t("BOSS")}
                    </span>
                  )}
                </span>
                <span className={`tabular-nums font-bold ${r.met ? "text-r1" : "text-hp"}`}>
                  {fmt(r.required)}
                </span>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {r.met ? t("you meet it") : `${t("short")} ${fmt(r.gap)}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A compact reward chip used by the gates' "what this pays" rows. */
export function RewardChip({
  children,
  tone = "",
  title,
}: {
  children: React.ReactNode;
  tone?: string;
  title?: string;
}) {
  return (
    <span
      className={`flex items-center gap-1 rounded border border-border/60 bg-background/60 px-2 py-1 text-xs font-bold ${tone}`}
      title={title}
    >
      {children}
    </span>
  );
}
