import type { HeroClass, Skill } from "./data";

/** Stat bonuses a talent can grant per rank. Percent keys multiply the base stat. */
export interface TalentFx { hpPct?: number; atkPct?: number; defPct?: number; crit?: number; dodge?: number; critDmg?: number; pen?: number }

export interface Talent {
  id: string;
  name: string;
  desc: string;
  tier: 1 | 2 | 3 | 4 | 5;
  /** Every skill node offers exactly four upgrades. */
  max: 4;
  cost: number; // skill points for the first rank (the unlock)
  upgradeCost?: number; // skill points for upgrade ranks 2-4; defaults to cost
  fx?: TalentFx; // passive, per rank
  boost?: { skill: string; multPct: number }; // per rank, % damage added to an existing ability
  ability?: Skill; // new active ability (rank 1 unlocks it)
  selfBoost?: { multPct: number }; // per upgrade rank beyond the first, strengthens the ability
  milestone?: { road?: number; spire?: number };
}

export interface Spec { id: string; name: string; blurb: string; talents: Talent[] }

export const SPEC_LEVEL = 10;
/** Points spent inside one spec needed to open each tier. */
export const TIER_REQ: Record<Talent["tier"], number> = { 1: 0, 2: 3, 3: 8, 4: 11, 5: 16 };

const t = (x: Talent) => x;

export const TREES: Record<HeroClass, Spec[]> = {
  warrior: [
    { id: "w_guard", name: "Bulwark", blurb: "Unbreakable defender", talents: [
      t({ id: "w_g1", name: "Iron Skin", desc: "+5% defense per rank", tier: 1, max: 4, cost: 1, fx: { defPct: 5 } }),
      t({ id: "w_g2", name: "Heavy Cleave", desc: "Cleave deals +12% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "cleave", multPct: 12 } }),
      t({ id: "w_g3", name: "Shield Slam", desc: "New ability: 1.6× damage and stuns the foe for a turn · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "slam", name: "Shield Slam", mult: 1.6, cd: 4, stun: true, icon: "sword" }, selfBoost: { multPct: 10 } }),
      t({ id: "w_g4", name: "Fortress", desc: "+5% health and +2.5% defense per rank", tier: 4, max: 4, cost: 1, fx: { hpPct: 5, defPct: 2.5 } }),
      t({ id: "w_g5", name: "Aegis Breaker", desc: "Ascended shield slam: 2× damage, stun. Clear Road stage 100. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { road: 100 }, ability: { id: "aegis", name: "Aegis Breaker", mult: 2, cd: 5, stun: true, icon: "shield" }, selfBoost: { multPct: 10 } }),
    ] },
    { id: "w_berserk", name: "Berserker", blurb: "Reckless damage", talents: [
      t({ id: "w_b1", name: "Fury", desc: "+5% attack per rank", tier: 1, max: 4, cost: 1, fx: { atkPct: 5 } }),
      t({ id: "w_b2", name: "Boiling Blood", desc: "Bloodrage deals +12% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "rage", multPct: 12 } }),
      t({ id: "w_b3", name: "Whirlwind", desc: "New ability: 3 hits of 0.9× damage · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "whirl", name: "Whirlwind", mult: 0.9, hits: 3, cd: 4, icon: "axe" }, selfBoost: { multPct: 10 } }),
      t({ id: "w_b4", name: "Rampage", desc: "+4% attack and +10% crit damage per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 4, critDmg: 10 } }),
      t({ id: "w_b5", name: "Cyclone Reaver", desc: "Ascended whirlwind: 4 hits of 0.7× against all foes. Clear Spire wave 100. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { spire: 100 }, ability: { id: "cyclone", name: "Cyclone Reaver", mult: 0.7, hits: 4, cd: 6, icon: "axe" }, selfBoost: { multPct: 10 } }),
    ] },
    { id: "w_warlord", name: "Warlord", blurb: "Precise battlefield control", talents: [
      t({ id: "w_w1", name: "Battle Focus", desc: "+2% crit chance per rank", tier: 1, max: 4, cost: 1, fx: { crit: 2 } }),
      t({ id: "w_w2", name: "Sunder", desc: "+2.5% armor penetration per rank", tier: 2, max: 4, cost: 1, fx: { pen: 2.5 } }),
      t({ id: "w_w3", name: "Execute", desc: "New ability: 3.6× damage, always crits · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "execute", name: "Execute", mult: 3.6, cd: 6, crit: true, icon: "crosshair" }, selfBoost: { multPct: 10 } }),
      t({ id: "w_w4", name: "Commander", desc: "+2% to attack, defense and health per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 2, defPct: 2, hpPct: 2 } }),
      t({ id: "w_w5", name: "Sovereign Execute", desc: "Ascended execution: 4× damage, guaranteed critical. Clear Road stage 120. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { road: 120 }, ability: { id: "sovereign", name: "Sovereign Execute", mult: 4, cd: 7, crit: true, icon: "crosshair" }, selfBoost: { multPct: 10 } }),
    ] },
  ],
  mage: [
    { id: "m_fire", name: "Pyromancer", blurb: "Burn everything", talents: [
      t({ id: "m_f1", name: "Kindling", desc: "+5% attack per rank", tier: 1, max: 4, cost: 1, fx: { atkPct: 5 } }),
      t({ id: "m_f2", name: "Cataclysm", desc: "Meteor deals +12% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "meteor", multPct: 12 } }),
      t({ id: "m_f3", name: "Inferno", desc: "New ability: 4 hits of 0.8× damage · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "inferno", name: "Inferno", mult: 0.8, hits: 4, cd: 5, icon: "flame" }, selfBoost: { multPct: 10 } }),
      t({ id: "m_f4", name: "Living Flame", desc: "+5% attack and +8% crit damage per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 5, critDmg: 8 } }),
      t({ id: "m_f5", name: "Solar Cataclysm", desc: "Ascended inferno: 4 hits of 0.85× against all foes with burning. Clear Spire wave 100. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { spire: 100 }, ability: { id: "solar", name: "Solar Cataclysm", mult: 0.85, hits: 4, cd: 6, icon: "flame" }, selfBoost: { multPct: 10 } }),
    ] },
    { id: "m_frost", name: "Cryomancer", blurb: "Freeze and endure", talents: [
      t({ id: "m_c1", name: "Ice Barrier", desc: "+5% health per rank", tier: 1, max: 4, cost: 1, fx: { hpPct: 5 } }),
      t({ id: "m_c2", name: "Deep Freeze", desc: "Frost Nova deals +12% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "nova", multPct: 12 } }),
      t({ id: "m_c3", name: "Glacial Spike", desc: "New ability: 2.4× damage and freezes the foe · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "spike", name: "Glacial Spike", mult: 2.4, cd: 5, stun: true, icon: "snowflake" }, selfBoost: { multPct: 10 } }),
      t({ id: "m_c4", name: "Permafrost", desc: "+4% defense and +4% health per rank", tier: 4, max: 4, cost: 1, fx: { defPct: 4, hpPct: 4 } }),
      t({ id: "m_c5", name: "Winter Crown", desc: "Ascended frost nova: 1.4× damage and freezes all foes. Clear Road stage 100. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { road: 100 }, ability: { id: "winter", name: "Winter Crown", mult: 1.4, cd: 6, stun: true, icon: "snowflake" }, selfBoost: { multPct: 10 } }),
    ] },
    { id: "m_arcane", name: "Arcanist", blurb: "Pure magical precision", talents: [
      t({ id: "m_a1", name: "Clarity", desc: "+2% crit chance per rank", tier: 1, max: 4, cost: 1, fx: { crit: 2 } }),
      t({ id: "m_a2", name: "Arcane Edge", desc: "Arcane Bolt deals +15% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "bolt", multPct: 15 } }),
      t({ id: "m_a3", name: "Mana Drain", desc: "New ability: 2× damage and heals you 20% · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "drain", name: "Mana Drain", mult: 2, cd: 5, heal: 0.2, icon: "sparkles" }, selfBoost: { multPct: 10 } }),
      t({ id: "m_a4", name: "Archmage", desc: "+1.5% armor penetration and +2.5% attack per rank", tier: 4, max: 4, cost: 1, fx: { pen: 1.5, atkPct: 2.5 } }),
      t({ id: "m_a5", name: "Astral Siphon", desc: "Ascended drain: 2.4× damage and heals 25%. Clear Road stage 120. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { road: 120 }, ability: { id: "astral-siphon", name: "Astral Siphon", mult: 2.4, cd: 6, heal: 0.25, icon: "sparkles" }, selfBoost: { multPct: 10 } }),
    ] },
  ],
  archer: [
    { id: "a_sniper", name: "Marksman", blurb: "One perfect shot", talents: [
      t({ id: "a_s1", name: "Steady Aim", desc: "+2% crit chance per rank", tier: 1, max: 4, cost: 1, fx: { crit: 2 } }),
      t({ id: "a_s2", name: "Headshot", desc: "Death Snipe deals +12% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "snipe", multPct: 12 } }),
      t({ id: "a_s3", name: "Piercing Arrow", desc: "New ability: 3× damage, always crits · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "pierce", name: "Piercing Arrow", mult: 3, cd: 5, crit: true, icon: "crosshair" }, selfBoost: { multPct: 10 } }),
      t({ id: "a_s4", name: "Deadeye", desc: "+12% crit damage and +1.25% penetration per rank", tier: 4, max: 4, cost: 1, fx: { critDmg: 12, pen: 1.25 } }),
      t({ id: "a_s5", name: "Horizon Lance", desc: "Ascended piercing arrow: 3.5× critical damage, ignores 40% armor. Clear Road stage 120. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { road: 120 }, ability: { id: "horizon", name: "Horizon Lance", mult: 3.5, cd: 6, crit: true, icon: "crosshair" }, selfBoost: { multPct: 10 } }),
    ] },
    { id: "a_ranger", name: "Ranger", blurb: "A storm of arrows", talents: [
      t({ id: "a_r1", name: "Quick Draw", desc: "+5% attack per rank", tier: 1, max: 4, cost: 1, fx: { atkPct: 5 } }),
      t({ id: "a_r2", name: "Arrow Storm", desc: "Volley deals +12% damage per rank", tier: 2, max: 4, cost: 1, boost: { skill: "volley", multPct: 12 } }),
      t({ id: "a_r3", name: "Rain of Arrows", desc: "New ability: 5 hits of 0.6× damage · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "rain", name: "Rain of Arrows", mult: 0.6, hits: 5, cd: 5, icon: "wind" }, selfBoost: { multPct: 10 } }),
      t({ id: "a_r4", name: "Wind Walker", desc: "+3% attack and +1.25% dodge per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 3, dodge: 1.25 } }),
      t({ id: "a_r5", name: "Tempest Barrage", desc: "Ascended arrow rain: 5 hits of 0.65× against all foes. Clear Spire wave 100. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { spire: 100 }, ability: { id: "tempest", name: "Tempest Barrage", mult: 0.65, hits: 5, cd: 6, icon: "wind" }, selfBoost: { multPct: 10 } }),
    ] },
    { id: "a_shadow", name: "Shadowstalker", blurb: "Evasive survivor", talents: [
      t({ id: "a_h1", name: "Evasion", desc: "+1% dodge per rank", tier: 1, max: 4, cost: 1, fx: { dodge: 1 } }),
      t({ id: "a_h2", name: "Thick Hide", desc: "+5% health per rank", tier: 2, max: 4, cost: 1, fx: { hpPct: 5 } }),
      t({ id: "a_h3", name: "Shadow Step", desc: "New ability: 1.8× damage and heals you 15% · upgrades add +10% damage", tier: 3, max: 4, cost: 3, upgradeCost: 1, ability: { id: "shadow", name: "Shadow Step", mult: 1.8, cd: 4, heal: 0.15, icon: "target" }, selfBoost: { multPct: 10 } }),
      t({ id: "a_h4", name: "Phantom", desc: "+3% defense, +3% health and +0.75% dodge per rank", tier: 4, max: 4, cost: 1, fx: { defPct: 3, hpPct: 3, dodge: 0.75 } }),
      t({ id: "a_h5", name: "Eclipse Step", desc: "Ascended shadow strike: 2.2× damage, heals 20%, grants evasion. Clear Road stage 100. · upgrades add +10% damage", tier: 5, max: 4, cost: 5, upgradeCost: 1, milestone: { road: 100 }, ability: { id: "eclipse", name: "Eclipse Step", mult: 2.2, cd: 5, heal: 0.2, icon: "target" }, selfBoost: { multPct: 10 } }),
    ] },
  ],
};

export interface TalentState { level: number; paragon: number; cls: HeroClass; gold?: number; talents?: Record<string, number>; spec?: string; road?: { cleared: number; best: number }; /** Extra skill points earned from quests and achievements. */ bonusPts?: number }

/** One skill point per level after 1, plus one per Ascension level. */
/** Skill points: 1 per level, +1 bonus every 5 levels, +1 per ascension, + quest bonuses. */
export const totalPoints = (h: Pick<TalentState, "level" | "paragon" | "bonusPts">) =>
  Math.max(0, h.level - 1) + Math.floor(h.level / 5) + h.paragon + (h.bonusPts ?? 0);

/** Skill points for the next rank of a talent: the unlock cost, then the upgrade cost. */
export const rankCost = (t: Talent, rank: number) => (rank === 0 ? t.cost : (t.upgradeCost ?? t.cost));

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

/** Why a rank can't be learned, or null when allowed.
 *  Every skill is upgradeable under any circumstance — the only requirements are
 *  being under the rank cap and having enough skill points. Prerequisites, tier
 *  spending thresholds, specialization, level and milestone gates are all removed. */
export function learnBlocker(h: TalentState, id: string): string | null {
  const f = findTalent(h.cls, id);
  if (!f) return "Unknown skill";
  const { talent } = f;
  const rank = h.talents?.[id] ?? 0;
  if (rank >= talent.max) return "Maxed";
  const cost = rankCost(talent, rank);
  if (freePoints(h) < cost) return `Needs ${cost} skill point${cost > 1 ? "s" : ""}`;
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
    if (t.boost) { const boost = t.boost; const s = list.find((x) => x.id === boost.skill); if (s) s.mult = +(s.mult * (1 + (boost.multPct * rank) / 100)).toFixed(2); }
    if (t.ability) {
      const ability = { ...t.ability };
      if (t.selfBoost && rank > 1) ability.mult = +(ability.mult * (1 + (t.selfBoost.multPct * (rank - 1)) / 100)).toFixed(2);
      list.push(ability);
    }
  }
  return list;
}
