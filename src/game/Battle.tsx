import { useEffect, useMemo, useRef, useState } from "react";
import { FastForward } from "lucide-react";
import arenaField from "@/assets/arena-field.jpg";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaLair from "@/assets/arena-lair.jpg";
import arenaRift from "@/assets/arena-rift.jpg";
import { Sprite } from "./Sprite";
import { BattleCharacter, CombatEffect, WeaponArc } from "./BattleArt";
import { effectFor, moveFor, type Move } from "./skillAnim";
import { SCROLLS } from "./scrolls";
import { Button } from "@/components/ui/button";
import {
  current, enemyAct, formation, heroUnit, initBattle, playerAct, STATUS_LABEL, upcoming,
  type BattleState, type CEvent, type FighterInput, type Unit,
} from "./combat";

export type Fighter = FighterInput;


interface Float { id: number; tgt: string; text: string; kind: CEvent["kind"] }

export function arenaFor(title: string | undefined, boss?: boolean) {
  const t = (title ?? "").toLowerCase();
  if (boss || /boss|dungeon|wyrm|challenge/.test(t)) return arenaLair;
  if (/bone|crypt|elite/.test(t)) return arenaCrypt;
  if (/fiend|rift|conquest|arena/.test(t)) return arenaRift;
  return arenaField;
}

export function Battle({ left, right, auto = false, onEnd, title }: {
  left: Fighter; right: Fighter; auto?: boolean; onEnd: (won: boolean) => void; title?: string;
}) {
  const state = useRef<BattleState>(initBattle(left, formation(right)));
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);
  const [floats, setFloats] = useState<Float[]>([]);
  const [anim, setAnim] = useState<Record<string, string>>({});
  const [effects, setEffects] = useState<Record<string, string>>({});
  const [moves, setMoves] = useState<Record<string, Move>>({});
  const [fast, setFast] = useState(auto);
  const [banner, setBanner] = useState<string | null>(null);
  const busy = useRef(false);
  const ended = useRef(false);
  const fid = useRef(0);
  const s = state.current;
  const hero = heroUnit(s);
  const actor = current(s);
  const bg = useMemo(() => arenaFor(title, right.boss), [title, right.boss]);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms * (fast ? 0.5 : 1)));

  async function play(events: CEvent[], actorId: string, sk?: string) {
    const a = s.units.find((u) => u.id === actorId);
    const move = moveFor(a ?? {}, sk);
    setAnim({ [actorId]: "anim-" + move + "#" + ++fid.current });
    setMoves((m) => ({ ...m, [actorId]: move }));
    await wait(280);
    for (const e of events) {
      if (e.kind === "telegraph") { setBanner(e.text); }
      if (e.tgt && e.kind !== "telegraph") {
        const target = e.tgt;
        const id = ++fid.current;
        const named = e.skill ?? sk;
        const effect = e.kind === "heal" ? "heal"
          : e.kind === "block" || e.kind === "absorb" ? "shield"
          : effectFor(named) ?? (a?.cls === "archer" ? "arrow" : a?.cls === "mage" ? "arcane" : "slash");
        if (["dmg", "crit", "heal", "block", "absorb", "status"].includes(e.kind)) setEffects(m => ({ ...m, [target]: effect + "#" + id }));
        setFloats((f) => [...f, { id, tgt: target, text: e.text, kind: e.kind }]);
        setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1100);
        if (["dmg", "crit", "block"].includes(e.kind)) setAnim((m) => ({ ...m, [target]: (e.kind === "block" ? "anim-block" : "anim-hit") + "#" + id }));
        await wait(e.kind === "status" ? 120 : 200);
      }
    }
    rerender();
    await wait(380);
    setAnim({}); setEffects({}); setMoves({});
  }

  function finish() {
    if (ended.current || !s.over) return;
    ended.current = true;
    rerender();
    setTimeout(() => onEnd(s.over === "won"), fast ? 600 : 1100);
  }

  /** Auto-play the entire battle: hero and foes take turns attacking until the fight ends. */
  async function runTurn() {
    let safety = 0;
    while (!s.over && safety++ < 80) {
      const u = current(s);
      if (!u) break;
      await wait(u.side === "hero" ? 150 : 220);
      const r = u.side === "foe" ? enemyAct(s) : playerAct(s, u.kit[0].id, []);
      if (!r.ok) break;
      try { await play(r.events, u.id, r.events[0]?.skill ?? u.kit[0].id); } catch { /* animation failure must not freeze combat */ }
    }
    rerender();
    if (s.over) finish();
  }

  // Start the auto-battle on mount.
  useEffect(() => { void (async () => { busy.current = true; await runTurn(); busy.current = false; rerender(); })(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (!banner) return; const t = setTimeout(() => setBanner(null), 2200); return () => clearTimeout(t); }, [banner]);

  const foes = s.units.filter((u) => u.side === "foe");
  const order = upcoming(s, 7);

  return (
    <div className="battle-screen fixed inset-0 z-40 flex flex-col overflow-hidden bg-background anim-pop">
      <img src={bg} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 vignette" />

      {/* Top bar: title + turn order */}
      <div className="safe-top relative z-10 flex flex-col items-center gap-2">
        {title && <div className="font-display text-xl panel-title md:text-2xl">{title}</div>}
        <div className="flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 backdrop-blur" aria-label="Turn order">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Round {s.round}</span>
          {order.map((u, i) => (
            <div key={u.id + i} title={u.name}
              className={`h-8 w-8 overflow-hidden rounded-full border-2 bg-card ${i === 0 ? "border-gold scale-110 shadow-[0_0_12px_var(--gold)]" : u.side === "hero" ? "border-r1" : "border-blood"}`}>
              {u.cls || !u.sprite ? <BattleCharacter u={u} /> : <Sprite rect={u.sprite} className="w-full" />}
            </div>
          ))}
        </div>
        <div className="font-display text-sm text-muted-foreground">
          {s.over ? "" : `${actor?.name ?? ""}'s turn…`}
        </div>
      </div>

      {banner && <div className="relative z-20 mx-auto mt-2 rounded-md border border-blood bg-blood/80 px-4 py-2 font-display text-lg text-foreground anim-pop">{banner}</div>}

      {/* Battlefield */}
      <div className="relative z-10 flex flex-1 items-end justify-between gap-2 px-4 pb-4 md:px-16">
        <UnitView u={hero} anim={anim[hero.id]} effect={effects[hero.id]} move={moves[hero.id]} victory={s.over === "won"} floats={floats} active={actor?.id === hero.id} />
        <div className="flex min-w-0 flex-1 items-end justify-end gap-2 md:gap-6 battle-foes">
          {foes.map((f) => (
            <UnitView key={f.id} u={f} anim={anim[f.id]} effect={effects[f.id]} move={moves[f.id]} floats={floats} active={actor?.id === f.id}
              small={foes.length > 1 && !f.boss} />
          ))}
        </div>
      </div>

      {/* Bottom: log + speed toggle */}
      <div className="battle-actions relative z-10 grid gap-2 bg-gradient-to-t from-background via-background/90 to-transparent md:grid-cols-[260px_1fr]">
        <div className="hidden h-28 overflow-y-auto rounded-md border border-border bg-background/70 p-2 text-xs md:block" aria-label="Combat log">
          {s.log.map((l, i) => <div key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{l}</div>)}
        </div>
        <div className="flex flex-col items-center gap-2">
          {hero.scrolls && hero.scrolls.length > 0 && <div className="flex flex-wrap justify-center gap-2 text-xs text-gold">{hero.scrolls.map(k => <span key={k} title="Server-confirmed for this battle">{SCROLLS[k].name} +20%</span>)}</div>}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="ghost" onClick={() => setFast((f) => !f)} className={`slot flex h-12 w-12 items-center justify-center ${fast ? "rarity-2" : ""}`} title="Speed">
              <FastForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {s.over && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/40">
          <div className={`font-display text-6xl font-black anim-pop ${s.over === "won" ? "panel-title" : "text-blood"}`}>{s.over === "won" ? "VICTORY" : "DEFEAT"}</div>
        </div>
      )}
    </div>
  );
}

function UnitView({ u, anim, effect, move, victory, floats, active, small }: {
  u: Unit; anim?: string; effect?: string; move?: Move; victory?: boolean; floats: Float[]; active?: boolean; small?: boolean;
}) {
  const dead = u.hp <= 0;
  const h = u.boss ? "battle-figure boss-figure" : small ? "battle-figure small-figure" : "battle-figure";
  return (
    <div
      className={`relative h-auto min-w-0 shrink-0 flex flex-col items-center p-0 transition-all duration-500 battle-unit ${dead ? "pointer-events-none battle-death" : ""}`}>
      {/* Nameplate */}
      <div className={`mb-1 w-full max-w-44 rounded-md bg-background/75 px-2 py-1 text-left backdrop-blur ${active ? "ring-2 ring-gold" : ""}`}>
        <div className="flex items-center justify-between gap-1 truncate text-[11px] font-bold">
          <span className="truncate">{u.boss && <span className="text-blood">☠ </span>}{u.elite && <span className="text-r4">★ </span>}{u.name}</span>
          <span className="text-muted-foreground">Lv {u.level}</span>
        </div>
        <div className="bar-track mt-0.5 h-2.5"><div className="bar-hp h-full transition-all duration-300" style={{ width: `${(u.hp / u.maxHp) * 100}%` }} /></div>
        <div className="flex justify-between text-[9px] text-muted-foreground"><span>{u.hp.toLocaleString()}/{u.maxHp.toLocaleString()}</span></div>
        {(u.statuses.length > 0 || u.telegraph) && (
          <div className="mt-0.5 flex flex-wrap gap-0.5">
            {u.telegraph && <span className="rounded bg-blood px-1 text-[8px] font-bold animate-pulse">⚠ CHARGING</span>}
            {u.statuses.map((x) => <span key={x.kind} className="rounded bg-secondary px-1 text-[8px] font-bold">{STATUS_LABEL[x.kind]} {x.turns}</span>)}
          </div>
        )}
      </div>
      {/* Figure */}
      <div
        className={`relative ${h} w-full shrink-0 ${u.cls ? "aspect-square" : u.sprite ? "" : "aspect-[480/1024]"}`}
        style={u.sprite ? { aspectRatio: `${u.sprite.w} / ${u.sprite.h}` } : undefined}
      >
        {active && <div className="absolute inset-x-8 bottom-1 h-4 rounded-full bg-gold/50 blur-md" />}
        <div key={anim ?? "idle"} className={`h-full w-full ${anim?.split("#")[0] ?? ""}`}>
          {u.cls ? <div className={`h-full w-full ${victory ? "battle-victory" : "anim-idle"}`}><BattleCharacter u={u} /></div> : u.sprite ? <div className="flex h-full w-full items-end anim-idle"><Sprite rect={u.sprite} className="battle-sprite w-full" /></div> : <div className="battle-sprite h-full w-full anim-idle"><BattleCharacter u={u} /></div>}
          {move && <WeaponArc key={"arc" + move} move={move} />}
          {effect && <CombatEffect key={effect} kind={effect.split("#")[0]} />}
        </div>
        {floats.filter((f) => f.tgt === u.id).map((f, i) => (
          <div key={f.id} className={`pointer-events-none absolute left-1/2 anim-float whitespace-nowrap font-display font-black drop-shadow-[0_2px_2px_black] ${
            f.kind === "crit" ? "text-4xl text-gold" : f.kind === "heal" ? "text-2xl text-r1" : f.kind === "miss" || f.kind === "skip" ? "text-xl text-muted-foreground" : f.kind === "block" || f.kind === "absorb" ? "text-2xl text-r2" : f.kind === "status" || f.kind === "info" ? "text-sm text-r4" : "text-3xl text-foreground"
          }`} style={{ top: `${15 + (i % 3) * 10}%` }}>{f.text}</div>
        ))}
      </div>
    </div>
  );
}
