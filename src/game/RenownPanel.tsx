import {
  Award,
  Crosshair,
  Flame,
  HeartPulse,
  ShieldCheck,
  Swords,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Hero } from "./data";
import { update } from "./store";
import {
  RENOWN_TRACKS,
  buyRenownRank,
  renown,
  renownBlocker,
  renownCost,
  renownRank,
  renownText,
  renownTotal,
} from "./renown";
import { fmt } from "./ui";

const ICONS: Record<string, LucideIcon> = {
  might: Swords,
  vigour: HeartPulse,
  guard: ShieldCheck,
  precision: Crosshair,
  footwork: Wind,
  ferocity: Flame,
};

/** Renown badge — the battle-earned currency of the hero's own upgrades. */
export function RenownBadge({ n }: { n: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-bold text-[#f0b429]"
      title="Renown — earned from every battle you win"
    >
      <Award className="h-4 w-4" />
      {fmt(n)}
    </span>
  );
}

/**
 * Hero training: the Renown the hero earns by winning fights, spent on the hero
 * himself. No gold, no barracks level, no building gate — six short ladders of
 * permanent stats that any player can climb just by playing.
 */
export function RenownTraining({ hero }: { hero: Hero }) {
  const banked = renown(hero);
  return (
    <div className="slot p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-display text-lg text-gold">
          <Award className="h-5 w-5" />
          Hero training
          <RenownBadge n={banked} />
        </div>
        <span className="text-xs text-muted-foreground">{renownTotal(hero)} ranks trained</span>
      </div>
      <p className="mb-3 mt-1 text-xs text-muted-foreground">
        Every battle you win pays Renown, and Renown buys permanent upgrades for the hero alone — no
        gold and no barracks level involved. Losses pay nothing, so the training grows with your
        fighting.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {RENOWN_TRACKS.map((t) => {
          const Icon = ICONS[t.id] ?? Award;
          const rank = renownRank(hero, t.id);
          const cost = renownCost(rank);
          const blocked = renownBlocker(hero, t.id);
          const maxed = rank >= t.max;
          return (
            <div key={t.id} className={"slot p-3 " + (maxed ? "opacity-70" : "")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display">
                  <Icon className="h-4 w-4 text-gold" />
                  {t.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  Rank {rank}/{t.max}
                </span>
              </div>
              <div className="mt-1 font-display text-2xl text-gold">{renownText(t, rank)}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
              <div className="mt-1 text-xs">
                Next rank <b className="text-gold">{renownText(t)}</b>
              </div>
              <button
                className="btn-gold mt-2 w-full py-1.5 text-sm"
                disabled={!!blocked}
                title={blocked ?? `Train ${t.name.toLowerCase()}`}
                onClick={() =>
                  update((h) => {
                    buyRenownRank(h, t.id);
                  })
                }
              >
                {maxed ? (
                  "Fully trained"
                ) : (
                  <>
                    Train rank {rank + 1} <RenownBadge n={cost} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {banked === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No Renown banked yet — win a fight at any gate and come back.
        </p>
      )}
    </div>
  );
}
