import { useEffect, useMemo, useRef, useState } from "react";
import { FastForward } from "lucide-react";
import arenaField from "@/assets/arena-field.jpg";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaLair from "@/assets/arena-lair.jpg";
import arenaRift from "@/assets/arena-rift.jpg";
import arenaSpire from "@/assets/arena-spire.jpg";
import arenaAbyss from "@/assets/arena-abyss.jpg";
import arenaColosseum from "@/assets/arena-colosseum.jpg";
import arenaDepths from "@/assets/arena-depths.jpg";
import { Sprite } from "./Sprite";
import { BattleCharacter } from "./BattleArt";
import { saveFastFights, readFastFights } from "./battle-prefs";
import { Button } from "@/components/ui/button";
import { collectCreature, settleCreatureDefeats } from "./encounter-collection";
import { getState, update } from "./store";
import { tName, tr } from "./i18n";
import {
  foeUnit, heroUnit, initBattle, paceGateBattle, step,
  type BattleState, type CEvent, type FighterInput, type Unit,
} from "./combat";

export type Fighter = FighterInput;

/** What the result screen needs to draw the two fighters at the bell. */
export interface BattleEndHp { hero: number; heroMax: number; foe: number; foeMax: number }

export const BATTLE_PACE = 1.45;

interface Float { id: number; tgt: string; text: string; kind: CEvent["kind"] }

export function arenaFor(title: string | undefined, boss?: boolean) {
  const t = (title ?? "").toLowerCase();
  if (/abyss|echo/.test(t)) return arenaAbyss;
  if (/spire|warden|rift path/.test(t)) return arenaSpire;
  if (/duel|arena|clash|pvp/.test(t)) return arenaColosseum;
  if (/expedition|relic|depth|dungeon|elite/.test(t)) return arenaDepths;
  if (boss || /boss|dungeon|wyrm|challenge/.test(t)) return arenaLair;
  if (/bone|crypt|elite/.test(t)) return arenaCrypt;
  if (/fiend|rift|conquest|arena/.test(t)) return arenaRift;
  return arenaField;
}

/**
 * The fight itself: two combatants trading one automatic blow each until one of them falls.
 * Nothing here needs a decision from the player — the outcome is decided by the two stat blocks
 * and the dice, exactly like Shakes & Fidget. When it is over the result screen takes over.
 */
export function Battle({ left, right, onEnd, title, gate = false }: {
  left: Fighter; right: Fighter;
  /** Accepted for callers that used to choose auto-battle; every fight is automatic now. */
  auto?: boolean;
  onEnd: (won: boolean, hp?: BattleEndHp) => void | Promise<void>;
  title?: string;
  /** A War Gate monster fight: paced to about 10-15 s. */
  gate?: boolean;
}) {
  const state = useRef<BattleState>(null as unknown as BattleState);
  if (!state.current) {
    state.current = initBattle(left, right);
    if (gate) paceGateBattle(state.current);
  }
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);
  const [fast, setFast] = useState(readFastFights);
  const [floats, setFloats] = useState<Float[]>([]);
  const [anim, setAnim] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const ended = useRef(false);
  const killsBefore = useRef<Record<string, number>>(getState().hero?.kills ?? {});
  const fid = useRef(0);
  const s = state.current;
  const hero = heroUnit(s);
  const foe = foeUnit(s);
  const bg = useMemo(() => arenaFor(title, right.boss), [title, right.boss]);
  // Collect the foe as a creature encounter on mount, before the fight is decided.
  useEffect(() => { update((h) => { collectCreature(h, right); }); }, []);
  const speed = useRef(fast ? 0.5 : 1);
  speed.current = fast ? 0.5 : 1;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms * BATTLE_PACE * speed.current));

  function toggleFast() {
    setFast((f) => {
      saveFastFights(!f);
      return !f;
    });
  }

  function finish() {
    if (ended.current || !s.over) return;
    ended.current = true;
    const dead = s.units.filter((u) => u.side === "foe" && u.hp <= 0);
    const hp: BattleEndHp = { hero: hero.hp, heroMax: hero.maxHp, foe: foe.hp, foeMax: foe.maxHp };
    setTimeout(() => {
      void Promise.resolve(onEnd(s.over === "won", hp)).then(() => {
        update((h) => settleCreatureDefeats(h, dead, killsBefore.current));
      });
    }, fast ? 500 : 900);
  }

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await wait(500);
      while (!cancelled && !s.over) {
        const r = step(s);
        if (!r.ok) break;
        const attacker = r.actor;
        const defender = s.units[attacker.side === "hero" ? 1 : 0]!;
        setAnim({ [attacker.id]: attacker.side === "hero" ? "anim-lunge-r" : "anim-lunge-l" });
        rerender();
        await wait(200);
        const blocked = r.events.some((e) => e.kind === "block");
        setAnim({ [defender.id]: blocked ? "anim-block" : "anim-hit" });
        const ids = ++fid.current;
        setFloats(r.events.filter((e) => e.tgt).map((e) => ({ id: ids + Math.random(), tgt: e.tgt!, text: e.text, kind: e.kind })));
        const death = r.events.find((e) => e.kind === "death");
        if (death) setBanner(death.text);
        rerender();
        await wait(380);
        setFloats([]);
        setAnim({});
        await wait(90);
      }
      if (cancelled) return;
      rerender();
      await wait(250);
      if (!cancelled) finish();
    };
    void run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 2000);
    return () => clearTimeout(t);
  }, [banner]);

  const turnOf = s.over ? null : s.units[s.turn] ?? null;

  return (
    <div className="battle-screen fixed inset-0 z-40 flex flex-col overflow-hidden bg-background anim-pop">
      <img src={bg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 vignette" />

      <div className="safe-top relative z-10 flex flex-col items-center gap-1 pt-2">
        {title && <div className="font-display text-xl panel-title md:text-2xl">{title}</div>}
        <div className="flex items-center gap-3 rounded-full bg-background/70 px-4 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
          <span className="text-muted-foreground">{tr("Round")} {s.round}</span>
          <span className="text-gold">{turnOf ? `${tName(turnOf.name)}` : "—"}</span>
        </div>
      </div>

      {banner && <div className="relative z-20 mx-auto mt-2 rounded-md border border-blood bg-blood/80 px-4 py-2 font-display text-lg text-foreground anim-pop">{banner}</div>}

      <div className="relative z-10 flex flex-1 items-end justify-between gap-4 px-4 pb-4 md:px-20">
        <UnitCard u={hero} anim={anim[hero.id]} floats={floats} active={turnOf?.id === hero.id} victory={s.over === "won"} />
        <UnitCard u={foe} anim={anim[foe.id]} floats={floats} active={turnOf?.id === foe.id} victory={s.over === "lost"} foe />
      </div>

      <div className="battle-actions relative z-10 flex flex-col items-center gap-2 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4">
        {hero.scrolls && hero.scrolls.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gold">
            {hero.scrolls.map((k) => <span key={k}>{tr(k === "dmg" ? "Damage Scroll" : k === "def" ? "Defence Scroll" : "Experience Scroll")} +20%</span>)}
          </div>
        )}
        <div className="hidden h-24 w-full max-w-3xl overflow-y-auto rounded-md border border-border bg-background/70 p-2 text-xs md:block" aria-label={tr("Combat log")}>
          {s.log.map((l, i) => <div key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{l}</div>)}
        </div>
        <Button variant="ghost" onClick={toggleFast} className={`slot flex items-center gap-2 px-3 py-1 text-xs ${fast ? "rarity-2" : ""}`} title={tr("Speed")}>
          <FastForward className="h-4 w-4" />{fast ? tr("Fast") : tr("Normal")}
        </Button>
      </div>
    </div>
  );
}

function UnitCard({ u, anim, floats, active, victory, foe }: {
  u: Unit; anim?: string; floats?: Float[]; active?: boolean; victory?: boolean; foe?: boolean;
}) {
  const dead = u.hp <= 0;
  return (
    <div className={`battle-unit relative flex h-auto min-w-0 shrink-0 flex-col items-center transition-all duration-500 ${dead ? "battle-death opacity-40" : ""}`}>
      <div className={`mb-1 w-full max-w-48 rounded-md bg-background/80 px-2 py-1 text-left backdrop-blur ${active ? "ring-2 ring-gold" : ""}`}>
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
          <span className="truncate">{u.boss && <span className="mr-0.5 text-blood">☠ </span>}{u.elite && <span className="text-r4">★ </span>}{tName(u.name)}</span>
          <span className="text-muted-foreground">{tr("Lv")} {u.level}</span>
        </div>
        <div className="bar-track mt-0.5 h-2.5">
          <div className="bar-hp h-full transition-all duration-300" style={{ width: `${Math.max(0, (u.hp / u.maxHp) * 100)}%` }} />
        </div>
        <div className="text-[9px] text-muted-foreground">{Math.max(0, u.hp).toLocaleString()} / {u.maxHp.toLocaleString()}</div>
      </div>
      <div className={`relative ${u.boss ? "battle-figure boss-figure" : "battle-figure"} w-full shrink-0 ${u.cls ? "aspect-square" : u.sprite ? "" : "aspect-[480/1024]"}`}
        style={u.sprite ? { aspectRatio: `${u.sprite.w} / ${u.sprite.h}` } : undefined}>
        {active && <div className="absolute inset-x-8 bottom-1 h-4 rounded-full bg-gold/50 blur-md" />}
        <div key={anim ?? "idle"} className={`h-full w-full ${anim ?? ""}`}>
          {u.cls
            ? <div className={`h-full w-full ${victory ? "battle-victory" : "anim-idle"}`}><BattleCharacter u={u} /></div>
            : u.sprite
              ? <div className="flex h-full w-full items-end anim-idle"><Sprite rect={u.sprite} className="battle-sprite w-full" /></div>
              : <div className="battle-sprite h-full w-full anim-idle"><BattleCharacter u={u} /></div>}
        </div>
        {floats?.filter((f) => f.tgt === u.id).map((f, i) => (
          <div key={f.id} className={`pointer-events-none absolute left-1/2 anim-float whitespace-nowrap font-display font-black drop-shadow-[0_2px_2px_black] ${
            f.kind === "crit" ? "text-4xl text-gold" : f.kind === "miss" ? "text-xl text-muted-foreground" : f.kind === "block" ? "text-2xl text-r2" : "text-3xl text-foreground"
          }`} style={{ top: `${15 + (i % 3) * 10}%`, [foe ? "right" : "left"]: "40%" } as React.CSSProperties}>{f.text}</div>
        ))}
      </div>
    </div>
  );
}
