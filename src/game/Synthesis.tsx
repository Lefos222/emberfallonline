import { useState } from "react";
import { Check, Hammer, Lock, Shield, Sparkles, X } from "lucide-react";
import { CharacterModel } from "./CharacterModel";
import { GearIcon } from "./GearIcon";
import { MatIcon } from "./MatIcon";
import { update, useGame } from "./store";
import { MATS, matCount, type Mat } from "./crafting";
import { CLASSES, type Hero, type HeroClass, type Item, type Slot } from "./data";
import {
  SYNTH_LEVELS, SYNTH_SLOTS, SYNTH_SLOT_LABEL, SYNTH_TIER_COUNT, SYNTH_UNLOCK_LEVEL, SYNTH_WEAPON,
  appearanceTier, craftSynth, fxLine, overallProgress, pieceName, pieceState, setCost, setProgress,
  synthLevel, synthUnlocked, tierName, tierOverview, unlockedTier, unwearSynth, wearSynth, type SynthSlot,
} from "./synthesis";

/** Where each synthesis piece borrows its atlas art from. */
const ICON_SLOT: Record<SynthSlot, Slot> = {
  helmet: "helmet", chest: "armour", belt: "belt", boots: "boots",
  ring1: "ring", ring2: "ring", sigil: "talisman", weapon: "weapon",
};

function PieceIcon({ slot, tier, cls, size = 34 }: { slot: SynthSlot; tier: number; cls: HeroClass; size?: number }) {
  const icon: Pick<Item, "slot" | "cls" | "icon"> = {
    slot: ICON_SLOT[slot], cls,
    icon: slot === "ring2" ? (tier + 2) % 8 : (tier - 1) % 6,
  };
  return <GearIcon item={icon} size={size} />;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/** The top strip: where the character stands and what opens next. */
function Header({ hero }: { hero: Hero }) {
  const prog = overallProgress(hero);
  const next = prog.unlocked < SYNTH_TIER_COUNT ? prog.unlocked + 1 : null;
  const cell = (label: string, value: string, hint?: string) => (
    <div className="slot px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-sm text-gold">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
  return (
    <div className="mb-3">
      <div className="grid gap-1.5 sm:grid-cols-4">
        {cell("Character level", String(synthLevel(hero)), hero.paragon ? `Level ${hero.level} · Ascension ${hero.paragon}` : undefined)}
        {cell("Synthesis progress", `${prog.crafted}/${prog.total} pieces`, `${prog.complete} of ${SYNTH_TIER_COUNT} sets complete`)}
        {cell("Current set", prog.unlocked ? tierName(prog.unlocked) : "Locked", prog.unlocked ? undefined : `The forge opens at level ${SYNTH_UNLOCK_LEVEL}`)}
        {cell("Next set", next ? tierName(next) : "None — all unlocked", next ? `Requires level ${SYNTH_LEVELS[next - 1]}` : "The last milestone is reached")}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-secondary" role="progressbar" aria-label="Synthesis progress" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.crafted}>
        <div className="h-full bg-gold" style={{ width: `${(prog.crafted / prog.total) * 100}%` }} />
      </div>
    </div>
  );
}

/** The nine sets, locked ones included. */
function TierRail({ hero, tier, onPick }: { hero: Hero; tier: number; onPick: (t: number) => void }) {
  return (
    <div className="mb-3" role="group" aria-label="Synthesis sets">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-display text-sm text-gold">All nine sets</span>
        <span className="text-[10px] text-muted-foreground">A new set every ten levels · level {SYNTH_LEVELS[0]} to {SYNTH_LEVELS[SYNTH_TIER_COUNT - 1]}</span>
      </div>
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-9">
        {tierOverview(hero).map((t) => (
          <button key={t.tier} onClick={() => onPick(t.tier)} aria-pressed={t.tier === tier}
            aria-label={`${tierName(t.tier)}, ${t.unlocked ? `${t.crafted} of ${t.total} forged` : `locked until level ${t.level}`}`}
            className={`slot flex flex-col items-center px-1 py-1 text-[10px] leading-tight transition ${t.tier === tier ? "ring-2 ring-gold" : ""} ${t.unlocked ? "" : "opacity-60"}`}>
            <span className="font-display text-xs text-gold">{ROMAN[t.tier - 1]}</span>
            {t.unlocked ? (
              <>
                <span className={t.crafted === t.total ? "text-r1" : "text-muted-foreground"}>{t.crafted}/{t.total}</span>
                {t.worn > 0 && <span className="text-gold">worn</span>}
              </>
            ) : (
              <><Lock className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Lv {t.level}</span></>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The eight pieces of the chosen set, each showing whether it is forged and worn. */
function PieceGrid({ hero, tier, slot, onPick }: { hero: Hero; tier: number; slot: SynthSlot; onPick: (s: SynthSlot) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {SYNTH_SLOTS.map((s) => {
        const st = pieceState(hero, tier, s);
        const label = s === "weapon" ? SYNTH_WEAPON[hero.cls] : SYNTH_SLOT_LABEL[s];
        return (
          <button key={s} onClick={() => onPick(s)} aria-pressed={s === slot}
            className={`slot relative flex flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] transition hover:scale-[1.03] ${s === slot ? "ring-2 ring-gold" : ""} ${st.crafted ? "rarity-3" : st.locked ? "opacity-60" : ""}`}>
            <PieceIcon slot={s} tier={tier} cls={hero.cls} />
            <span className="w-full truncate text-center font-bold">{label}</span>
            <span className={`w-full truncate text-center ${st.crafted ? "text-r1" : "text-muted-foreground"}`}>
              {st.worn ? "Worn" : st.crafted ? "Forged" : st.locked ? `Lv ${SYNTH_LEVELS[tier - 1]}` : "Not forged"}
            </span>
            {st.worn && <span className="absolute right-0.5 top-0.5 rounded bg-gold px-0.5 text-[8px] font-bold uppercase text-background">On</span>}
            {st.crafted && !st.worn && <Check className="absolute right-0.5 top-0.5 h-3 w-3 text-r1" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

/** Requirements, stats and the forge/equip actions for the selected piece. */
function PieceDetail({ hero, tier, slot, act }: {
  hero: Hero; tier: number; slot: SynthSlot;
  act: (fn: (h: Hero) => string | null, okText: string) => void;
}) {
  const st = pieceState(hero, tier, slot);
  const name = pieceName(tier, slot, hero.cls);
  return (
    <div className="slot p-2.5">
      <div className="mb-1 flex items-center gap-2">
        <PieceIcon slot={slot} tier={tier} cls={hero.cls} size={28} />
        <div className="min-w-0">
          <div className="truncate font-display text-sm text-gold">{name}</div>
          <div className="text-[10px] text-muted-foreground">Set {ROMAN[tier - 1]} · level {SYNTH_LEVELS[tier - 1]}{st.crafted ? " · forged" : ""}</div>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-r3">
        {fxLine(st.fx).map((l) => <span key={l}>{l}</span>)}
      </div>
      <div className="mb-2 space-y-0.5 text-[11px]">
        {(Object.entries(st.cost) as [Mat, number][]).map(([m, need]) => {
          const have = matCount(hero, m);
          const short = have < need;
          return (
            <div key={m} className={`flex items-center justify-between ${short ? "text-hp" : ""}`}>
              <span className="flex items-center gap-1"><MatIcon mat={m} size={14} />{MATS[m].name}</span>
              <span className="tabular-nums">{have}/{need}</span>
            </div>
          );
        })}
      </div>
      {!st.crafted ? (
        <>
          <button className="btn-gold w-full py-2 text-sm" disabled={!!st.blocker}
            title={st.blocker ?? "Forge this piece"}
            onClick={() => act((h) => craftSynth(h, tier, slot), `Forged ${name}!`)}>
            <Hammer className="mr-1 inline h-4 w-4" />{st.locked ? `Requires level ${SYNTH_LEVELS[tier - 1]}` : "Forge piece"}
          </button>
          {st.blocker && <p className="mt-1 text-[10px] text-hp">{st.blocker}</p>}
          {!st.blocker && <p className="mt-1 text-[10px] text-r1">Materials ready — the forge is hot.</p>}
        </>
      ) : st.worn ? (
        <button className="btn-ghost w-full py-2 text-sm" onClick={() => act((h) => { unwearSynth(h, slot); return null; }, `Removed ${name}`)}>
          <X className="mr-1 inline h-4 w-4" />Remove from {SYNTH_SLOT_LABEL[slot].toLowerCase()}
        </button>
      ) : (
        <button className="btn-gold w-full py-2 text-sm" onClick={() => act((h) => wearSynth(h, tier, slot), `${name} equipped`)}>
          <Shield className="mr-1 inline h-4 w-4" />Equip piece
        </button>
      )}
    </div>
  );
}

/** Character preview plus what the worn synthesis gear adds up to. */
function HeroPreview({ hero, gender }: { hero: Hero; gender: "male" | "female" }) {
  const tier = appearanceTier(hero);
  const worn = SYNTH_SLOTS.filter((s) => hero.synth?.worn?.[s]);
  const prog = overallProgress(hero);
  return (
    <div>
      <div className="slot overflow-hidden p-1.5">
        <CharacterModel cls={hero.cls} gender={gender} synth={tier} className="mx-auto w-full max-w-[220px]" />
        <div className="mt-1 text-center">
          <div className="font-display text-sm text-gold">{tier ? tierName(tier) : CLASSES[hero.cls].name}</div>
          <div className="text-[10px] text-muted-foreground">
            {tier ? `${worn.length}/${SYNTH_SLOTS.length} pieces worn` : "Default appearance — no synthesis gear worn"}
          </div>
        </div>
      </div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        {SYNTH_SLOTS.map((s) => {
          const t = hero.synth?.worn?.[s];
          return (
            <div key={s} className="flex items-center justify-between">
              <span className={t ? "" : "text-muted-foreground"}>{s === "weapon" ? SYNTH_WEAPON[hero.cls] : SYNTH_SLOT_LABEL[s]}</span>
              <span className={t ? "text-gold" : "text-muted-foreground"}>{t ? ROMAN[t - 1] : "—"}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground">
        {prog.worn}/{SYNTH_SLOTS.length} worn · {prog.crafted}/{prog.total} forged overall.
        The appearance follows the highest set you actually wear, and it is saved with your character.
      </div>
    </div>
  );
}

/** A whole set's bill, so players can see the climb before they commit. */
function SetBill({ tier }: { tier: number }) {
  const cost = setCost(tier);
  return (
    <div className="slot px-2 py-1.5 text-[10px]">
      <div className="mb-0.5 flex items-center gap-1 font-display text-xs text-gold"><Sparkles className="h-3 w-3" />Full set {ROMAN[tier - 1]} bill</div>
      <div className="grid grid-cols-2 gap-x-2">
        {(Object.entries(cost) as [Mat, number][]).map(([m, n]) => (
          <span key={m} className="flex items-center gap-1"><MatIcon mat={m} size={12} />{MATS[m].name} <b className="text-gold">{n}</b></span>
        ))}
      </div>
      <p className="mt-1 text-muted-foreground">Eight pieces, roughly three weeks of steady grinding.</p>
    </div>
  );
}

/**
 * The Synthesis panel. It renders one hero and reports every mutation through `act`,
 * so it can be driven by the live save and by tests without a session.
 */
export function SynthesisPanel({ hero, gender, act }: {
  hero: Hero; gender: "male" | "female";
  act: (fn: (h: Hero) => string | null) => string | null;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [slot, setSlot] = useState<SynthSlot>("helmet");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  // Opens on the newest set the character can work on; the rail overrides it.
  const active = picked ?? Math.max(1, unlockedTier(hero));
  const prog = setProgress(hero, active);
  const locked = synthLevel(hero) < SYNTH_LEVELS[active - 1];
  const run = (fn: (h: Hero) => string | null, okText: string) => {
    const err = act(fn);
    setMsg(err ? { ok: false, t: err } : { ok: true, t: okText });
  };

  return (
    <div data-testid="synthesis-tab">
      <Header hero={hero} />
      {msg && <div className={`anim-pop mb-2 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</div>}
      {!synthUnlocked(hero) && (
        <p className="mb-2 rounded border border-border/60 bg-secondary/40 px-2 py-1.5 text-center text-[11px] text-muted-foreground">
          <Lock className="mr-0.5 inline h-3 w-3" />Synthesis opens at character level {SYNTH_UNLOCK_LEVEL}. The first set is forged at level {SYNTH_LEVELS[0]}.
        </p>
      )}
      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <div>
          <HeroPreview hero={hero} gender={gender} />
        </div>
        <div>
          <TierRail hero={hero} tier={active} onPick={(t) => { setPicked(t); setMsg(null); }} />
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-1">
            <span className="font-display text-sm text-gold">{tierName(active)}</span>
            <span className="text-[10px] text-muted-foreground">
              {locked ? <span className="text-hp"><Lock className="mr-0.5 inline h-3 w-3" />Unlocks at level {SYNTH_LEVELS[active - 1]}</span> : `${prog.crafted}/${prog.total} forged · ${prog.worn} worn`}
            </span>
          </div>
          <PieceGrid hero={hero} tier={active} slot={slot} onPick={(s) => { setSlot(s); setMsg(null); }} />
          {prog.crafted === SYNTH_SLOTS.length && (
            <p className="mt-1.5 text-center text-[11px] text-r1"><Sparkles className="mr-1 inline h-3 w-3" />Set {ROMAN[active - 1]} complete — every piece forged.</p>
          )}
        </div>
        <div className="space-y-2">
          <PieceDetail hero={hero} tier={active} slot={slot} act={run} />
          <SetBill tier={active} />
        </div>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Materials come from the same grind the castle already runs: battles and bosses for ore, hide, essence and cores, elites and dungeons for sigils and crystals, and refining spare drops at the Forge. No synthesis piece can be bought.
      </p>
    </div>
  );
}

/** Apply a synthesis mutation to the live save and hand back its error, if any. */
function runSave(fn: (h: Hero) => string | null): string | null {
  const box: { err: string | null } = { err: null };
  update((h) => { box.err = fn(h); });
  return box.err;
}

/** The Forge's Synthesis tab, bound to the character being played. */
export function SynthesisTab() {
  const { hero, gender } = useGame();
  if (!hero) return null;
  return <SynthesisPanel hero={hero} gender={gender} act={runSave} />;
}
