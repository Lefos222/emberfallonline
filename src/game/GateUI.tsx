import { ChevronLeft, ChevronRight } from "lucide-react";
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

/** The stamina plate both gates share: what is left, how many runs it pays for, the potion pouch. */
export function StaminaMeter({
  hero,
  cost,
  unit,
}: {
  hero: Hero;
  cost: number;
  unit: "battle" | "run";
}) {
  const left = staminaLeft(hero);
  const runs = Math.floor(left / Math.max(1, cost));
  const potions = potionCount(hero);
  const short = left < cost;
  return (
    <div className="slot p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-gold">Stamina</span>
        <span className={`font-bold ${short ? "text-hp" : ""}`}>
          {fmt(left)}
          <span className="text-xs font-normal text-muted-foreground"> / {STAMINA_PER_DAY}</span>
        </span>
      </div>
      <Meter
        value={left}
        max={STAMINA_PER_DAY}
        fill="bar-stamina"
        label="Stamina left today"
        className="mt-1.5"
      />
      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
        <span>
          <b className="text-foreground">{cost}</b> per {unit} · ≈
          <b className="text-foreground">{runs}</b> {unit}
          {runs === 1 ? "" : "s"} left
        </span>
        <span>
          {potions > 0
            ? `${potions} potion${potions === 1 ? "" : "s"} in the pouch`
            : "Refills at Greek midnight"}
        </span>
      </div>
    </div>
  );
}

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
      title="How this fight compares to your battle rating"
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
              <span className="ml-1 text-[10px] uppercase tracking-wide opacity-80">frontier</span>
            )}
          </button>
        ))}
      </div>
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
