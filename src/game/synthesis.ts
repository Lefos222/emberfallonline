import type { Hero, HeroClass } from "./data";
import { matCount, zeroFx, type BonusFx, type Mat } from "./crafting";

/**
 * Synthesis — the long-term armour progression of Ember Fall.
 *
 * The forge opens its Synthesis tab at level 30, and the nine armour sets themselves run
 * from level 40 to level 120, one set every ten levels. Each set is forged
 * piece by piece from the same materials the rest of the castle already drops, so
 * battle, bosses, elites, dungeons and gathering all feed it instead of a separate
 * economy. What the player wears here is stored on the hero save, drives both the
 * stat pipeline (see data.ts computeStats) and the character's appearance.
 */

/** One of the eight pieces of a synthesis set. Two rings are crafted separately. */
export type SynthSlot = "helmet" | "chest" | "belt" | "boots" | "ring1" | "ring2" | "sigil" | "weapon";

export const SYNTH_SLOTS: SynthSlot[] = ["helmet", "chest", "belt", "boots", "ring1", "ring2", "sigil", "weapon"];

export const SYNTH_SLOT_LABEL: Record<SynthSlot, string> = {
  helmet: "Helmet", chest: "Chestplate", belt: "Belt", boots: "Boots",
  ring1: "Ring I", ring2: "Ring II", sigil: "Sigil", weapon: "Weapon",
};

/** The class weapon every set carries (the game's classes already fight with these). */
export const SYNTH_WEAPON: Record<HeroClass, string> = { warrior: "Sword", mage: "Wand", archer: "Bow" };

/** Character level the forge's Synthesis tab opens at, before the first set exists. */
export const SYNTH_UNLOCK_LEVEL = 30;
/** Character level each armour set unlocks at. Set I opens at 40, Set IX at 120. */
export const SYNTH_LEVELS = [40, 50, 60, 70, 80, 90, 100, 110, 120];
export const SYNTH_TIER_COUNT = SYNTH_LEVELS.length;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
export const tierName = (tier: number) => `Synthesis Set ${ROMAN[tier - 1] ?? tier}`;
export const pieceName = (tier: number, slot: SynthSlot, cls: HeroClass) =>
  slot === "weapon" ? `${tierName(tier)} · ${SYNTH_WEAPON[cls]}` : `${tierName(tier)} · ${SYNTH_SLOT_LABEL[slot]}`;

/** Ascension levels count toward synthesis unlocks, exactly like the forge's level gates. */
export const synthLevel = (h: Pick<Hero, "level" | "paragon">) => h.level + (h.paragon ?? 0);

/** Whether the forge's Synthesis tab has opened for this character (character level 30). */
export const synthUnlocked = (h: Pick<Hero, "level" | "paragon">) => synthLevel(h) >= SYNTH_UNLOCK_LEVEL;

/** The highest set the character has unlocked (0 when still below level 40). */
export function unlockedTier(h: Pick<Hero, "level" | "paragon">): number {
  const lv = synthLevel(h);
  let out = 0;
  for (let t = 0; t < SYNTH_TIER_COUNT; t++) if (lv >= SYNTH_LEVELS[t]) out = t + 1;
  return out;
}

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------
const ART = import.meta.glob("../assets/synthesis/*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

/**
 * Painted armour art for one class, gender and set, cut from the design sheets.
 * The sheets' first panel is each class's basic starting look, so it is skipped:
 * set I starts with the first *synthesis* appearance of the row.
 */
export function synthArt(cls: HeroClass, gender: "male" | "female", tier: number): string | undefined {
  const base = `../assets/synthesis/${cls}-${gender}-${tier}.webp`;
  return ART[base] ?? Object.entries(ART).find(([k]) => k.endsWith(`/${cls}-${gender}-${tier}.webp`))?.[1];
}

// ---------------------------------------------------------------------------
// Save shape
// ---------------------------------------------------------------------------
export interface SynthSave {
  /** Crafted piece keys, "<tier>:<slot>". */
  crafted?: string[];
  /** The set worn in each slot; a slot with no entry is empty. */
  worn?: Record<string, number>;
}

export const pieceKey = (tier: number, slot: SynthSlot) => `${tier}:${slot}`;
export const isSlot = (s: string): s is SynthSlot => (SYNTH_SLOTS as string[]).includes(s);
export const craftedSet = (h: { synth?: SynthSave }) => new Set(h.synth?.crafted ?? []);
export const isCrafted = (h: { synth?: SynthSave }, tier: number, slot: SynthSlot) => craftedSet(h).has(pieceKey(tier, slot));
export const wornTier = (h: { synth?: SynthSave }, slot: SynthSlot): number | null => {
  const t = h.synth?.worn?.[slot];
  return typeof t === "number" && t >= 1 && t <= SYNTH_TIER_COUNT ? t : null;
};
/** The highest set the character is wearing — the armour appearance the hero shows. */
export function appearanceTier(h: { synth?: SynthSave }): number | null {
  const tiers = SYNTH_SLOTS.map((s) => wornTier(h, s)).filter((t): t is number => !!t);
  return tiers.length ? Math.max(...tiers) : null;
}

// ---------------------------------------------------------------------------
// Costs
//
// A full set is tuned to roughly three weeks of consistent play: synthesis was raised by
// half across every material, so a finished set is the game's longest armour climb. Battle
// income grows with the hero's level, so the ore and hide totals climb with the set while
// the rarer drops stay close to their drop rate; the piece-by-piece split keeps every
// piece's own requirements distinct without changing the set total.
// ---------------------------------------------------------------------------
type Mats = Partial<Record<Mat, number>>;

const SET_TOTALS: Partial<Record<Mat, number[]>> = {
  ore: [5160, 6100, 7035, 7975, 8910, 9850, 10785, 11725, 12660],
  hide: [3750, 4375, 4995, 5615, 6240, 6865, 7485, 8110, 8730],
  bloom: [278, 281, 284, 287, 290, 293, 296, 299, 302],
  essence: [323, 327, 332, 336, 341, 345, 350, 354, 359],
  fragment: [108, 111, 114, 117, 120, 123, 126, 129, 132],
  crystal: [45, 47, 48, 50, 51, 53, 54, 56, 57],
  sigil: [135, 140, 144, 149, 153, 158, 162, 167, 171],
  bossCore: [90, 93, 96, 99, 102, 105, 108, 111, 114],
  starshard: [135, 140, 144, 149, 153, 158, 162, 167, 171],
};
const MATS_USED = Object.keys(SET_TOTALS) as Mat[];

/** Share of a set's bill each piece carries, before its own material bias. */
const PIECE_SHARE: Record<SynthSlot, number> = {
  helmet: 0.11, chest: 0.16, belt: 0.10, boots: 0.10,
  ring1: 0.08, ring2: 0.08, sigil: 0.10, weapon: 0.16,
};

/** What each piece is hungry for: helmets want essence, rings want crystals, weapons want cores. */
const PIECE_BIAS: Record<SynthSlot, Mats> = {
  helmet: { essence: 1.3, fragment: 1.2, hide: 0.8, bloom: 0.6, crystal: 1.1 },
  chest: { ore: 1.2, hide: 1.2, fragment: 1.4, bossCore: 1.2, crystal: 1.2, bloom: 0.6 },
  belt: { hide: 1.6, bloom: 1.2, ore: 0.7, sigil: 0.9 },
  boots: { hide: 1.5, crystal: 1.2, ore: 0.8, bloom: 1.1 },
  ring1: { crystal: 1.8, starshard: 1.1, ore: 0.5, hide: 0.2, sigil: 1.2 },
  ring2: { crystal: 1.1, starshard: 1.8, ore: 0.5, hide: 0.2, sigil: 1.0 },
  sigil: { essence: 1.8, starshard: 1.5, sigil: 1.6, bloom: 1.3, ore: 0.4, hide: 0.2 },
  weapon: { bossCore: 1.8, sigil: 1.5, ore: 1.3, crystal: 1.4, starshard: 1.2, bloom: 0.5 },
};

const tidy = (n: number) => (n >= 100 ? Math.round(n / 5) * 5 : n >= 20 ? Math.round(n / 2) * 2 : Math.max(1, Math.round(n)));

/** Materials one piece of a set costs. */
export function synthCost(tier: number, slot: SynthSlot): Mats {
  const out: Mats = {};
  for (const m of MATS_USED) {
    const total = SET_TOTALS[m]?.[tier - 1] ?? 0;
    let weight = 0;
    for (const s of SYNTH_SLOTS) weight += PIECE_SHARE[s] * (PIECE_BIAS[s][m] ?? 1);
    const share = (PIECE_SHARE[slot] * (PIECE_BIAS[slot][m] ?? 1)) / weight;
    const n = tidy(total * share);
    if (n > 0) out[m] = n;
  }
  return out;
}

/** Every material a whole set costs — what the progression panel quotes. */
export function setCost(tier: number): Mats {
  const out: Mats = {};
  for (const slot of SYNTH_SLOTS) {
    const c = synthCost(tier, slot);
    for (const m of Object.keys(c) as Mat[]) out[m] = (out[m] ?? 0) + c[m]!;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
/** Base contribution of one piece at set I; every set adds 50% of that again. */
const PIECE_FX: Record<SynthSlot, Partial<Record<keyof BonusFx, number>>> = {
  helmet: { defPct: 1.2, mdefPct: 0.8, hpPct: 1.6 },
  chest: { defPct: 1.8, hpPct: 3.0, block: 0.6 },
  belt: { hpPct: 2.2, critDmg: 4 },
  boots: { dodge: 1.0, hpPct: 1.0, atkPct: 0.6 },
  ring1: { atkPct: 1.4, crit: 0.8 },
  ring2: { atkPct: 1.2, pen: 0.8 },
  sigil: { crit: 0.6, critDmg: 6, heal: 0.6 },
  weapon: { atkPct: 2.4, critDmg: 10, pen: 1.0 },
};
const tierPower = (tier: number) => 1 + 0.5 * (tier - 1);

/** What one piece grants; the magic classes read attack as magic attack. */
export function pieceFx(tier: number, slot: SynthSlot, cls: HeroClass): Partial<BonusFx> {
  const raw = PIECE_FX[slot];
  const k = tierPower(tier);
  const out: Partial<BonusFx> = {};
  for (const [stat, value] of Object.entries(raw) as [keyof BonusFx, number][]) {
    const mapped: keyof BonusFx = cls === "mage" && stat === "atkPct" ? "matkPct" : cls === "mage" && stat === "pen" ? "mpen" : stat;
    out[mapped] = +(value * k).toFixed(1);
  }
  return out;
}

/** Everything the worn synthesis gear adds to the hero's stats (see data.ts computeStats). */
export function synthFx(h: { cls: HeroClass; synth?: SynthSave }): BonusFx {
  const out = zeroFx();
  for (const slot of SYNTH_SLOTS) {
    const tier = wornTier(h, slot);
    if (!tier) continue;
    for (const [stat, value] of Object.entries(pieceFx(tier, slot, h.cls)) as [keyof BonusFx, number][]) out[stat] += value;
  }
  return out;
}

export const STAT_TEXT: Record<string, string> = {
  atkPct: "% Attack", matkPct: "% Magic Attack", defPct: "% Defence", mdefPct: "% Magic Defence", hpPct: "% Health",
  crit: "% Crit", critDmg: "% Crit Damage", dodge: "% Dodge", block: "% Block", pen: "% Armour Pen", mpen: "% Magic Pen", heal: "% Healing",
};
export const fxLine = (fx: Partial<BonusFx>) =>
  (Object.entries(fx) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => `+${v}${STAT_TEXT[k] ?? k}`);

// ---------------------------------------------------------------------------
// Crafting
// ---------------------------------------------------------------------------
export interface SynthPieceState {
  key: string; tier: number; slot: SynthSlot; name: string;
  cost: Mats; fx: Partial<BonusFx>;
  crafted: boolean; worn: boolean;
  missing: { mat: Mat; need: number; have: number }[];
  locked: boolean; blocker: string | null;
}

/** What blocks crafting this piece right now, or null when it can be forged. */
export function synthBlocker(h: Hero, tier: number, slot: SynthSlot): string | null {
  if (tier < 1 || tier > SYNTH_TIER_COUNT) return "No such set";
  if (synthLevel(h) < SYNTH_LEVELS[tier - 1]) return `Requires character level ${SYNTH_LEVELS[tier - 1]}`;
  if (isCrafted(h, tier, slot)) return "Already forged";
  const missing = Object.entries(synthCost(tier, slot)) as [Mat, number][];
  const short = missing.find(([m, n]) => matCount(h, m) < n);
  if (short) return `Not enough ${MATS_NAME[short[0]]}`;
  return null;
}

const MATS_NAME: Record<Mat, string> = {
  ore: "Ember Ore", essence: "Soul Essence", starshard: "Starshard", bossCore: "Boss Core",
  fragment: "Armor Fragment", sigil: "Elite Sigil", hide: "Beast Hide", bloom: "Emberbloom",
  crystal: "Arcane Crystal", enchantStone: "Enchantment Stone", fateStone: "Fate Stone",
};

/** Forge one piece: spends its materials and records it on the save. */
export function craftSynth(h: Hero, tier: number, slot: SynthSlot): string | null {
  const blocked = synthBlocker(h, tier, slot);
  if (blocked) return blocked;
  const mats = { ...(h.mats ?? {}) };
  for (const [m, n] of Object.entries(synthCost(tier, slot)) as [Mat, number][]) mats[m] = (mats[m] ?? 0) - n;
  h.mats = mats;
  const synth: SynthSave = { crafted: [...(h.synth?.crafted ?? [])], worn: { ...(h.synth?.worn ?? {}) } };
  synth.crafted!.push(pieceKey(tier, slot));
  h.synth = synth;
  return null;
}

/** Wear a forged piece in its slot. */
export function wearSynth(h: Hero, tier: number, slot: SynthSlot): string | null {
  if (!isCrafted(h, tier, slot)) return "Forge the piece first";
  if (synthLevel(h) < SYNTH_LEVELS[tier - 1]) return `Requires character level ${SYNTH_LEVELS[tier - 1]}`;
  h.synth = { ...(h.synth ?? {}), worn: { ...(h.synth?.worn ?? {}), [slot]: tier } };
  return null;
}

export function unwearSynth(h: Hero, slot: SynthSlot) {
  const worn = { ...(h.synth?.worn ?? {}) };
  delete worn[slot];
  h.synth = { ...(h.synth ?? {}), worn };
}

/** Repair whatever an old or hand-edited save carries, so the UI never shows phantom pieces. */
export function normalizeSynth(h: { synth?: SynthSave }) {
  if (!h.synth) return;
  const crafted = [...new Set((h.synth.crafted ?? []).filter((k) => {
    const [t, s] = k.split(":");
    return isSlot(s) && Number(t) >= 1 && Number(t) <= SYNTH_TIER_COUNT;
  }))];
  const worn: Record<string, number> = {};
  for (const [slot, tier] of Object.entries(h.synth.worn ?? {})) {
    if (!isSlot(slot) || !Number.isFinite(tier)) continue;
    if (tier < 1 || tier > SYNTH_TIER_COUNT || !crafted.includes(pieceKey(tier, slot))) continue;
    worn[slot] = tier;
  }
  h.synth = { crafted, worn };
}

// ---------------------------------------------------------------------------
// Reading progress
// ---------------------------------------------------------------------------
export function setProgress(h: Hero, tier: number) {
  const crafted = SYNTH_SLOTS.filter((s) => isCrafted(h, tier, s)).length;
  const worn = SYNTH_SLOTS.filter((s) => wornTier(h, s) === tier).length;
  return { crafted, worn, total: SYNTH_SLOTS.length };
}

/** Every set's state at once, for the progression rail. */
export function tierOverview(h: Hero) {
  const unlocked = unlockedTier(h);
  return Array.from({ length: SYNTH_TIER_COUNT }, (_, i) => {
    const tier = i + 1;
    return { tier, level: SYNTH_LEVELS[i], unlocked: tier <= unlocked, ...setProgress(h, tier) };
  });
}

export function overallProgress(h: Hero) {
  const tiers = tierOverview(h);
  const crafted = tiers.reduce((a, t) => a + t.crafted, 0);
  const worn = SYNTH_SLOTS.filter((s) => wornTier(h, s)).length;
  const complete = tiers.filter((t) => t.crafted === SYNTH_SLOTS.length).length;
  return { crafted, total: SYNTH_TIER_COUNT * SYNTH_SLOTS.length, worn, complete, unlocked: unlockedTier(h) };
}

/** One piece's full state, for the equipment grid and the detail panel. */
export function pieceState(h: Hero, tier: number, slot: SynthSlot): SynthPieceState {
  const cost = synthCost(tier, slot);
  const missing = (Object.entries(cost) as [Mat, number][])
    .filter(([m, n]) => matCount(h, m) < n)
    .map(([m, n]) => ({ mat: m, need: n, have: matCount(h, m) }));
  const locked = synthLevel(h) < SYNTH_LEVELS[tier - 1];
  return {
    key: pieceKey(tier, slot), tier, slot, name: pieceName(tier, slot, h.cls),
    cost, fx: pieceFx(tier, slot, h.cls),
    crafted: isCrafted(h, tier, slot), worn: wornTier(h, slot) === tier,
    missing, locked, blocker: synthBlocker(h, tier, slot),
  };
}
