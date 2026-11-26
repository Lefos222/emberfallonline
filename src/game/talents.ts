import { locName, locText } from "./i18n";
import type { HeroClass } from "./data";

/** Stat bonuses a talent can grant per rank. Percent keys multiply the base stat. */
export interface TalentFx { hpPct?: number; atkPct?: number; defPct?: number; crit?: number; dodge?: number; critDmg?: number; pen?: number }

/**
 * Every talent is passive: a fight has no abilities to cast (see combat.ts), so a talent node is
 * always a permanent stat gain, bought with the same skill points and ranks as before.
 */
export interface Talent {
  id: string;
  name: string;
  desc: string;
  tier: 1 | 2 | 3 | 4 | 5;
  /** Every skill node offers exactly four upgrades. */
  max: 4;
  cost: number; // skill points for the first rank (the unlock)
  upgradeCost?: number; // skill points for upgrade ranks 2-4; defaults to cost
  fx: TalentFx; // passive, per rank
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
      t({ id: "w_g2", name: "Braced Stance", desc: "+3% defense and +2% health per rank", tier: 2, max: 4, cost: 1, fx: { defPct: 3, hpPct: 2 } }),
      t({ id: "w_g3", name: "Shield Mastery", desc: "+5% defense and +3% health per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { defPct: 5, hpPct: 3 } }),
      t({ id: "w_g4", name: "Fortress", desc: "+5% health and +2.5% defense per rank", tier: 4, max: 4, cost: 1, fx: { hpPct: 5, defPct: 2.5 } }),
      t({ id: "w_g5", name: "Aegis Wall", desc: "+8% defense and +5% health per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { defPct: 8, hpPct: 5 } }),
    ] },
    { id: "w_berserk", name: "Berserker", blurb: "Reckless damage", talents: [
      t({ id: "w_b1", name: "Fury", desc: "+5% attack per rank", tier: 1, max: 4, cost: 1, fx: { atkPct: 5 } }),
      t({ id: "w_b2", name: "Boiling Blood", desc: "+3% attack and +5% crit damage per rank", tier: 2, max: 4, cost: 1, fx: { atkPct: 3, critDmg: 5 } }),
      t({ id: "w_b3", name: "Whirlwind Fury", desc: "+5% attack and +1% crit chance per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { atkPct: 5, crit: 1 } }),
      t({ id: "w_b4", name: "Rampage", desc: "+4% attack and +10% crit damage per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 4, critDmg: 10 } }),
      t({ id: "w_b5", name: "Reaver's Wrath", desc: "+8% attack and +12% crit damage per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { atkPct: 8, critDmg: 12 } }),
    ] },
    { id: "w_warlord", name: "Warlord", blurb: "Precise battlefield control", talents: [
      t({ id: "w_w1", name: "Battle Focus", desc: "+2% crit chance per rank", tier: 1, max: 4, cost: 1, fx: { crit: 2 } }),
      t({ id: "w_w2", name: "Sunder", desc: "+2.5% armor penetration per rank", tier: 2, max: 4, cost: 1, fx: { pen: 2.5 } }),
      t({ id: "w_w3", name: "Executioner", desc: "+15% crit damage and +1.5% armor penetration per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { critDmg: 15, pen: 1.5 } }),
      t({ id: "w_w4", name: "Commander", desc: "+2% to attack, defense and health per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 2, defPct: 2, hpPct: 2 } }),
      t({ id: "w_w5", name: "Sovereign Might", desc: "+5% attack and +15% crit damage per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { atkPct: 5, critDmg: 15 } }),
    ] },
  ],
  mage: [
    { id: "m_fire", name: "Pyromancer", blurb: "Burn everything", talents: [
      t({ id: "m_f1", name: "Kindling", desc: "+5% attack per rank", tier: 1, max: 4, cost: 1, fx: { atkPct: 5 } }),
      t({ id: "m_f2", name: "Searing Focus", desc: "+3% attack and +1% crit chance per rank", tier: 2, max: 4, cost: 1, fx: { atkPct: 3, crit: 1 } }),
      t({ id: "m_f3", name: "Infernal Mastery", desc: "+5% attack and +6% crit damage per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { atkPct: 5, critDmg: 6 } }),
      t({ id: "m_f4", name: "Living Flame", desc: "+5% attack and +8% crit damage per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 5, critDmg: 8 } }),
      t({ id: "m_f5", name: "Solar Ascendance", desc: "+8% attack and +10% crit damage per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { atkPct: 8, critDmg: 10 } }),
    ] },
    { id: "m_frost", name: "Cryomancer", blurb: "Freeze and endure", talents: [
      t({ id: "m_c1", name: "Ice Barrier", desc: "+5% health per rank", tier: 1, max: 4, cost: 1, fx: { hpPct: 5 } }),
      t({ id: "m_c2", name: "Frozen Ward", desc: "+3% defense and +2% health per rank", tier: 2, max: 4, cost: 1, fx: { defPct: 3, hpPct: 2 } }),
      t({ id: "m_c3", name: "Glacial Armour", desc: "+4% defense and +4% health per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { defPct: 4, hpPct: 4 } }),
      t({ id: "m_c4", name: "Permafrost", desc: "+4% defense and +4% health per rank", tier: 4, max: 4, cost: 1, fx: { defPct: 4, hpPct: 4 } }),
      t({ id: "m_c5", name: "Winter Sovereign", desc: "+6% defense and +6% health per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { defPct: 6, hpPct: 6 } }),
    ] },
    { id: "m_arcane", name: "Arcanist", blurb: "Pure magical precision", talents: [
      t({ id: "m_a1", name: "Clarity", desc: "+2% crit chance per rank", tier: 1, max: 4, cost: 1, fx: { crit: 2 } }),
      t({ id: "m_a2", name: "Arcane Precision", desc: "+2% armor penetration and +0.5% crit chance per rank", tier: 2, max: 4, cost: 1, fx: { pen: 2, crit: 0.5 } }),
      t({ id: "m_a3", name: "Mana Well", desc: "+4% attack and +5% crit damage per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { atkPct: 4, critDmg: 5 } }),
      t({ id: "m_a4", name: "Archmage", desc: "+1.5% armor penetration and +2.5% attack per rank", tier: 4, max: 4, cost: 1, fx: { pen: 1.5, atkPct: 2.5 } }),
      t({ id: "m_a5", name: "Astral Mastery", desc: "+6% attack and +3% armor penetration per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { atkPct: 6, pen: 3 } }),
    ] },
  ],
  archer: [
    { id: "a_sniper", name: "Marksman", blurb: "One perfect shot", talents: [
      t({ id: "a_s1", name: "Steady Aim", desc: "+2% crit chance per rank", tier: 1, max: 4, cost: 1, fx: { crit: 2 } }),
      t({ id: "a_s2", name: "Killer Instinct", desc: "+8% crit damage and +0.5% crit chance per rank", tier: 2, max: 4, cost: 1, fx: { critDmg: 8, crit: 0.5 } }),
      t({ id: "a_s3", name: "Piercing Practice", desc: "+3% armor penetration and +5% crit damage per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { pen: 3, critDmg: 5 } }),
      t({ id: "a_s4", name: "Deadeye", desc: "+12% crit damage and +1.25% penetration per rank", tier: 4, max: 4, cost: 1, fx: { critDmg: 12, pen: 1.25 } }),
      t({ id: "a_s5", name: "Horizon Sight", desc: "+18% crit damage and +3% armor penetration per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { critDmg: 18, pen: 3 } }),
    ] },
    { id: "a_ranger", name: "Ranger", blurb: "A storm of arrows", talents: [
      t({ id: "a_r1", name: "Quick Draw", desc: "+5% attack per rank", tier: 1, max: 4, cost: 1, fx: { atkPct: 5 } }),
      t({ id: "a_r2", name: "Storm Volley", desc: "+3% attack and +0.5% crit chance per rank", tier: 2, max: 4, cost: 1, fx: { atkPct: 3, crit: 0.5 } }),
      t({ id: "a_r3", name: "Arrow Rain", desc: "+5% attack and +5% crit damage per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { atkPct: 5, critDmg: 5 } }),
      t({ id: "a_r4", name: "Wind Walker", desc: "+3% attack and +1.25% dodge per rank", tier: 4, max: 4, cost: 1, fx: { atkPct: 3, dodge: 1.25 } }),
      t({ id: "a_r5", name: "Tempest Mastery", desc: "+7% attack and +8% crit damage per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { atkPct: 7, critDmg: 8 } }),
    ] },
    { id: "a_shadow", name: "Shadowstalker", blurb: "Evasive survivor", talents: [
      t({ id: "a_h1", name: "Evasion", desc: "+1% dodge per rank", tier: 1, max: 4, cost: 1, fx: { dodge: 1 } }),
      t({ id: "a_h2", name: "Thick Hide", desc: "+5% health per rank", tier: 2, max: 4, cost: 1, fx: { hpPct: 5 } }),
      t({ id: "a_h3", name: "Shadow Arts", desc: "+1.5% dodge and +2% attack per rank", tier: 3, max: 4, cost: 3, upgradeCost: 1, fx: { dodge: 1.5, atkPct: 2 } }),
      t({ id: "a_h4", name: "Phantom", desc: "+3% defense, +3% health and +0.75% dodge per rank", tier: 4, max: 4, cost: 1, fx: { defPct: 3, hpPct: 3, dodge: 0.75 } }),
      t({ id: "a_h5", name: "Eclipse Veil", desc: "+2% dodge and +4% health per rank", tier: 5, max: 4, cost: 5, upgradeCost: 1, fx: { dodge: 2, hpPct: 4 } }),
    ] },
  ],
};

// Additional nodes retain the same saved ranks and skill-point budget as every existing talent.
const additions: Record<HeroClass, { passives: { name: string; fx: TalentFx }[] }> = {
  warrior: { passives: [
    { name: "Tempered Steel", fx: { defPct: 3 } },
    { name: "Titan Vitality", fx: { hpPct: 4 } },
    { name: "Warborn", fx: { atkPct: 3 } },
    { name: "Merciless Edge", fx: { critDmg: 6 } },
    { name: "Earthsplit Power", fx: { atkPct: 3, critDmg: 4 } },
    { name: "Iron Oath", fx: { defPct: 4, hpPct: 2 } },
    { name: "Blood Lance", fx: { atkPct: 3, pen: 1 } },
    { name: "Lion's Roar", fx: { crit: 1, atkPct: 2 } },
  ] },
  mage: { passives: [
    { name: "Celestial Mind", fx: { atkPct: 3 } },
    { name: "Runic Endurance", fx: { hpPct: 4 } },
    { name: "Spell Precision", fx: { crit: 1.5 } },
    { name: "Woven Wards", fx: { defPct: 3 } },
    { name: "Renewal Wave", fx: { hpPct: 5 } },
    { name: "Cometfall", fx: { atkPct: 3, critDmg: 4 } },
    { name: "Crystal Prison", fx: { defPct: 4 } },
    { name: "Void Pulse", fx: { atkPct: 3, crit: 1 } },
  ] },
  archer: { passives: [
    { name: "Eagle Instinct", fx: { crit: 1.5 } },
    { name: "Fleetfoot", fx: { dodge: 1 } },
    { name: "Wildwood Power", fx: { atkPct: 3 } },
    { name: "Keen Arrows", fx: { pen: 2 } },
    { name: "Thorn Volley", fx: { atkPct: 3, crit: 0.5 } },
    { name: "Falcon Eye", fx: { crit: 1.5 } },
    { name: "Snare Shot", fx: { pen: 2, atkPct: 2 } },
    { name: "Moonstep", fx: { dodge: 1.5 } },
  ] },
};
for (const cls of Object.keys(additions) as HeroClass[]) {
  // Saved ranks keep their ids and stay in the same specialisation as before.
  additions[cls].passives.forEach((passive, i) => {
    const id = i < 4 ? `${cls}_new_passive_${i}` : `${cls}_new_active_${i - 4}`;
    if (TREES[cls].some((spec) => spec.talents.some((node) => node.id === id))) return;
    TREES[cls][i % 3]?.talents.push({ id, name: passive.name, desc: "Permanent combat stats increase with each rank.", tier: i < 4 ? 2 : 4, max: 4, cost: i < 4 ? 1 : 3, upgradeCost: 1, fx: passive.fx });
  });
}

// Every specialisation and talent follows the player's language.
for (const specs of Object.values(TREES)) {
  for (const spec of specs) {
    locName(spec, ["name"]);
    locText(spec, ["blurb"]);
    for (const talent of spec.talents) {
      locName(talent, ["name"]);
      locText(talent, ["desc"]);
    }
  }
}

/** Painted icon (see SkillIcon) for each talent node, chosen by its stat theme. */
const TALENT_ICONS: Record<string, string> = {
  w_g1: "shield", w_g2: "shield", w_g3: "shield", w_g4: "shield", w_g5: "shield",
  w_b1: "flame", w_b2: "flame", w_b3: "axe", w_b4: "flame", w_b5: "axe",
  w_w1: "target", w_w2: "crosshair", w_w3: "crosshair", w_w4: "swords", w_w5: "crosshair",
  m_f1: "flame", m_f2: "flame", m_f3: "flame", m_f4: "flame", m_f5: "flame",
  m_c1: "snowflake", m_c2: "snowflake", m_c3: "snowflake", m_c4: "snowflake", m_c5: "snowflake",
  m_a1: "sparkles", m_a2: "sparkles", m_a3: "sparkles", m_a4: "sparkles", m_a5: "sparkles",
  a_s1: "target", a_s2: "crosshair", a_s3: "crosshair", a_s4: "crosshair", a_s5: "crosshair",
  a_r1: "wind", a_r2: "wind", a_r3: "wind", a_r4: "wind", a_r5: "wind",
  a_h1: "wind", a_h2: "heart", a_h3: "wind", a_h4: "shield", a_h5: "wind",
};

/** Every talent has a real painted icon, chosen by its stat theme. */
export const talentIcon = (t: Talent): string => TALENT_ICONS[t.id] ?? "star";

export interface TalentState { level: number; paragon: number; cls: HeroClass; gold?: number; talents?: Record<string, number>; spec?: string; /** Extra skill points earned from quests and achievements. */ bonusPts?: number }

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
