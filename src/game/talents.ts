import type { HeroClass, Skill } from "./data";

/** Stat bonuses a talent can grant per rank. Percent keys multiply the base stat. */
export interface TalentFx { hpPct?: number; atkPct?: number; defPct?: number; crit?: number; dodge?: number; critDmg?: number; pen?: number }

export interface Talent {
  id: string;
  name: string;
  desc: string;
  tier: 1 | 2 | 3 | 4;
  max: number;
  cost: number; // skill points per rank
  fx?: TalentFx; // passive, per rank
  boost?: { skill: string; multPct: number }; // per rank, % damage added to an existing ability
  ability?: Skill; // new active ability (tier 3)
}

export interface Spec { id: string; name: string; blurb: string; talents: Talent[] }

export const SPEC_LEVEL = 10;
/** Points spent inside one spec needed to open each tier. */
export const TIER_REQ: Record<Talent["tier"], number> = { 1: 0, 2: 3, 3: 8, 4: 11 };

const t = (x: Talent) => x;

export const TREES: Record<HeroClass, Spec[]> = {
  warrior: [
    { id: "w_guard", name: "Bulwark", blurb: "Unbreakable defender", talents: [
      t({ id: "w_g1", name: "Iron Skin", desc: "+4% defense per rank", tier: 1, max: 5, cost: 1, fx: { defPct: 4 } }),
      t({ id: "w_g2", name: "Heavy Cleave", desc: "Cleave deals +15% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "cleave", multPct: 15 } }),
      t({ id: "w_g3", name: "Shield Slam", desc: "New ability: 1.6× damage and stuns the foe for a turn", tier: 3, max: 1, cost: 3, ability: { id: "slam", name: "Shield Slam", mult: 1.6, cd: 4, stun: true, icon: "sword" } }),
      t({ id: "w_g4", name: "Fortress", desc: "+20% health and +10% defense", tier: 4, max: 1, cost: 5, fx: { hpPct: 20, defPct: 10 } }),
    ] },
    { id: "w_berserk", name: "Berserker", blurb: "Reckless damage", talents: [
      t({ id: "w_b1", name: "Fury", desc: "+4% attack per rank", tier: 1, max: 5, cost: 1, fx: { atkPct: 4 } }),
      t({ id: "w_b2", name: "Boiling Blood", desc: "Bloodrage deals +15% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "rage", multPct: 15 } }),
      t({ id: "w_b3", name: "Whirlwind", desc: "New ability: 3 hits of 0.9× damage", tier: 3, max: 1, cost: 3, ability: { id: "whirl", name: "Whirlwind", mult: 0.9, hits: 3, cd: 4, icon: "axe" } }),
      t({ id: "w_b4", name: "Rampage", desc: "+15% attack and +40% crit damage", tier: 4, max: 1, cost: 5, fx: { atkPct: 15, critDmg: 40 } }),
    ] },
    { id: "w_warlord", name: "Warlord", blurb: "Precise battlefield control", talents: [
      t({ id: "w_w1", name: "Battle Focus", desc: "+1.5% crit chance per rank", tier: 1, max: 5, cost: 1, fx: { crit: 1.5 } }),
      t({ id: "w_w2", name: "Sunder", desc: "+3% armor penetration per rank", tier: 2, max: 3, cost: 1, fx: { pen: 3 } }),
      t({ id: "w_w3", name: "Execute", desc: "New ability: 3.6× damage, always crits", tier: 3, max: 1, cost: 3, ability: { id: "execute", name: "Execute", mult: 3.6, cd: 6, crit: true, icon: "crosshair" } }),
      t({ id: "w_w4", name: "Commander", desc: "+8% to attack, defense and health", tier: 4, max: 1, cost: 5, fx: { atkPct: 8, defPct: 8, hpPct: 8 } }),
    ] },
  ],
  mage: [
    { id: "m_fire", name: "Pyromancer", blurb: "Burn everything", talents: [
      t({ id: "m_f1", name: "Kindling", desc: "+4% attack per rank", tier: 1, max: 5, cost: 1, fx: { atkPct: 4 } }),
      t({ id: "m_f2", name: "Cataclysm", desc: "Meteor deals +15% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "meteor", multPct: 15 } }),
      t({ id: "m_f3", name: "Inferno", desc: "New ability: 4 hits of 0.8× damage", tier: 3, max: 1, cost: 3, ability: { id: "inferno", name: "Inferno", mult: 0.8, hits: 4, cd: 5, icon: "flame" } }),
      t({ id: "m_f4", name: "Living Flame", desc: "+18% attack and +30% crit damage", tier: 4, max: 1, cost: 5, fx: { atkPct: 18, critDmg: 30 } }),
    ] },
    { id: "m_frost", name: "Cryomancer", blurb: "Freeze and endure", talents: [
      t({ id: "m_c1", name: "Ice Barrier", desc: "+5% health per rank", tier: 1, max: 5, cost: 1, fx: { hpPct: 5 } }),
      t({ id: "m_c2", name: "Deep Freeze", desc: "Frost Nova deals +20% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "nova", multPct: 20 } }),
      t({ id: "m_c3", name: "Glacial Spike", desc: "New ability: 2.4× damage and freezes the foe", tier: 3, max: 1, cost: 3, ability: { id: "spike", name: "Glacial Spike", mult: 2.4, cd: 5, stun: true, icon: "snowflake" } }),
      t({ id: "m_c4", name: "Permafrost", desc: "+15% defense and +15% health", tier: 4, max: 1, cost: 5, fx: { defPct: 15, hpPct: 15 } }),
    ] },
    { id: "m_arcane", name: "Arcanist", blurb: "Pure magical precision", talents: [
      t({ id: "m_a1", name: "Clarity", desc: "+1.5% crit chance per rank", tier: 1, max: 5, cost: 1, fx: { crit: 1.5 } }),
      t({ id: "m_a2", name: "Arcane Edge", desc: "Arcane Bolt deals +20% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "bolt", multPct: 20 } }),
      t({ id: "m_a3", name: "Mana Drain", desc: "New ability: 2× damage and heals you 20%", tier: 3, max: 1, cost: 3, ability: { id: "drain", name: "Mana Drain", mult: 2, cd: 5, heal: 0.2, icon: "sparkles" } }),
      t({ id: "m_a4", name: "Archmage", desc: "+6% armor penetration and +10% attack", tier: 4, max: 1, cost: 5, fx: { pen: 6, atkPct: 10 } }),
    ] },
  ],
  archer: [
    { id: "a_sniper", name: "Marksman", blurb: "One perfect shot", talents: [
      t({ id: "a_s1", name: "Steady Aim", desc: "+1.5% crit chance per rank", tier: 1, max: 5, cost: 1, fx: { crit: 1.5 } }),
      t({ id: "a_s2", name: "Headshot", desc: "Death Snipe deals +15% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "snipe", multPct: 15 } }),
      t({ id: "a_s3", name: "Piercing Arrow", desc: "New ability: 3× damage, always crits", tier: 3, max: 1, cost: 3, ability: { id: "pierce", name: "Piercing Arrow", mult: 3, cd: 5, crit: true, icon: "crosshair" } }),
      t({ id: "a_s4", name: "Deadeye", desc: "+50% crit damage and +5% penetration", tier: 4, max: 1, cost: 5, fx: { critDmg: 50, pen: 5 } }),
    ] },
    { id: "a_ranger", name: "Ranger", blurb: "A storm of arrows", talents: [
      t({ id: "a_r1", name: "Quick Draw", desc: "+4% attack per rank", tier: 1, max: 5, cost: 1, fx: { atkPct: 4 } }),
      t({ id: "a_r2", name: "Arrow Storm", desc: "Volley deals +15% damage per rank", tier: 2, max: 3, cost: 1, boost: { skill: "volley", multPct: 15 } }),
      t({ id: "a_r3", name: "Rain of Arrows", desc: "New ability: 5 hits of 0.6× damage", tier: 3, max: 1, cost: 3, ability: { id: "rain", name: "Rain of Arrows", mult: 0.6, hits: 5, cd: 5, icon: "wind" } }),
      t({ id: "a_r4", name: "Wind Walker", desc: "+12% attack and +5% dodge", tier: 4, max: 1, cost: 5, fx: { atkPct: 12, dodge: 5 } }),
    ] },
    { id: "a_shadow", name: "Shadowstalker", blurb: "Evasive survivor", talents: [
      t({ id: "a_h1", name: "Evasion", desc: "+1% dodge per rank", tier: 1, max: 5, cost: 1, fx: { dodge: 1 } }),
      t({ id: "a_h2", name: "Thick Hide", desc: "+5% health per rank", tier: 2, max: 3, cost: 1, fx: { hpPct: 5 } }),
      t({ id: "a_h3", name: "Shadow Step", desc: "New ability: 1.8× damage and heals you 15%", tier: 3, max: 1, cost: 3, ability: { id: "shadow", name: "Shadow Step", mult: 1.8, cd: 4, heal: 0.15, icon: "target" } }),
      t({ id: "a_h4", name: "Phantom", desc: "+12% defense, +12% health, +3% dodge", tier: 4, max: 1, cost: 5, fx: { defPct: 12, hpPct: 12, dodge: 3 } }),
    ] },
  ],
};

export interface TalentState { level: number; paragon: number; cls: HeroClass; gold?: number; talents?: Record<string, number>; spec?: string }

/** One skill point per level after 1, plus one per Ascension level. */
export const totalPoints = (h: Pick<TalentState, "level" | "paragon">) => Math.max(0, h.level - 1) + h.paragon;

export function findTalent(cls: HeroClass, id: string): { spec: Spec; talent: Talent } | null {
  for (const spec of TREES[cls]) { const talent = spec.talents.find((x) => x.id === id); if (talent) return { spec, talent }; }
  return null;
}

export function spentIn(h: TalentState, specId?: string) {
  let n = 0;
  for (const [id, rank] of Object.entries(h.talents ?? {})) {
    const f = findTalent(h.cls, id);
    if (f && (!specId || f.spec.id === specId)) n += rank * f.talent.cost;
  }
  return n;
}
export const freePoints = (h: TalentState) => totalPoints(h) - spentIn(h);

/** Why a rank can't be learned, or null when allowed. */
export function learnBlocker(h: TalentState, id: string): string | null {
  const f = findTalent(h.cls, id);
  if (!f) return "Unknown skill";
  const { spec, talent } = f;
  const rank = h.talents?.[id] ?? 0;
  if (rank >= talent.max) return "Maxed";
  if (talent.tier >= 3) {
    if (h.level < SPEC_LEVEL) return `Requires level ${SPEC_LEVEL}`;
    if (h.spec !== spec.id) return `Requires ${spec.name} specialization`;
  }
  const need = TIER_REQ[talent.tier];
  if (spentIn(h, spec.id) < need) return `Spend ${need} points in ${spec.name}`;
  if (freePoints(h) < talent.cost) return `Needs ${talent.cost} skill point${talent.cost > 1 ? "s" : ""}`;
  return null;
}

export const resetCost = (h: Pick<TalentState, "level" | "paragon">) => 100 * (h.level + h.paragon);

export function talentFx(h: TalentState): Required<TalentFx> {
  const out = { hpPct: 0, atkPct: 0, defPct: 0, crit: 0, dodge: 0, critDmg: 0, pen: 0 };
  for (const [id, rank] of Object.entries(h.talents ?? {})) {
    const fx = findTalent(h.cls, id)?.talent.fx;
    if (fx) for (const k of Object.keys(fx) as (keyof TalentFx)[]) out[k] += (fx[k] ?? 0) * rank;
  }
  return out;
}

/** The hero's battle abilities after talent upgrades and unlocked abilities. */
export function talentSkills(base: Skill[], h: TalentState): Skill[] {
  const list = base.map((s) => ({ ...s }));
  for (const [id, rank] of Object.entries(h.talents ?? {})) {
    const t = findTalent(h.cls, id)?.talent;
    if (!t || rank <= 0) continue;
    if (t.boost) { const s = list.find((x) => x.id === t.boost!.skill); if (s) s.mult = +(s.mult * (1 + (t.boost.multPct * rank) / 100)).toFixed(2); }
    if (t.ability) list.push({ ...t.ability });
  }
  return list;
}
