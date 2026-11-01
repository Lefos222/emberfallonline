/**
 * Tactical turn-based combat engine (pure, no React).
 * One authoritative set of stats per unit is used both for the UI and for damage resolution.
 */
import { calcDamage, SKILLS, type HeroClass, type Skill } from "./data";
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
}

export interface Unit {
  id: string; side: "hero" | "foe"; name: string; img: string; sprite?: SpriteRect; mirror?: boolean;
  cls?: HeroClass; boss?: boolean; elite?: boolean; level: number;
  gender?: 'male' | 'female'; scrolls?: ('dmg' | 'def' | 'xp')[];
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

// ---------- Class kits (existing skills + skill-tree abilities, adapted to tactics) ----------
const ADAPT: Record<string, Partial<TSkill>> = {
  // Knight
  strike: { name: "Heavy Strike", desc: "Strong single-target physical blow. Builds Rage.", cost: 0, gain: 20 },
  cleave: { target: "all", mult: 1.15, cost: 25, desc: "Sweeps every enemy in front of you." },
  rage: { cost: 40, desc: "Massive blow that heals you." },
  slam: { cost: 30, desc: "Stuns the target for a turn." },
  whirl: { target: "all", cost: 35, desc: "Spinning strikes against all enemies." },
  execute: { cost: 50, desc: "Devastating blow that always crits." },
  // Mage
  bolt: { desc: "Magical single-target damage. Restores Mana.", cost: 0, gain: 20 },
  nova: { name: "Frostbind", desc: "Freezes the target (skips its turn) and slows it.", cost: 30, applies: { kind: "slow", turns: 2, value: 30 } },
  meteor: { cost: 50, desc: "Huge fire damage on one target, leaving it burning.", applies: { kind: "burn", turns: 3, value: 0.25 } },
  inferno: { target: "all", cost: 45, desc: "Fire rains on every enemy." },
  spike: { cost: 40, desc: "Piercing ice that freezes the target." },
  drain: { cost: 35, desc: "Steals life from the target." },
  // Archer
  shot: { name: "Piercing Shot", desc: "Precise shot that ignores 20% armor. Builds Focus.", cost: 0, gain: 20, penBonus: 20 },
  volley: { name: "Multishot", target: "multi", maxTargets: 3, hits: 1, mult: 1.05, cost: 25, desc: "Fires at up to 3 chosen enemies." },
  snipe: { name: "Deadly Aim", cost: 50, desc: "Lethal aimed shot that always crits." },
  pierce: { cost: 40, desc: "Armor-shredding arrow that always crits.", penBonus: 30 },
  rain: { target: "all", cost: 40, desc: "Arrows fall on every enemy." },
  aegis: { cost: 40, desc: "A shield-driven impact stuns one foe." },
  cyclone: { target: "all", cost: 50, desc: "Four sweeping strikes against every foe." },
  sovereign: { cost: 60, desc: "A leaping execution; guaranteed critical damage." },
  solar: { target: "all", cost: 55, desc: "Four solar impacts burn every foe.", applies: { kind: "burn", turns: 2, value: 0.15 } },
  winter: { target: "all", cost: 50, desc: "An expanding frost wave freezes every foe." },
  "astral-siphon": { cost: 45, desc: "A life-draining tether heals the caster." },
  horizon: { cost: 50, penBonus: 40, desc: "An aimed critical arrow ignores 40% armor." },
  tempest: { target: "all", cost: 50, desc: "Five arrow waves strike every foe." },
  eclipse: { cost: 40, desc: "A shadow dash heals you and grants evasion.", selfApplies: { kind: "evade", turns: 2, value: 30 } },
};

const EXTRA: Record<HeroClass, TSkill[]> = {
  warrior: [
    { id: "guard", name: "Shield Guard", desc: "Reduce incoming damage by 45% for 2 turns.", icon: "shield", mult: 0, cd: 4, cost: 20, target: "self", selfApplies: { kind: "guard", turns: 2, value: 45 } },
    { id: "taunt", name: "Taunting Blow", desc: "0.9× hit that weakens the target's attack by 25% for 2 turns and draws its fury.", icon: "megaphone", mult: 0.9, cd: 3, cost: 15, target: "enemy", applies: { kind: "weaken", turns: 2, value: 25 } },
    { id: "counter", name: "Counterattack", desc: "For 2 turns, strike back for 0.7× whenever you are hit.", icon: "swords", mult: 0, cd: 5, cost: 25, target: "self", selfApplies: { kind: "counter", turns: 2, value: 0.7 } },
  ],
  archer: [
    { id: "mark", name: "Mark Target", desc: "0.5× shot; the target takes 30% more damage for 3 turns.", icon: "scan", mult: 0.5, cd: 4, cost: 15, target: "enemy", applies: { kind: "mark", turns: 3, value: 30 } },
    { id: "evade", name: "Evasive Step", desc: "+30% dodge for 2 turns.", icon: "wind", mult: 0, cd: 4, cost: 20, target: "self", selfApplies: { kind: "evade", turns: 2, value: 30 } },
  ],
  mage: [
    { id: "firestorm", name: "Firestorm", desc: "0.95× fire damage to every enemy, burning them.", icon: "flame", mult: 0.95, cd: 3, cost: 35, target: "all", applies: { kind: "burn", turns: 2, value: 0.15 } },
    { id: "barrier", name: "Arcane Barrier", desc: "Absorb damage equal to 25% of your max HP for 3 turns.", icon: "shield", mult: 0, cd: 5, cost: 30, target: "self", selfApplies: { kind: "barrier", turns: 3, value: 0.25 } },
    { id: "restore", name: "Restoration", desc: "Heal 28% of max HP (scaled by Healing Power).", icon: "heart", mult: 0, cd: 4, cost: 30, target: "self", heal: 0.28 },
  ],
};

export function buildKit(cls: HeroClass | undefined, skills?: Skill[], chosen?: string[]): TSkill[] {
  const base = skills ?? (cls ? SKILLS[cls] : [{ id: "hit", name: "Attack", mult: 1, cd: 0, icon: "sword" } as Skill]);
  const kit: TSkill[] = base.map((s) => ({
    id: s.id, name: s.name, desc: `${Math.round(s.mult * (s.hits ?? 1) * 100)}% damage.`, icon: s.icon,
    mult: s.mult, hits: s.hits, cd: s.cd, cost: s.cd > 0 ? 25 : 0, target: "enemy" as TargetMode,
    crit: s.crit, heal: s.heal, stun: s.stun, gain: s.cd === 0 ? 20 : 0,
    ...(ADAPT[s.id] ?? {}),
  }));
  if (cls) for (const e of EXTRA[cls]) if (!kit.some((k) => k.id === e.id)) kit.push(e);
  // Basic resource-generating attack is always present. Filter only the actual unlocked kit.
  return chosen ? kit.filter((s,i)=>i===0 || chosen.includes(s.id)) : kit;
}

// ---------- Setup ----------
function toUnit(f: FighterInput, side: Unit["side"], id: string): Unit {
  const maxMana = 100;
  return {
    id, side, name: f.name, img: f.img, sprite: f.sprite, mirror: f.mirror, cls: f.cls, boss: f.boss, elite: f.elite, level: f.level,
    gender: f.gender, scrolls: f.scrolls,
    maxHp: Math.max(1, Math.round(f.hp)), hp: Math.max(1, Math.round(f.hp)), atk: f.atk, def: f.def, crit: f.crit,
    critDmg: f.critDmg ?? 200, dodge: f.dodge, pen: f.pen ?? 0, acc: f.acc ?? 0,
    block: Math.min(BLOCK_CAP, f.block ?? (f.boss ? 5 : 0)), heal: Math.min(HEAL_CAP, f.heal ?? 0),
    speed: Math.round(100 + f.dodge * 2 + (f.acc ?? 0) + (f.cls === "archer" ? 15 : f.cls === "mage" ? 5 : 0) - (f.boss ? 10 : 0)),
    mana: side === "hero" ? 40 : 0, maxMana, statuses: [], cds: {},
    kit: side === "hero" || f.cls ? buildKit(f.cls, f.skills, f.skillLoadout) : [], turnsTaken: 0,
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
  const s: BattleState = { units, round: 0, queue: [], turn: 0, over: null, log: [], potions: 2 };
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

// ---------- Validation ----------
export function skillReady(u: Unit, sk: TSkill): string | null {
  if ((u.cds[sk.id] ?? 0) > 0) return `On cooldown (${u.cds[sk.id]})`;
  if (u.mana < sk.cost) return `Needs ${sk.cost} ${resourceName(u.cls)}`;
  return null;
}

export function validTargets(s: BattleState, actor: Unit, sk: TSkill): string[] {
  if (sk.target === "self") return [actor.id];
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

function healUnit(u: Unit, amount: number, ev: CEvent[]) {
  const amt = Math.round(amount * (1 + u.heal / 100));
  const before = u.hp; u.hp = Math.min(u.maxHp, u.hp + amt);
  ev.push({ kind: "heal", tgt: u.id, value: u.hp - before, text: `+${(u.hp - before).toLocaleString()}` });
}

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

/** End-of-turn: tick statuses & cooldowns for the actor, regen resource, advance. */
function endTurn(s: BattleState, u: Unit) {
  u.statuses = u.statuses.map((x) => ({ ...x, turns: x.turns - 1 })).filter((x) => x.turns > 0);
  for (const k of Object.keys(u.cds)) u.cds[k] = Math.max(0, u.cds[k] - 1);
  u.mana = Math.min(u.maxMana, u.mana + 10);
  u.turnsTaken++;
  s.turn++;
  checkOver(s);
}

function logEv(s: BattleState, ev: CEvent[], head: string) {
  s.log = [head, ...s.log].slice(0, 40);
  for (const e of ev) if (e.kind === "death" || e.kind === "telegraph") s.log = [e.text, ...s.log].slice(0, 40);
}

export type ActResult = { ok: true; events: CEvent[] } | { ok: false; error: string };

/** Player uses a skill on chosen targets. Validates turn, cooldown, resource and targets. */
export function playerAct(s: BattleState, skillId: string, targets: string[]): ActResult {
  const u = current(s);
  if (!u || u.side !== "hero") return { ok: false, error: "Not your turn" };
  const sk = u.kit.find((k) => k.id === skillId);
  if (!sk) return { ok: false, error: "Unknown skill" };
  const nr = skillReady(u, sk); if (nr) return { ok: false, error: nr };
  const valid = validTargets(s, u, sk);
  let tg = sk.target === "all" ? valid : sk.target === "self" ? [u.id] : [...new Set(targets)].filter((t) => valid.includes(t));
  if (sk.target === "enemy") tg = tg.slice(0, 1);
  if (sk.target === "multi") tg = tg.slice(0, sk.maxTargets ?? 3);
  if (tg.length === 0) return { ok: false, error: "Invalid target" };
  const ev: CEvent[] = [];
  if (startTurn(s, u, ev)) { endTurn(s, u); logEv(s, ev, `${u.name} is stunned.`); return { ok: true, events: ev }; }
  u.mana = Math.min(u.maxMana, u.mana - sk.cost + (sk.gain ?? 0));
  if (sk.cd) u.cds[sk.id] = sk.cd + 1; // +1 because endTurn ticks immediately
  let dealt = 0;
  if (sk.target !== "self" && sk.mult > 0) for (const t of tg) dealt += dealHit(s, u, unit(s, t), sk, ev);
  else if (sk.applies) for (const t of tg) addStatus(unit(s, t), sk.applies, ev);
  if (sk.selfApplies) addStatus(u, sk.selfApplies, ev);
  if (sk.heal) healUnit(u, sk.target === "self" ? u.maxHp * sk.heal : u.maxHp * sk.heal, ev);
  if (sk.id === "taunt") for (const t of tg) { const e = unit(s, t); if (e.telegraph) { e.telegraph.turns += 1; ev.push({ kind: "info", tgt: e.id, text: "DELAYED" }); } }
  endTurn(s, u);
  logEv(s, ev, `${u.name} uses ${sk.name}${dealt ? ` for ${dealt.toLocaleString()} damage` : ""}.`);
  return { ok: true, events: ev };
}

export function drinkPotion(s: BattleState): ActResult {
  const u = current(s);
  if (!u || u.side !== "hero") return { ok: false, error: "Not your turn" };
  if (s.potions <= 0) return { ok: false, error: "No potions left" };
  const ev: CEvent[] = [];
  if (startTurn(s, u, ev)) { endTurn(s, u); return { ok: true, events: ev }; }
  s.potions--; healUnit(u, u.maxHp * 0.35, ev);
  endTurn(s, u);
  logEv(s, ev, `${u.name} drinks a potion.`);
  return { ok: true, events: ev };
}

const BOSS_SKILL: TSkill = { id: "cataclysm", name: "Cataclysm", desc: "", icon: "flame", mult: 2.4, cd: 0, cost: 0, target: "enemy" };
const ELITE_SKILL: TSkill = { id: "rend", name: "Savage Rend", desc: "", icon: "axe", mult: 1.6, cd: 0, cost: 0, target: "enemy", applies: { kind: "burn", turns: 2, value: 0.2 } };
const BASIC: TSkill = { id: "hit", name: "Attack", desc: "", icon: "sword", mult: 1, cd: 0, cost: 0, target: "enemy" };

/** Enemy AI: bosses telegraph a heavy blow a turn ahead; elites rend; class opponents use their kits. */
export function enemyAct(s: BattleState): ActResult {
  const u = current(s);
  if (!u || u.side !== "foe") return { ok: false, error: "Not an enemy turn" };
  const ev: CEvent[] = [];
  if (startTurn(s, u, ev)) { endTurn(s, u); logEv(s, ev, `${u.name} cannot act.`); return { ok: true, events: ev }; }
  const targets = s.units.filter((x) => x.side !== u.side && alive(x));
  const t = targets[0];
  let sk: TSkill = BASIC;
  if (u.telegraph) {
    u.telegraph.turns--;
    if (u.telegraph.turns <= 0) { sk = u.telegraph.skill; u.telegraph = undefined; }
    else { ev.push({ kind: "telegraph", src: u.id, text: `${u.name} keeps gathering power…` }); endTurn(s, u); logEv(s, ev, `${u.name} channels.`); return { ok: true, events: ev }; }
  } else if (u.boss && u.turnsTaken % 3 === 1) {
    u.telegraph = { skill: BOSS_SKILL, turns: 1 };
    ev.push({ kind: "telegraph", src: u.id, text: `⚠ ${u.name} prepares CATACLYSM! Guard or stun it!` });
    endTurn(s, u); logEv(s, ev, `${u.name} gathers power.`);
    return { ok: true, events: ev };
  } else if (u.elite && u.turnsTaken % 3 === 2) sk = ELITE_SKILL;
  else if (u.kit.length) {
    const ready = [...u.kit].reverse().find((k) => k.mult > 0 && !skillReady(u, k) && k.cost > 0);
    const def = [...u.kit].find((k) => k.target === "self" && !skillReady(u, k));
    if (def && u.hp < u.maxHp * 0.4 && Math.random() < 0.5) sk = def; else if (ready && Math.random() < 0.7) sk = ready; else sk = u.kit[0];
    u.mana = Math.min(u.maxMana, u.mana - sk.cost + (sk.gain ?? 0));
    if (sk.cd) u.cds[sk.id] = sk.cd + 1;
  }
  if (!t) { endTurn(s, u); return { ok: true, events: ev }; }
  if (sk.target === "self") { if (sk.selfApplies) addStatus(u, sk.selfApplies, ev); if (sk.heal) healUnit(u, u.maxHp * sk.heal, ev); }
  else { dealHit(s, u, t, sk, ev); if (sk.heal) healUnit(u, u.maxHp * sk.heal, ev); }
  endTurn(s, u);
  logEv(s, ev, `${u.name} uses ${sk.name}.`);
  return { ok: true, events: ev };
}
