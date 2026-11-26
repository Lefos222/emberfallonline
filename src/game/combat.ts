import { tr } from "./i18n";
/**
 * Turn-based duels, Shakes & Fidget style (pure, no React).
 *
 * Two fighters face each other and take turns: one blow each, back and forth, until one of them
 * falls. There are no abilities to cast and nothing to press mid-fight — everything a hero brings
 * (gear, talents, Astrals, drills, buffs) is passive and already folded into the stats below.
 */
import { calcDamage, type HeroClass } from "./data";
import type { SpriteRect } from "./world";

export interface FighterInput {
  name: string; img: string; hp: number; atk: number; def: number; crit: number; dodge: number; level: number;
  cls?: HeroClass; critDmg?: number; pen?: number; acc?: number; block?: number; heal?: number;
  sprite?: SpriteRect; mirror?: boolean; boss?: boolean; elite?: boolean;
  gender?: 'male' | 'female'; scrolls?: ('dmg' | 'def' | 'xp')[];
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
  pen: number; acc: number; block: number; heal: number;
}

export type EvKind = "dmg" | "crit" | "miss" | "block" | "death" | "info";
export interface CEvent { kind: EvKind; src?: string; tgt?: string; value?: number; text: string }

export interface BattleState {
  /** The hero is always units[0], the opponent units[1]. */
  units: Unit[];
  /** Index in `units` of the fighter whose blow comes next. */
  turn: number;
  round: number;
  over: null | "won" | "lost";
  log: string[];
}

export const BLOCK_CAP = 25;
export const HEAL_CAP = 50;

/**
 * The hero's blows carry the weight the old skill multipliers gave them — training, talents and
 * gear all folded into one passive number — so a level-matched hero out-damages a monster. Foes
 * hit at their raw strength, which keeps a higher-level monster genuinely dangerous.
 */
export const HERO_ATTACK_MULT = 2;
export const FOE_ATTACK_MULT = 1;

function toUnit(f: FighterInput, side: Unit["side"], id: string): Unit {
  return {
    id, side, name: f.name, img: f.img, sprite: f.sprite, mirror: f.mirror, cls: f.cls, boss: f.boss, elite: f.elite,
    level: f.level, gender: f.gender, scrolls: f.scrolls, look: f.look, synth: f.synth,
    maxHp: Math.max(1, Math.round(f.hp)), hp: Math.max(1, Math.round(f.hp)), atk: f.atk, def: f.def, crit: f.crit,
    critDmg: f.critDmg ?? 200, dodge: f.dodge, pen: f.pen ?? 0, acc: f.acc ?? 0,
    block: Math.min(BLOCK_CAP, f.block ?? (f.boss ? 5 : 0)), heal: Math.min(HEAL_CAP, f.heal ?? 0),
  };
}

/** Initiative: who throws the first blow. After that the turns strictly alternate. */
const initiative = (u: Unit) =>
  100 + u.dodge * 2 + u.acc + (u.cls === "archer" ? 15 : u.cls === "mage" ? 5 : 0) - (u.boss ? 10 : 0);

export function initBattle(hero: FighterInput, foe: FighterInput): BattleState {
  const units = [toUnit(hero, "hero", "H"), toUnit(foe, "foe", "F0")];
  return { units, turn: initiative(units[1]) > initiative(units[0]) ? 1 : 0, round: 1, over: null, log: [] };
}

export const heroUnit = (s: BattleState) => s.units[0]!;
export const foeUnit = (s: BattleState) => s.units[1]!;
const alive = (u: Unit) => u.hp > 0;

/** The fighter whose turn it is, or null once the fight is decided. */
export function current(s: BattleState): Unit | null {
  if (s.over) return null;
  const u = s.units[s.turn];
  return u && alive(u) ? u : null;
}

function checkOver(s: BattleState) {
  if (!alive(heroUnit(s))) s.over = "lost";
  else if (!alive(foeUnit(s))) s.over = "won";
}

export type StepResult = { ok: true; actor: Unit; events: CEvent[] } | { ok: false; events: CEvent[] };

/**
 * One blow: the unit whose turn it is strikes the other, then the turn passes on. Everything the
 * fight needs — dodge, crit, crit damage, armour penetration, accuracy, block — comes from the
 * two stat blocks, so a passive upgrade is felt here without any new rule.
 */
export function step(s: BattleState): StepResult {
  checkOver(s);
  if (s.over) return { ok: false, events: [] };
  const a = s.units[s.turn]!;
  const d = s.units[s.turn === 0 ? 1 : 0]!;
  const events: CEvent[] = [];
  const mult = a.side === "hero" ? HERO_ATTACK_MULT : FOE_ATTACK_MULT;
  const r = calcDamage(a.atk, d.def, mult, a.crit, d.dodge, false, a.critDmg, a.pen, a.acc);
  let line: string;
  if (r.miss) {
    events.push({ kind: "miss", src: a.id, tgt: d.id, text: tr("MISS") });
    line = tr("{name} misses {target}.", { name: a.name, target: d.name });
  } else {
    let dmg = r.dmg;
    const blocked = d.block > 0 && Math.random() * 100 < d.block;
    if (blocked) dmg = Math.max(1, Math.round(dmg * 0.5));
    d.hp = Math.max(0, d.hp - dmg);
    events.push({
      kind: blocked ? "block" : r.crit ? "crit" : "dmg",
      src: a.id, tgt: d.id, value: dmg,
      text: `${blocked ? tr("BLOCK ") : ""}${r.crit ? "✦" : ""}${dmg.toLocaleString()}`,
    });
    line = blocked
      ? tr("{name} hits {target} for {n} (blocked).", { name: a.name, target: d.name, n: dmg.toLocaleString() })
      : r.crit
        ? tr("{name} lands a critical hit on {target} for {n}.", { name: a.name, target: d.name, n: dmg.toLocaleString() })
        : tr("{name} hits {target} for {n}.", { name: a.name, target: d.name, n: dmg.toLocaleString() });
  }
  if (!alive(d)) events.push({ kind: "death", tgt: d.id, text: tr("{name} falls!", { name: d.name }) });
  s.log = [line, ...(alive(d) ? [] : [tr("{name} falls!", { name: d.name })]), ...s.log].slice(0, 30);
  checkOver(s);
  if (!s.over) {
    s.turn = s.turn === 0 ? 1 : 0;
    if (s.turn === 0) s.round++;
  }
  return { ok: true, actor: a, events };
}

/** Play a whole fight out at once — used by tests and by the gate's fight forecast. */
export function runBattle(s: BattleState): BattleState {
  let guard = 0;
  while (!s.over && guard++ < 500) step(s);
  // Two immortals (a hero whose armour outlasts the clock) are settled on the health they kept.
  if (!s.over) s.over = heroUnit(s).hp / heroUnit(s).maxHp >= foeUnit(s).hp / foeUnit(s).maxHp ? "won" : "lost";
  return s;
}

/** A side's rough Battle Rating inside a fight, the same formula for heroes and monsters. */
export function unitRating(u: Unit): number {
  return Math.sqrt(Math.max(1, u.maxHp) * Math.max(1, u.atk)) * (1 + (u.def + u.crit + u.dodge) / 200);
}

/**
 * War Gate pacing (presentation of the same fight, not its rewards): the monster's health is
 * capped so the hero needs about 3-5 blows — fewer the stronger the hero is against it —
 * which keeps a gate fight around 10-15 seconds.
 */
export function paceGateBattle(s: BattleState) {
  const hero = heroUnit(s);
  const foe = foeUnit(s);
  const ratio = Math.max(0, Math.min(1, unitRating(hero) / Math.max(1, unitRating(foe))));
  const hits = 3 + (1 - ratio) * 2;
  const cap = Math.max(1, Math.round(hero.atk * hits));
  if (foe.maxHp > cap) { foe.maxHp = cap; foe.hp = Math.min(foe.hp, cap); }
}
