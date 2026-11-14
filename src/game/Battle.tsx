import { CombatOrb } from "./CombatOrb";
import { tName , tr} from "./i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FastForward, Skull, Zap,
} from "lucide-react";
import arenaField from "@/assets/arena-field.jpg";
import arenaCrypt from "@/assets/arena-crypt.jpg";
import arenaLair from "@/assets/arena-lair.jpg";
import arenaRift from "@/assets/arena-rift.jpg";
import arenaSpire from "@/assets/arena-spire.jpg";
import arenaColosseum from "@/assets/arena-colosseum.jpg";
import arenaDepths from "@/assets/arena-depths.jpg";
import { Sprite } from "./Sprite";
import { SkillIcon } from "./SkillIcon";
import { BattleCharacter, CombatEffect, SkillImpact, WeaponArc } from "./BattleArt";
import { effectFor, moveFor, skillFx, type Move } from "./skillAnim";
import { SCROLLS } from "./scrolls";
import { saveFastFights, readFastFights } from "./battle-prefs";
import { Button } from "@/components/ui/button";
import {
  current, drinkPotion, paceGateBattle, enemyAct, formation, heroUnit, initBattle, playerAct, resourceName, skillReady, STATUS_LABEL, upcoming, validTargets,
  type BattleState, type CEvent, type FighterInput, type TSkill, type Unit,
} from "./combat";

export type Fighter = FighterInput;
export const BATTLE_PACE = 1.45;


interface Float { id: number; tgt: string; text: string; kind: CEvent["kind"] }

/**
 * The skill AUTO casts on the hero's turn: the strongest ready attack on the weakest foe, else any
 * other ready skill (a heal or a guard) so the turn is always taken, else nothing at all — which
 * is what stops auto-battle from sitting on a skill it cannot use.
 */
export function autoPick(kit: TSkill[], blocked: (k: TSkill) => boolean, foes: Unit[]): TSkill | null {
  const usable = kit.filter((k) => !blocked(k));
  const worth = (k: TSkill) => k.mult * (k.hits ?? 1) * (k.target === "all" ? foes.length : 1);
  const attack = [...usable].filter((k) => k.mult > 0).sort((a, b) => worth(b) - worth(a))[0];
  return (
    attack ??
    usable.find((k) => k.target === "self" || k.target === "all") ??
    usable[0] ??
    null
  );
}

export function arenaFor(title: string | undefined, boss?: boolean) {
  const t = (title ?? "").toLowerCase();
  if (/spire|warden|rift path/.test(t)) return arenaSpire;
  if (/duel|arena|clash|pvp/.test(t)) return arenaColosseum;
  if (/expedition|relic|depth|dungeon|elite/.test(t)) return arenaDepths;
  if (boss || /boss|dungeon|wyrm|challenge/.test(t)) return arenaLair;
  if (/bone|crypt|elite/.test(t)) return arenaCrypt;
  if (/fiend|rift|conquest|arena/.test(t)) return arenaRift;
  return arenaField;
}

export function Battle({ left, right, auto = false, onEnd, title, gate = false }: {
  left: Fighter; right: Fighter; auto?: boolean; onEnd: (won: boolean) => void; title?: string;
  /** A War Gate monster fight: paced to about 10-15 s. */
  gate?: boolean;
}) {
  const state = useRef<BattleState>(null as unknown as BattleState);
  if (!state.current) {
    state.current = initBattle(left, formation(right));
    if (gate) paceGateBattle(state.current);
  }
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);
  const [selSkill, setSelSkill] = useState<string | null>(null);
  const [selTargets, setSelTargets] = useState<string[]>([]);
  const [floats, setFloats] = useState<Float[]>([]);
  const [anim, setAnim] = useState<Record<string, string>>({});
  const [effects, setEffects] = useState<Record<string, string>>({});
  const [moves, setMoves] = useState<Record<string, Move>>({});
  // Presentation-only: the thrown spell, loosed arrow or sword wave that crosses the field.
  const [proj, setProj] = useState<{ kind: string; dir: "ltr" | "rtl"; key: number; cls: string } | null>(null);
  // Fast-forward is remembered for the next fight; auto-battle is always a per-fight choice.
  const [fast, setFast] = useState(() => auto || readFastFights());
  const [autoOn, setAutoOn] = useState(auto);
  const [banner, setBanner] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const busy = useRef(false);
  const ended = useRef(false);
  const fid = useRef(0);
  const s = state.current;
  const hero = heroUnit(s);
  const actor = current(s);
  const myTurn = !!actor && actor.side === "hero" && !s.over;
  const bg = useMemo(() => arenaFor(title, right.boss), [title, right.boss]);
  /** Fight pacing: every beat runs ~45% longer so a typical fight lasts 4-5 seconds more. */
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms * BATTLE_PACE * (fast ? 0.5 : 1)));

  const skill = selSkill ? hero.kit.find((k) => k.id === selSkill) ?? null : null;
  const valid = skill ? validTargets(s, hero, skill) : [];

  async function play(events: CEvent[], actorId: string, sk?: string) {
    const a = s.units.find((u) => u.id === actorId);
    const move = moveFor(a ?? {}, sk);
    setAnim({ [actorId]: "anim-" + move + "#" + ++fid.current });
    setMoves((m) => ({ ...m, [actorId]: move }));
    const kind = projectileFor(move, effectFor(sk) ?? undefined);
    if (kind && a) setProj({ kind, dir: a.side === "hero" ? "ltr" : "rtl", key: ++fid.current, cls: classOf(a.cls, move) });
    await wait(kind ? 420 : 280);
    setProj(null);
    for (const e of events) {
      if (e.kind === "telegraph") { setBanner(e.text); }
      if (e.tgt && e.kind !== "telegraph") {
        const target = e.tgt;
        const id = ++fid.current;
        const named = e.skill ?? sk;
        const own = a?.side === "hero" && named && skillFx(named) ? "sk:" + named : null;
        const effect = own && ["dmg", "crit", "status"].includes(e.kind) ? own : e.kind === "heal" ? "heal"
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

  /** Pacing is a device preference: the next fight starts the way this one was left. */
  function toggleFast() {
    const next = !fast;
    setFast(next);
    saveFastFights(next);
  }

  /** Run enemy turns until it's the hero's turn again or the battle ends. Never gets stuck. */
  async function runEnemies() {
    let safety = 0;
    while (!s.over && safety++ < 30) {
      const u = current(s);
      if (!u) break;
      if (u.side === "hero") {
        if (u.statuses.some((x) => x.kind === "stun")) {
          const r = playerAct(s, u.kit[0].id, [s.units.find((x) => x.side === "foe" && x.hp > 0)?.id ?? ""]);
          if (r.ok) await play(r.events, u.id).catch(() => {});
          continue;
        }
        break;
      }
      await wait(220);
      const r = enemyAct(s);
      if (!r.ok) break;
      try { await play(r.events, u.id); } catch { /* animation failure must not freeze combat */ }
    }
    rerender();
    if (s.over) finish();
  }

  async function execute(skId: string, targets: string[]) {
    if (busy.current || ended.current) return;
    busy.current = true;
    setErr(null);
    try {
      const r = playerAct(s, skId, targets);
      if (!r.ok) { setErr(r.error); return; }
      setSelSkill(null); setSelTargets([]);
      await play(r.events, hero.id, skId);
      if (s.over) return finish();
      await runEnemies();
    } finally { busy.current = false; rerender(); }
  }

  async function potion() {
    if (busy.current || ended.current) return;
    busy.current = true;
    try {
      const r = drinkPotion(s);
      if (!r.ok) { setErr(r.error); return; }
      await play(r.events, hero.id);
      await runEnemies();
    } finally { busy.current = false; rerender(); }
  }

  function pickSkill(sk: TSkill) {
    if (!myTurn || busy.current) return;
    const nr = skillReady(hero, sk);
    if (nr) { setErr(nr); return; }
    setErr(null);
    if (sk.target === "self" || sk.target === "all") { void execute(sk.id, []); return; }
    setSelSkill(sk.id); setSelTargets([]);
  }

  function pickTarget(u: Unit) {
    if (!skill || !myTurn) return;
    if (!valid.includes(u.id)) { setErr("Invalid target"); return; }
    if (skill.target === "enemy") { void execute(skill.id, [u.id]); return; }
    const max = skill.maxTargets ?? 3;
    setSelTargets((t) => (t.includes(u.id) ? t.filter((x) => x !== u.id) : t.length < max ? [...t, u.id] : t));
  }

  // Start: let faster enemies act first.
  useEffect(() => { void (async () => { busy.current = true; await runEnemies(); busy.current = false; rerender(); })(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-battle: the strongest ready attack on the weakest foe. It always has to take the turn —
  // falling back to any other ready skill (a heal or a guard) and switching itself off when
  // nothing can be cast — so the fight can never sit open retrying a skill that cannot be used.
  useEffect(() => {
    if (!autoOn || !myTurn || busy.current || ended.current) return;
    const t = setTimeout(() => {
      // The fight may have moved on while this timer waited.
      if (busy.current || ended.current) return;
      const foes = s.units.filter((u) => u.side === "foe" && u.hp > 0).sort((a, b) => a.hp - b.hp);
      if (!foes.length) return;
      const pick = autoPick(hero.kit, (k) => !!skillReady(hero, k), foes);
      if (!pick) {
        setAutoOn(false);
        setErr(tr("Auto-battle stopped — the hero has nothing to cast."));
        return;
      }
      void execute(pick.id, foes.slice(0, pick.maxTargets ?? 1).map((f) => f.id));
    }, 300);
    return () => clearTimeout(t);
  });

  // The key badges under the orbs are real: 1-4 cast a skill, P drinks a potion, A toggles
  // auto-battle and F the speed. Typing in a field on top of the battle is left alone.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "a") { setAutoOn((a) => !a); return; }
      if (key === "f") { toggleFast(); return; }
      if (key === "p") { if (myTurn && !autoOn) void potion(); return; }
      const n = Number(key);
      if (n >= 1 && n <= hero.kit.length && myTurn && !autoOn) pickSkill(hero.kit[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 backdrop-blur" aria-label={tr("Turn order")}>
          <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tr("Round")} {s.round}</span>
          {order.map((u, i) => (
            <div key={u.id + i} title={tName(u.name)}
              className={`h-8 w-8 overflow-hidden rounded-full border-2 bg-card ${i === 0 ? "border-gold scale-110 shadow-[0_0_12px_var(--gold)]" : u.side === "hero" ? "border-r1" : "border-blood"}`}>
              {u.cls || !u.sprite ? <BattleCharacter u={u} /> : <Sprite rect={u.sprite} className="w-full" />}
            </div>
          ))}
        </div>
        <div className={`font-display text-sm ${myTurn ? "text-gold" : "text-muted-foreground"}`}>
          {s.over ? "" : myTurn ? (skill ? (skill.target === "multi" ? `Choose up to ${skill.maxTargets} targets` : tr("Choose a target")) : tr("Your turn — choose a skill")) : `${actor ? tName(actor.name) : ""}'s turn…`}
        </div>
      </div>

      {banner && <div className="relative z-20 mx-auto mt-2 rounded-md border border-blood bg-blood/80 px-4 py-2 font-display text-lg text-foreground anim-pop">{banner}</div>}

      {/* Battlefield */}
      <div className="relative z-10 flex flex-1 items-end justify-between gap-2 px-4 pb-4 md:px-16">
        {proj && <span key={"c" + proj.key} aria-hidden className={`battle-charge charge-${proj.cls} charge-${proj.dir}`} />}
        {proj && <span key={proj.key} aria-hidden className={`battle-proj proj-${proj.kind} proj-${proj.dir}`} />}
        <UnitView u={hero} anim={anim[hero.id]} effect={effects[hero.id]} move={moves[hero.id]} victory={s.over === "won"} floats={floats} active={actor?.id === hero.id} />
        <div className="flex min-w-0 flex-1 items-end justify-end gap-2 md:gap-6 battle-foes">
          {foes.map((f) => {
            const isValid = !!skill && valid.includes(f.id);
            return (
              <UnitView key={f.id} u={f} anim={anim[f.id]} effect={effects[f.id]} move={moves[f.id]} floats={floats} active={actor?.id === f.id}
                targetable={isValid} selected={selTargets.includes(f.id)} onClick={() => pickTarget(f)} small={foes.length > 1 && !f.boss} />
            );
          })}
        </div>
      </div>

      {/* Bottom: log + action bar */}
      <div className="battle-actions relative z-10 grid gap-2 bg-gradient-to-t from-background via-background/90 to-transparent md:grid-cols-[260px_1fr]">
        <div className="hidden h-28 overflow-y-auto rounded-md border border-border bg-background/70 p-2 text-xs md:block" aria-label={tr("Combat log")}>
          {s.log.map((l, i) => <div key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{l}</div>)}
        </div>
        <div className="flex flex-col items-center gap-2">
          {hero.scrolls && hero.scrolls.length > 0 && <div className="flex flex-wrap justify-center gap-2 text-xs text-gold">{hero.scrolls.map(k => <span key={k} title={tr("Server-confirmed for this battle")}>{SCROLLS[k].name} +20%</span>)}</div>}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {err && <span className="text-blood">{err}</span>}
            {skill && <span className="text-gold">{skill.name} · {skill.target === "all" ? tr("All enemies") : skill.target === "self" ? tr("Self") : skill.target === "multi" ? `Up to ${skill.maxTargets} enemies` : tr("One enemy")} · {skill.hits ?? 1}  {tr("hit")}{(skill.hits ?? 1) > 1 ? "s" : ""} · {skill.cd}  {tr("turn cooldown")}</span>}
            {skill?.target === "multi" && selTargets.length > 0 && (
              <Button variant="ghost" className="btn-gold px-3 py-1 text-xs" onClick={() => void execute(skill.id, selTargets)}>{tr("Fire at")} {selTargets.length}</Button>
            )}
            {skill && <Button variant="ghost" className="text-muted-foreground underline" onClick={() => { setSelSkill(null); setSelTargets([]); }}>{tr("Cancel")}</Button>}
          </div>
          <div className="orb-bar w-full max-w-5xl">
            <CombatOrb kind="hp" value={hero.hp} max={hero.maxHp} label={tr("Health")} />
          <div className="orb-slots">
            {hero.kit.map((sk, ki) => {
              const cd = hero.cds[sk.id] ?? 0;
              const why = skillReady(hero, sk);
              const disabled = !myTurn || !!why || autoOn;
              return (
                <Button variant="ghost" key={sk.id} onClick={() => pickSkill(sk)} disabled={disabled}
                  aria-label={sk.name} title={`${sk.name} — ${sk.desc}${sk.cost ? ` Cost ${sk.cost} ${resourceName(hero.cls)}.` : ""}${sk.cd ? ` Cooldown ${sk.cd}.` : ""}${why ? ` (${why})` : ""}`}
                  className={`battle-skill slot relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 transition disabled:opacity-50 md:h-20 md:w-20 ${selSkill === sk.id ? "rarity-5 ring-2 ring-gold" : "rarity-4"}`}>
                  <SkillIcon icon={sk.icon} className="h-10 w-10 md:h-12 md:w-12" />
                  <span className="battle-skill-name">{sk.name}</span>
                  {sk.cost > 0 && <span className="absolute right-0.5 top-0.5 rounded bg-background/80 px-1 text-[9px] text-gold">{sk.cost}</span>}
                  <span className="orb-key">{ki + 1}</span>
                  {cd > 0 && <span className="absolute inset-0 flex flex-col items-center justify-center rounded-md bg-background/75"><span className="font-display text-2xl">{cd}</span><span className="text-[9px]">{tr("turn")}{cd > 1 ? "s" : ""}</span></span>}
                </Button>
              );
            })}
            <Button variant="ghost" onClick={potion} disabled={!myTurn || s.potions <= 0 || autoOn} className="slot relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 rarity-5 transition hover:scale-105 disabled:opacity-50 md:h-20 md:w-20">
              <SkillIcon icon="potion" className="h-8 w-8 md:h-10 md:w-10" />
              <span className="text-[9px] font-bold uppercase">{tr("Potion ×")}{s.potions}</span>
            </Button>
            <Button variant="ghost" onClick={() => setAutoOn((a) => !a)} className={`slot flex h-12 w-12 flex-col items-center justify-center text-[9px] font-bold ${autoOn ? "rarity-2" : ""}`} title={tr("Auto battle")}>
              <Zap className="h-4 w-4" />{tr("AUTO")} </Button>
            <Button variant="ghost" onClick={toggleFast} className={`slot flex h-12 w-12 items-center justify-center ${fast ? "rarity-2" : ""}`} title={tr("Speed")}>
              <FastForward className="h-5 w-5" />
            </Button>
          </div>
            <CombatOrb kind="rage" value={hero.mana} max={hero.maxMana} label={tr(resourceName(hero.cls))} />
          </div>
        </div>
      </div>

      {s.over && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/40">
          <div className={`font-display text-6xl font-black anim-pop ${s.over === "won" ? "panel-title" : "text-blood"}`}>{s.over === "won" ? tr("VICTORY") : tr("DEFEAT")}</div>
        </div>
      )}
    </div>
  );
}

function UnitView({ u, anim, effect, move, victory, floats, active, targetable, selected, onClick, small }: {
  u: Unit; anim?: string; effect?: string; move?: Move; victory?: boolean; floats: Float[]; active?: boolean; targetable?: boolean; selected?: boolean; onClick?: () => void; small?: boolean;
}) {
  const dead = u.hp <= 0;
  const h = u.boss ? "battle-figure boss-figure" : small ? "battle-figure small-figure" : "battle-figure";
  return (
    <Button variant="ghost" type="button" onClick={onClick} disabled={!onClick || dead}
      aria-label={`${tName(u.name)}${targetable ? " (valid target)" : ""}`}
      className={`relative h-auto min-w-0 shrink-0 flex flex-col items-center p-0 hover:bg-transparent transition-all duration-500 battle-unit disabled:opacity-100 ${dead ? "pointer-events-none battle-death" : ""} ${targetable ? "cursor-crosshair" : "cursor-default"}`}>
      {/* Nameplate */}
      <div className={`mb-1 w-full max-w-44 rounded-md bg-background/75 px-2 py-1 text-left backdrop-blur ${active ? "ring-2 ring-gold" : ""}`}>
        <div className="flex items-center justify-between gap-1 truncate text-[11px] font-bold">
          <span className="truncate">{u.boss && <Skull className="mr-0.5 inline h-3 w-3 text-blood" />}{u.elite && <span className="text-r4">★ </span>}{tName(u.name)}</span>
          <span className="text-muted-foreground">{tr("Lv")} {u.level}</span>
        </div>
        <div className="bar-track mt-0.5 h-2.5"><div className="bar-hp h-full transition-all duration-300" style={{ width: `${(u.hp / u.maxHp) * 100}%` }} /></div>
        <div className="flex justify-between text-[9px] text-muted-foreground"><span>{u.hp.toLocaleString()}/{u.maxHp.toLocaleString()}</span>{u.side === "hero" && <span className="text-r3">{u.mana}</span>}</div>
        {u.side === "hero" && <div className="bar-track mt-0.5 h-1.5"><div className="h-full bg-r3 transition-all" style={{ width: `${(u.mana / u.maxMana) * 100}%` }} /></div>}
        {(u.statuses.length > 0 || u.telegraph) && (
          <div className="mt-0.5 flex flex-wrap gap-0.5">
            {u.telegraph && <span className="rounded bg-blood px-1 text-[8px] font-bold animate-pulse">{tr("⚠ CHARGING")}</span>}
            {u.statuses.map((x) => <span key={x.kind} className="rounded bg-secondary px-1 text-[8px] font-bold">{STATUS_LABEL[x.kind]} {x.turns}</span>)}
          </div>
        )}
      </div>
      {/* Figure */}
      <div
        className={`relative ${h} w-full shrink-0 ${u.cls ? "aspect-square" : u.sprite ? "" : "aspect-[480/1024]"}`}
        style={u.sprite ? { aspectRatio: `${u.sprite.w} / ${u.sprite.h}` } : undefined}
      >
        {targetable && <div className={`absolute inset-x-4 bottom-0 h-6 rounded-full blur-md ${selected ? "bg-gold" : "bg-r1/70 animate-pulse"}`} />}
        {active && <div className="absolute inset-x-8 bottom-1 h-4 rounded-full bg-gold/50 blur-md" />}
        <div key={anim ?? "idle"} className={`h-full w-full ${anim?.split("#")[0] ?? ""}`}>
          {u.cls ? <div className={`h-full w-full ${victory ? "battle-victory" : "anim-idle"}`}><BattleCharacter u={u} /></div> : u.sprite ? <div className="flex h-full w-full items-end anim-idle"><Sprite rect={u.sprite} className="battle-sprite w-full" /></div> : <div className="battle-sprite h-full w-full anim-idle"><BattleCharacter u={u} /></div>}
          {move && <WeaponArc key={"arc" + move} move={move} />}
          {effect && (effect.startsWith("sk:") ? <SkillImpact key={effect} fx={skillFx(effect.slice(3).split("#")[0]) ?? { shape: "blade", motion: "burst", hue: "var(--gold)" }} /> : <CombatEffect key={effect} kind={effect.split("#")[0]} />)}
        </div>
        {floats.filter((f) => f.tgt === u.id).map((f, i) => (
          <div key={f.id} className={`pointer-events-none absolute left-1/2 anim-float whitespace-nowrap font-display font-black drop-shadow-[0_2px_2px_black] ${
            f.kind === "crit" ? "text-4xl text-gold" : f.kind === "heal" ? "text-2xl text-r1" : f.kind === "miss" || f.kind === "skip" ? "text-xl text-muted-foreground" : f.kind === "block" || f.kind === "absorb" ? "text-2xl text-r2" : f.kind === "status" || f.kind === "info" ? "text-sm text-r4" : "text-3xl text-foreground"
          }`} style={{ top: `${15 + (i % 3) * 10}%` }}>{f.text}</div>
        ))}
      </div>
    </Button>
  );
}

/** Which projectile a move launches: mages throw spells, archers loose arrows, knights send a sword wave. */
function projectileFor(move: Move, effect?: string): string | null {
  if (["cast", "thrust", "nova", "rise", "channel", "siphon"].includes(move))
    return effect === "ice" ? "frost" : effect === "fire" || effect === "meteor" ? "fire" : effect === "tether" ? "void" : "arcane";
  if (["draw", "rapid", "aim"].includes(move)) return move === "rapid" ? "volley" : "arrow";
  if (["overhead", "spin", "leap", "slam", "rage"].includes(move)) return "wave";
  return null;
}

/** The wind-up style: the actor's class, or for monsters the class their move resembles. */
function classOf(cls: string | null | undefined, move: Move): string {
  if (cls === "mage" || cls === "archer" || cls === "warrior") return cls;
  if (["draw", "rapid", "aim"].includes(move)) return "archer";
  if (["cast", "thrust", "nova", "rise", "channel", "siphon"].includes(move)) return "mage";
  return "warrior";
}
