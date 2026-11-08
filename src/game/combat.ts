/**
 * Auto-battle combat engine (pure, no React).
 * Like Shakes & Fidget: units auto-attack turn by turn — no skills, no mana, no potions.
 * Stats and gear determine the outcome; the player watches the animated fight.
 */
import { calcDamage, type HeroClass, type Skill } from "./data";
import type { SpriteRect } from "./world";

export type StatusKind = "guard" | "barrier" | "mark" | "evade" | "slow" | "stun" | "burn" | "weaken" | "counter";
export interface Status { kind: StatusKind; turns: number; value: number }

export type TargetMode = "enemy" | "all" | "multi" | "self";

export interface TSkill {
  id: string; name: string; desc: string; icon: string;
  mult: number; hits?: number; cd: number; cost: number;
  target: TargetMode; maxTargets?: number;
  crit?: boolean; heal?: number; stun?: boolean; penBonus?: number; gain?: number;
  applies?: Status; selfApplies?: Status;
}

export interface FighterInput {
  name: string; img: string; hp: number; atk: number; def: number; crit: number; dodge: number; level: number;
  cls?: HeroClass; skills?: Skill[]; critDmg?: number; pen?: number; acc?: number; block?: number; heal?: number;
  sprite?: SpriteRect; mirror?: boolean; boss?: boolean; elite?: boolean;
  gender?: 'male' | 'female'; scrolls?: ('dmg' | 'def' | 'xp')[];
  skillLoadout?: string[];
  /** Painted armour variant of the worn chest piece (see appearance.ts). */
  look?: number | null;
  /** Worn synthesis set, which keeps its own painted art (see appearance.ts). */
  synth?: number | null;
}

export interface Unit {
  id: string; side: "hero" | "foe"; name: string; img: string; sprite?: SpriteRect; mirror?: boolean;
  cls?: HeroClass; boss?: boolean; elite?: boolean; level: number;
  gender?: 'male' | 'female'; scrolls?: ('dmg' | 'def' | 'xp')[]; look?: number | null; synth?: number | null;
  maxHp: number; hp: number; atk: number; def: number; crit: number; critDmg: number; dodge: number;
  pen: number; acc: number; block: number; heal: number; speed: number;
  mana: number; maxMana: number; statuses: Status[]; cds: Record<string, number>;
  kit: TSkill[]; telegraph?: { skill: TSkill; turns: number }; turnsTaken: number;
}

export type EvKind = "dmg" | "crit" | "miss" | "block" | "heal" | "status" | "telegraph" | "death" | "skip" | "absorb" | "info";
export interface CEvent { kind: EvKind; src?: string; tgt?: string; value?: number; text: string; skill?: string }

export interface BattleState {
  units: Unit[]; round: number; queue: string[]; turn: number; over: null | "won" | "lost"; log: string[]; potions: number;
}

export const BLOCK_CAP = 25;
export const HEAL_CAP = 50;
const RESOURCE: Record<HeroClass, string> = { warrior: "Rage", mage: "Mana", archer: "Focus" };
export const resourceName = (c?: HeroClass) => (c ? RESOURCE[c] : "Energy");

// ---------- Basic attack (the only move in auto-battle) ----------
const BASIC: TSkill = { id: "hit", name: "Attack", desc: "Basic attack.", icon: "sword", mult: 1, cd: 0, cost: 0, target: "enemy" };

/** Every fighter has exactly one move: a basic attack. Skills and passives are gone. */
export function buildKit(_cls?: HeroClass, _skills?: Skill[], _chosen?: string[]): TSkill[] {
  return [BASIC];
}

// ---------- Setup ----------
function toUnit(f: FighterInput, side: Unit["side"], id: string): Unit {
  const maxMana = 100;
  return {
    id, side, name: f.name, img: f.img, sprite: f.sprite, mirror: f.mirror, cls: f.cls, boss: f.boss, elite: f.elite, level: f.level,
    gender: f.gender, scrolls: f.scrolls, look: f.look, synth: f.synth,
    maxHp: Math.max(1, Math.round(f.hp)), hp: Math.max(1, Math.round(f.hp)), atk: f.atk, def: f.def, crit: f.crit,
    critDmg: f.critDmg ?? 200, dodge: f.dodge, pen: f.pen ?? 0, acc: f.acc ?? 0,
    block: Math.min(BLOCK_CAP, f.block ?? (f.boss ? 5 : 0)), heal: Math.min(HEAL_CAP, f.heal ?? 0),
    speed: Math.round(100 + f.dodge * 2 + (f.acc ?? 0) + (f.cls === "archer" ? 15 : f.cls === "mage" ? 5 : 0) - (f.boss ? 10 : 0)),
    mana: 0, maxMana, statuses: [], cds: {},
    kit: [BASIC], turnsTaken: 0,
  };
}

/** Split a single encounter foe into a tactical formation of 1–3 enemies of equal total threat. */
export function formation(foe: FighterInput): FighterInput[] {
  if (foe.cls) return [foe]; // arena opponents fight alone
  if (foe.boss) {
    const add = (n: string): FighterInput => ({ ...foe, name: n, boss: false, elite: false, hp: foe.hp * 0.14, atk: foe.atk * 0.22, level: Math.max(1, foe.level - 2) });
    return [add("Ember Thrall"), { ...foe }, add("Cinder Acolyte")];
  }
  const lvl = foe.level;
  const n = lvl < 3 ? 1 : lvl % 3 === 0 ? 3 : 2;
  if (n === 1) return [foe];
  const share = n === 2 ? [0.6, 0.5] : [0.48, 0.38, 0.38];
  const atkShare = n === 2 ? [0.62, 0.5] : [0.5, 0.36, 0.36];
  return share.map((s, i) => ({ ...foe, name: i === 0 ? foe.name : `${foe.name.split(" ").slice(-1)[0]} Grunt`, elite: i === 0 && n === 3, hp: foe.hp * s, atk: foe.atk * atkShare[i] }));
}

export function initBattle(hero: FighterInput, foes: FighterInput[]): BattleState {
  const units = [toUnit(hero, "hero", "H"), ...foes.map((f, i) => toUnit({ ...f, mirror: f.mirror ?? false }, "foe", `F${i}`))];
  const s: BattleState = { units, round: 0, queue: [], turn: 0, over: null, log: [], potions: 0 };
  newRound(s);
  return s;
}

const alive = (u: Unit) => u.hp > 0;
export const unit = (s: BattleState, id: string) => { const u = s.units.find((x) => x.id === id); if (!u) throw new Error('Unknown combatant'); return u; };
export const heroUnit = (s: BattleState) => { const u = s.units.find((x) => x.side === 'hero'); if (!u) throw new Error('Missing hero'); return u; };
export const livingFoes = (s: BattleState) => s.units.filter((u) => u.side === "foe" && alive(u));
const status = (u: Unit, k: StatusKind) => u.statuses.find((x) => x.kind === k);
export const effSpeed = (u: Unit) => Math.round(u.speed * (1 - (status(u, "slow")?.value ?? 0) / 100));

function newRound(s: BattleState) {
  s.round++;
  s.queue = s.units.filter(alive).sort((a, b) => effSpeed(b) - effSpeed(a) || (a.side === "hero" ? -1 : 1)).map((u) => u.id);
  s.turn = 0;
}

/** The unit whose turn it is (skips dead units). */
export function current(s: BattleState): Unit | null {
  if (s.over) return null;
  let guard = 0;
  while (guard++ < 50) {
    if (s.turn >= s.queue.length) newRound(s);
    const u = unit(s, s.queue[s.turn]);
    if (u && alive(u)) return u;
    s.turn++;
  }
  return null;
}

export function upcoming(s: BattleState, n = 6): Unit[] {
  const out: Unit[] = [];
  for (let i = s.turn; i < s.queue.length && out.length < n; i++) { const u = unit(s, s.queue[i]); if (alive(u)) out.push(u); }
  return out;
}

// ---------- Validation (kept for API compatibility; basic attack is always ready) ----------
export function skillReady(_u: Unit, _sk: TSkill): string | null {
  return null;
}

export function validTargets(s: BattleState, actor: Unit, _sk: TSkill): string[] {
  const enemies = s.units.filter((u) => u.side !== actor.side && alive(u));
  return enemies.map((u) => u.id);
}

// ---------- Resolution ----------
function rng() { return Math.random(); }

function dealHit(s: BattleState, a: Unit, d: Unit, sk: TSkill, ev: CEvent[], multScale = 1) {
  if (!alive(d)) return 0;
  const hits = sk.hits ?? 1;
  let total = 0;
  const dodge = d.dodge + (status(d, "evade")?.value ?? 0);
  const atk = a.atk * (1 - (status(a, "weaken")?.value ?? 0) / 100);
  for (let i = 0; i < hits && alive(d); i++) {
    const r = calcDamage(atk, d.def, sk.mult * multScale, a.crit, dodge, !!sk.crit, a.critDmg, a.pen + (sk.penBonus ?? 0), a.acc);
    if (r.miss) { ev.push({ kind: "miss", src: a.id, tgt: d.id, text: "MISS", skill: sk.id }); continue; }
    let dmg = r.dmg * (1 + (status(d, "mark")?.value ?? 0) / 100);
    const g = status(d, "guard"); if (g) dmg *= 1 - g.value / 100;
    let blocked = false;
    if (d.block > 0 && rng() * 100 < d.block) { dmg *= 0.5; blocked = true; }
    dmg = Math.max(1, Math.round(dmg));
    const b = status(d, "barrier");
    if (b && b.value > 0) {
      const ab = Math.min(b.value, dmg); b.value -= ab; dmg -= ab;
      ev.push({ kind: "absorb", tgt: d.id, value: ab, text: `ABSORB ${ab}` });
      if (b.value <= 0) d.statuses = d.statuses.filter((x) => x !== b);
    }
    d.hp = Math.max(0, d.hp - dmg); total += dmg;
    ev.push({ kind: blocked ? "block" : r.crit ? "crit" : "dmg", src: a.id, tgt: d.id, value: dmg, text: `${blocked ? "BLOCK " : r.crit ? "✦" : ""}${dmg.toLocaleString()}`, skill: sk.id });
  }
  if (total > 0) {
    if (sk.stun) addStatus(d, { kind: "stun", turns: 1, value: 0 }, ev);
    if (sk.applies) addStatus(d, { ...sk.applies, value: sk.applies.kind === "burn" ? Math.round(a.atk * sk.applies.value) : sk.applies.value }, ev);
  } else if (sk.applies && sk.applies.kind !== "burn" && sk.mult === 0) addStatus(d, { ...sk.applies }, ev);
  if (!alive(d)) ev.push({ kind: "death", tgt: d.id, text: `${d.name} falls!` });
  // Counterattack
  const c = status(d, "counter");
  if (c && alive(d) && alive(a) && total > 0) {
    const r = calcDamage(d.atk, a.def, c.value, d.crit, 0, false, d.critDmg, d.pen, 100);
    a.hp = Math.max(0, a.hp - r.dmg);
    ev.push({ kind: r.crit ? "crit" : "dmg", src: d.id, tgt: a.id, value: r.dmg, text: `COUNTER ${r.dmg}` });
    if (!alive(a)) ev.push({ kind: "death", tgt: a.id, text: `${a.name} falls!` });
  }
  return total;
}

function addStatus(u: Unit, st: Status, ev: CEvent[]) {
  if (!alive(u)) return;
  const v = st.kind === "barrier" && st.value < 1 ? Math.round(u.maxHp * st.value) : st.value;
  u.statuses = [...u.statuses.filter((x) => x.kind !== st.kind), { ...st, value: v }];
  ev.push({ kind: "status", tgt: u.id, text: STATUS_LABEL[st.kind] });
}

export const STATUS_LABEL: Record<StatusKind, string> = {
  guard: "GUARD", barrier: "BARRIER", mark: "MARKED", evade: "EVASIVE", slow: "SLOWED", stun: "STUNNED", burn: "BURNING", weaken: "WEAKENED", counter: "COUNTER",
};

function checkOver(s: BattleState) {
  if (!alive(heroUnit(s))) s.over = "lost";
  else if (livingFoes(s).length === 0) s.over = "won";
}

/** Start-of-turn ticks: DoTs. Returns true if the actor is stunned and loses the turn. */
function startTurn(s: BattleState, u: Unit, ev: CEvent[]): boolean {
  const burn = status(u, "burn");
  if (burn) { const d = Math.max(1, burn.value); u.hp = Math.max(0, u.hp - d); ev.push({ kind: "dmg", tgt: u.id, value: d, text: `🔥${d}` }); if (!alive(u)) ev.push({ kind: "death", tgt: u.id, text: `${u.name} burns away!` }); }
  if (!alive(u)) return true;
  if (status(u, "stun")) { ev.push({ kind: "skip", tgt: u.id, text: "STUNNED" }); return true; }
  return false;
}

/** End-of-turn: tick statuses & cooldowns for the actor, advance. */
function endTurn(s: BattleState, u: Unit) {
  u.statuses = u.statuses.map((x) => ({ ...x, turns: x.turns - 1 })).filter((x) => x.turns > 0);
  for (const k of Object.keys(u.cds)) u.cds[k] = Math.max(0, u.cds[k] - 1);
  u.turnsTaken++;
  s.turn++;
  checkOver(s);
}

function logEv(s: BattleState, ev: CEvent[], head: string) {
  s.log = [head, ...s.log].slice(0, 40);
  for (const e of ev) if (e.kind === "death" || e.kind === "telegraph") s.log = [e.text, ...s.log].slice(0, 40);
}

export type ActResult = { ok: true; events: CEvent[] } | { ok: false; error: string };

/** Player auto-attacks the first living foe. Skill/target parameters are ignored (auto-battle). */
export function playerAct(s: BattleState, _skillId?: string, _targets?: string[]): ActResult {
  const u = current(s);
  if (!u || u.side !== "hero") return { ok: false, error: "Not your turn" };
  const ev: CEvent[] = [];
  if (startTurn(s, u, ev)) { endTurn(s, u); logEv(s, ev, `${u.name} is stunned.`); return { ok: true, events: ev }; }
  const foes = s.units.filter((x) => x.side !== u.side && alive(x));
  const t = foes.sort((a, b) => a.hp - b.hp)[0];
  if (!t) { endTurn(s, u); return { ok: true, events: ev }; }
  const sk = u.kit[0]; // always the basic attack
  const dealt = dealHit(s, u, t, sk, ev);
  endTurn(s, u);
  logEv(s, ev, `${u.name} attacks${dealt ? ` for ${dealt.toLocaleString()} damage` : ""}.`);
  return { ok: true, events: ev };
}

/** Potions are removed in auto-battle; kept for API compatibility. */
export function drinkPotion(s: BattleState): ActResult {
  return { ok: false, error: "Potions are not available" };
}

const BASIC_FOE: TSkill = BASIC;

/** Enemy AI: every foe simply basic-attacks the hero. */
export function enemyAct(s: BattleState): ActResult {
  const u = current(s);
  if (!u || u.side !== "foe") return { ok: false, error: "Not an enemy turn" };
  const ev: CEvent[] = [];
  if (startTurn(s, u, ev)) { endTurn(s, u); logEv(s, ev, `${u.name} cannot act.`); return { ok: true, events: ev }; }
  const targets = s.units.filter((x) => x.side !== u.side && alive(x));
  const t = targets[0];
  if (!t) { endTurn(s, u); return { ok: true, events: ev }; }
  dealHit(s, u, t, BASIC_FOE, ev);
  endTurn(s, u);
  logEv(s, ev, `${u.name} attacks.`);
  return { ok: true, events: ev };
}
