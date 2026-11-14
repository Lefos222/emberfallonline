import { addFx, matCount, zeroFx, type BonusFx, type Mat } from "./crafting";
import { MAX_LEVEL, stageFoe, type Foe, type Hero, type HeroClass } from "./data";
import { scaledGold } from "./gold";
import type { SpriteRect } from "./world";
import echoArt from "@/assets/awakening/echo.webp";

/**
 * Awakening: the post-90 game. A level-90 hero opens the Awakening sanctum and climbs five
 * Awakening stages, each unlocking a new layer — the Soul Lattice, a class Aspect, four Sigil
 * slots with three sets, and the deepest Echo Trials. Everything is paid in Dawnshards, which only
 * heroes of level 90+ earn (every won fight, more from Echo Trials). Every bonus is a percentage
 * that joins `computeStats`' shared pipeline, so there is no second stat engine.
 */
export const AWAKEN_LEVEL = 90;

export type SigilSlot = "crown" | "heart" | "wings" | "seal";
export type SigilSet = "dawn" | "eclipse" | "tempest";
export interface AwakeningState {
  stage: number;
  shards: number;
  lattice: Record<string, number>;
  aspect?: string;
  aspectRank: number;
  sigils: Partial<Record<SigilSlot, { set: SigilSet; lv: number }>>;
  trialDay?: string;
  trials: number;
  best: number;
}

export const awakeningOf = (h: Pick<Hero, "awakening">): AwakeningState => {
  const a = h.awakening;
  return {
    stage: Math.max(0, Math.min(STAGES.length, Math.floor(a?.stage ?? 0))),
    shards: Math.max(0, Math.floor(a?.shards ?? 0)),
    lattice: { ...(a?.lattice ?? {}) },
    aspect: a?.aspect,
    aspectRank: Math.max(0, Math.min(ASPECT_MAX, Math.floor(a?.aspectRank ?? 0))),
    sigils: { ...(a?.sigils ?? {}) },
    trialDay: a?.trialDay,
    trials: Math.max(0, Math.floor(a?.trials ?? 0)),
    best: Math.max(0, Math.floor(a?.best ?? 0)),
  };
};
const put = (h: Hero, a: AwakeningState) => { h.awakening = a; };
export const canAwaken = (h: Pick<Hero, "level">) => h.level >= AWAKEN_LEVEL;

// ---------------- Stages ----------------
export interface Stage { name: string; level: number; shards: number; gold: number; unlock: string }
export const STAGES: Stage[] = [
  { name: "First Light", level: 90, shards: 0, gold: 1_500_000, unlock: "Soul Lattice and Echo Trials" },
  { name: "Kindled Soul", level: 100, shards: 250, gold: 3_000_000, unlock: "Class Aspects" },
  { name: "Ember Sovereign", level: 110, shards: 700, gold: 6_000_000, unlock: "Awakened Sigils" },
  { name: "Dawnborne", level: 120, shards: 1500, gold: 10_000_000, unlock: "Deeper Echo Trials and Lattice rank 30" },
  { name: "Eternal Flame", level: 130, shards: 3000, gold: 16_000_000, unlock: "Sigil refinement +20 and the Eternal aura" },
];
/** Each stage reached adds this much physical/magic attack, defence and health. */
export const STAGE_PCT = 3;

export function stageBlocker(h: Hero): string | null {
  const a = awakeningOf(h);
  const s = STAGES[a.stage];
  if (!s) return "Fully awakened";
  if (h.level < s.level) return `Requires level ${s.level}`;
  if (a.shards < s.shards) return "Not enough Dawnshards";
  if (h.gold < scaledGold(s.gold, h.level)) return "Not enough gold";
  return null;
}
export function advanceStage(h: Hero): string | null {
  const e = stageBlocker(h); if (e) return e;
  const a = awakeningOf(h); const s = STAGES[a.stage];
  h.gold -= scaledGold(s.gold, h.level);
  a.shards -= s.shards; a.stage += 1; put(h, a);
  return null;
}

// ---------------- Soul Lattice ----------------
export interface Node { id: string; name: string; stat: keyof BonusFx; per: number }
export const LATTICE: Node[] = [
  { id: "might", name: "Node of Might", stat: "atkPct", per: 0.6 },
  { id: "arcana", name: "Node of Arcana", stat: "matkPct", per: 0.6 },
  { id: "vigor", name: "Node of Vigor", stat: "hpPct", per: 0.8 },
  { id: "aegis", name: "Node of Aegis", stat: "defPct", per: 0.6 },
  { id: "ward", name: "Node of Warding", stat: "mdefPct", per: 0.6 },
  { id: "edge", name: "Node of the Edge", stat: "crit", per: 0.15 },
  { id: "ruin", name: "Node of Ruin", stat: "critDmg", per: 0.8 },
  { id: "pierce", name: "Node of Piercing", stat: "pen", per: 0.15 },
];
export const latticeMax = (stage: number) => (stage >= 4 ? 30 : 20);
export const latticeRank = (a: AwakeningState, id: string) => Math.max(0, Math.min(30, Math.floor(a.lattice[id] ?? 0)));
export const latticeCost = (rank: number, level: number) => ({ shards: 10 + rank * 6, gold: scaledGold(20_000 * (rank + 1), level) });
export function latticeBlocker(h: Hero, id: string): string | null {
  const a = awakeningOf(h);
  if (a.stage < 1) return "Awaken first";
  if (!LATTICE.some((n) => n.id === id)) return "Unknown node";
  const r = latticeRank(a, id);
  if (r >= latticeMax(a.stage)) return "Fully attuned";
  const c = latticeCost(r, h.level);
  if (a.shards < c.shards) return "Not enough Dawnshards";
  if (h.gold < c.gold) return "Not enough gold";
  return null;
}
export function attuneNode(h: Hero, id: string): string | null {
  const e = latticeBlocker(h, id); if (e) return e;
  const a = awakeningOf(h); const r = latticeRank(a, id); const c = latticeCost(r, h.level);
  a.shards -= c.shards; h.gold -= c.gold; a.lattice[id] = r + 1; put(h, a);
  return null;
}

// ---------------- Aspects ----------------
export type AspectKind = "bulwark" | "fury" | "ascendant";
export interface Aspect { id: AspectKind; desc: string; fx: Partial<BonusFx> }
export const ASPECT_NAMES: Record<HeroClass, Record<AspectKind, string>> = {
  warrior: { bulwark: "Juggernaut", fury: "Berserker", ascendant: "Warlord" },
  mage: { bulwark: "Aegis Magus", fury: "Pyromancer", ascendant: "Archon" },
  archer: { bulwark: "Sentinel", fury: "Deadeye", ascendant: "Windcaller" },
};
export const ASPECTS: Aspect[] = [
  { id: "bulwark", desc: "An unbreakable form: health, defence and block.", fx: { hpPct: 8, defPct: 8, mdefPct: 6, block: 4 } },
  { id: "fury", desc: "A raging form: attack, critical chance and critical damage.", fx: { atkPct: 7, matkPct: 7, crit: 3, critDmg: 12 } },
  { id: "ascendant", desc: "A radiant form: healing, accuracy and piercing.", fx: { atkPct: 4, matkPct: 4, heal: 12, acc: 6, pen: 3, mpen: 3 } },
];
export const ASPECT_MAX = 10;
/** Each mastery rank adds 15% to the aspect's bonuses. */
export const aspectMult = (rank: number) => 1 + 0.15 * rank;
export const ASPECT_SWAP = 150;
export const aspectRankCost = (rank: number) => 60 + rank * 40;
export function chooseAspect(h: Hero, id: AspectKind): string | null {
  const a = awakeningOf(h);
  if (a.stage < 2) return "Reach the second Awakening stage";
  if (a.aspect === id) return "Already chosen";
  if (a.aspect && a.shards < ASPECT_SWAP) return "Not enough Dawnshards";
  if (a.aspect) a.shards -= ASPECT_SWAP;
  a.aspect = id; put(h, a); return null;
}
export function masterAspect(h: Hero): string | null {
  const a = awakeningOf(h);
  if (!a.aspect) return "Choose an aspect first";
  if (a.aspectRank >= ASPECT_MAX) return "Fully mastered";
  const c = aspectRankCost(a.aspectRank);
  if (a.shards < c) return "Not enough Dawnshards";
  a.shards -= c; a.aspectRank += 1; put(h, a); return null;
}

// ---------------- Sigils ----------------
export const SIGIL_SLOTS: SigilSlot[] = ["crown", "heart", "wings", "seal"];
export const SIGIL_SETS: SigilSet[] = ["dawn", "eclipse", "tempest"];
export const SLOT_NAME: Record<SigilSlot, string> = { crown: "Crown", heart: "Heart", wings: "Wings", seal: "Seal" };
export const SET_NAME: Record<SigilSet, string> = { dawn: "Dawnbreaker", eclipse: "Eclipse", tempest: "Tempest" };
export const SLOT_BASE: Record<SigilSlot, Partial<BonusFx>> = {
  crown: { atkPct: 3, matkPct: 3 },
  heart: { hpPct: 4 },
  wings: { dodge: 1, acc: 2 },
  seal: { defPct: 3, mdefPct: 3, crit: 0.5 },
};
export const SET_BONUS: Record<SigilSet, { two: Partial<BonusFx>; four: Partial<BonusFx>; desc2: string; desc4: string }> = {
  dawn: { two: { heal: 8 }, four: { hpPct: 10, atkPct: 5 }, desc2: "+8% Healing Power", desc4: "+10% Max HP, +5% Physical Attack" },
  eclipse: { two: { pen: 4, mpen: 4 }, four: { critDmg: 25, crit: 4 }, desc2: "+4% Armor and Magic Pen", desc4: "+25% Crit Damage, +4% Crit Chance" },
  tempest: { two: { dodge: 3, acc: 5 }, four: { atkPct: 8, matkPct: 8 }, desc2: "+3% Dodge, +5% Accuracy", desc4: "+8% Physical and Magic Attack" },
};
export const SIGIL_FORGE: { shards: number; mats: Partial<Record<Mat, number>> } = { shards: 120, mats: { voidCrystal: 4, sunCrystal: 2, frostCrystal: 6 } };
export const sigilMax = (stage: number) => (stage >= 5 ? 20 : 15);
export const sigilRefineCost = (lv: number, level: number) => ({ shards: 20 + lv * 12, gold: scaledGold(50_000 * (lv + 1), level) });
/** Every refinement adds 10% of the slot's base. */
export const sigilMult = (lv: number) => 1 + 0.1 * lv;

export function forgeSigil(h: Hero, slot: SigilSlot, set: SigilSet): string | null {
  const a = awakeningOf(h);
  if (a.stage < 3) return "Reach the third Awakening stage";
  const cur = a.sigils[slot];
  if (cur?.set === set) return "Already worn";
  if (a.shards < SIGIL_FORGE.shards) return "Not enough Dawnshards";
  for (const [k, v] of Object.entries(SIGIL_FORGE.mats) as [Mat, number][]) if (matCount(h, k) < v) return "Not enough crystals";
  a.shards -= SIGIL_FORGE.shards;
  h.mats = { ...(h.mats ?? {}) };
  for (const [k, v] of Object.entries(SIGIL_FORGE.mats) as [Mat, number][]) h.mats[k] = matCount(h, k) - v;
  // Reforging into another set keeps half the refinement.
  a.sigils[slot] = { set, lv: cur ? Math.floor(cur.lv / 2) : 0 };
  put(h, a); return null;
}
export function refineSigil(h: Hero, slot: SigilSlot): string | null {
  const a = awakeningOf(h); const s = a.sigils[slot];
  if (!s) return "Forge this sigil first";
  if (s.lv >= sigilMax(a.stage)) return "Fully refined";
  const c = sigilRefineCost(s.lv, h.level);
  if (a.shards < c.shards) return "Not enough Dawnshards";
  if (h.gold < c.gold) return "Not enough gold";
  a.shards -= c.shards; h.gold -= c.gold; a.sigils[slot] = { ...s, lv: s.lv + 1 }; put(h, a); return null;
}
export function setCounts(a: AwakeningState): Record<SigilSet, number> {
  const out = { dawn: 0, eclipse: 0, tempest: 0 };
  for (const s of SIGIL_SLOTS) { const g = a.sigils[s]; if (g) out[g.set] += 1; }
  return out;
}

// ---------------- Echo Trials ----------------
export const TRIALS_PER_DAY = 5;
export const trialDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);
export const trialsLeft = (a: AwakeningState, now = Date.now()) => (a.trialDay === trialDay(now) ? Math.max(0, TRIALS_PER_DAY - a.trials) : TRIALS_PER_DAY);
/** Highest Echo depth the hero may pick: two more than their best, opened wider by stage 4. */
export const maxDepth = (a: AwakeningState) => Math.min(a.stage >= 4 ? 100 : 40, a.best + 2) || 1;
export const trialShards = (depth: number) => 12 + depth * 4;
export const ECHO_SPRITE: SpriteRect = { url: echoArt, x: 0, y: 0, w: 1024, h: 1024, sheetW: 1024, sheetH: 1024 };
export function echoFoe(depth: number, level: number): Foe & { sprite: SpriteRect } {
  const f = stageFoe(Math.min(MAX_LEVEL, level + 4), 1.6);
  const k = 1 + depth * 0.06;
  return { ...f, boss: true, name: `Awakened Echo · Depth ${depth}`, hp: Math.round(f.hp * 1.8 * k), atk: Math.round(f.atk * 1.2 * k), def: Math.round(f.def * 1.1 * Math.sqrt(k)), sprite: ECHO_SPRITE };
}
/** Spend a trial on entry, win or lose. Returns false when none are left. */
export function spendTrial(h: Hero, now = Date.now()): boolean {
  const a = awakeningOf(h); const day = trialDay(now);
  if (a.trialDay !== day) { a.trialDay = day; a.trials = 0; }
  if (a.trials >= TRIALS_PER_DAY) return false;
  a.trials += 1; put(h, a); return true;
}
export function winTrial(h: Hero, depth: number): number {
  const a = awakeningOf(h); const n = trialShards(depth);
  a.shards += n; a.best = Math.max(a.best, depth); put(h, a); return n;
}

/** Dawnshards for an ordinary won fight at level 90+. */
export const fightShards = (boss: boolean) => (boss ? 3 : 1);
export function addShards(h: Hero, n: number) { if (!canAwaken(h)) return; const a = awakeningOf(h); a.shards += Math.max(0, Math.floor(n)); put(h, a); }

// ---------------- Stats ----------------
export function awakeningFx(h: Hero): BonusFx {
  const out = zeroFx();
  if (!h.awakening) return out;
  const a = awakeningOf(h);
  const p = a.stage * STAGE_PCT;
  if (p) addFx(out, { atkPct: p, matkPct: p, defPct: p, mdefPct: p, hpPct: p });
  for (const n of LATTICE) { const r = latticeRank(a, n.id); if (r) addFx(out, { [n.stat]: n.per * r }); }
  const asp = ASPECTS.find((x) => x.id === a.aspect);
  if (asp && a.stage >= 2) { const m = aspectMult(a.aspectRank); const fx: Partial<BonusFx> = {}; for (const [k, v] of Object.entries(asp.fx)) fx[k as keyof BonusFx] = (v as number) * m; addFx(out, fx); }
  for (const s of SIGIL_SLOTS) {
    const g = a.sigils[s]; if (!g) continue;
    const m = sigilMult(g.lv); const fx: Partial<BonusFx> = {};
    for (const [k, v] of Object.entries(SLOT_BASE[s])) fx[k as keyof BonusFx] = (v as number) * m;
    addFx(out, fx);
  }
  const c = setCounts(a);
  for (const set of SIGIL_SETS) { if (c[set] >= 2) addFx(out, SET_BONUS[set].two); if (c[set] >= 4) addFx(out, SET_BONUS[set].four); }
  return out;
}
