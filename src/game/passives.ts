import type { Hero, HeroClass } from "./data";
import type { TalentFx } from "./talents";

/** Extra keys feed existing Stats/combat fields, not a second combat model. */
export interface PassiveFx extends TalentFx { heal?: number; block?: number; acc?: number }
export interface Passive {
  id: string; name: string; desc: string; group: "general" | HeroClass;
  tier: 1 | 2 | 3; max: number; cost: number;
  prereq?: { id: string; rank: number }; fx: PassiveFx;
}
export const PASSIVE_TIER_REQ = { 1: 0, 2: 3, 3: 7 } as const;
const node = (group: Passive["group"], id: string, name: string, desc: string, tier: Passive["tier"], fx: PassiveFx, prereq?: string): Passive => ({
  group, id, name, desc, tier, fx, max: 4, cost: tier,
  ...(prereq ? { prereq: { id: prereq, rank: 2 } } : {}),
});
export const PASSIVES: readonly Passive[] = [
  node("general", "field_medicine", "Field Medicine", "Improve every healing skill and combat potion.", 1, { heal: 2 }),
  node("general", "brace", "Impact Brace", "Turn incoming strikes into blocks.", 1, { block: 1 }),
  node("general", "trail_sense", "Trail Sense", "Read evasive opponents rather than gambling on criticals.", 1, { acc: 1 }),
  node("general", "provisions", "Deep Provisions", "Carry the endurance to survive long expeditions.", 1, { hpPct: 2, heal: 1 }),
  node("general", "footwork", "Measured Footwork", "Balance a guarded stance with careful movement.", 2, { dodge: 0.5, block: 0.5 }, "brace"),
  node("general", "anatomy", "Practical Anatomy", "Understand wounds both to mend and to exploit them.", 2, { heal: 1, pen: 0.5 }, "field_medicine"),
  node("general", "watch", "Night Watch", "Stay alert and protected against unpredictable foes.", 2, { acc: 1, defPct: 1 }, "trail_sense"),
  node("general", "reserve", "Living Reserve", "Build a larger reservoir for percentage-based healing.", 2, { hpPct: 3, heal: 1 }, "provisions"),
  node("general", "triage", "Battlefield Triage", "Keep healing effective behind a steady guard.", 3, { heal: 3, block: 1 }, "anatomy"),
  node("general", "veteran", "Veteran Instinct", "Combine precise reactions with defensive movement.", 3, { acc: 2, dodge: 1 }, "watch"),
  node("warrior", "w_staunch", "Staunch Blood", "Strengthen Bloodrage recovery without changing its damage.", 1, { heal: 3 }),
  node("warrior", "w_angle", "Shield Angle", "Deflect blows while finding an opening.", 1, { block: 1, acc: 0.5 }),
  node("warrior", "w_march", "Long March", "Preserve health under a defensive stance.", 2, { hpPct: 2, block: 1 }, "w_angle"),
  node("warrior", "w_scar", "Scar Tissue", "Survive wounds and recover more efficiently.", 2, { defPct: 2, heal: 1 }, "w_staunch"),
  node("warrior", "w_reprisal", "Reprisal Training", "Increase attack and penetration, including counterattack damage.", 3, { atkPct: 2, pen: 1 }, "w_march"),
  node("warrior", "w_refuge", "Walking Refuge", "Guard your recovery rather than chasing critical strikes.", 3, { block: 2, heal: 2 }, "w_scar"),
  node("mage", "m_restorative", "Restorative Study", "Improve Restoration and Mana Drain healing.", 1, { heal: 3 }),
  node("mage", "m_geometry", "Ward Geometry", "Give fragile robes a reliable defensive angle.", 1, { block: 1, defPct: 1 }),
  node("mage", "m_vessel", "Barrier Vessel", "A larger health pool also strengthens Arcane Barrier.", 2, { hpPct: 3, heal: 1 }, "m_restorative"),
  node("mage", "m_sight", "Unclouded Sight", "Keep spells accurate while sidestepping danger.", 2, { acc: 2, dodge: 0.5 }, "m_geometry"),
  node("mage", "m_recuperate", "Recuperative Ward", "Combine healing efficiency with defensive resilience.", 3, { heal: 3, defPct: 2 }, "m_vessel"),
  node("mage", "m_refraction", "Refraction", "Read defenses and place spells through their gaps.", 3, { acc: 2, pen: 1 }, "m_sight"),
  node("archer", "a_herbal", "Herbal Lore", "Improve potions and Shadow Step recovery.", 1, { heal: 3 }),
  node("archer", "a_range", "Range Reading", "Track moving targets without relying on critical chance.", 1, { acc: 2 }),
  node("archer", "a_retreat", "Covered Retreat", "Mix evasion with a guarded fallback.", 2, { dodge: 0.5, block: 1 }, "a_range"),
  node("archer", "a_camp", "Hidden Camp", "Build endurance and efficient recovery.", 2, { hpPct: 2, heal: 2 }, "a_herbal"),
  node("archer", "a_gap", "Gap Reader", "Place arrows through armor even against evasive prey.", 3, { acc: 2, pen: 1 }, "a_retreat"),
  node("archer", "a_return", "Safe Return", "Prioritize survival and healing on long hunts.", 3, { dodge: 1, heal: 3 }, "a_camp"),
];
export const PASSIVE_FX_ZERO: Required<PassiveFx> = { hpPct: 0, atkPct: 0, defPct: 0, crit: 0, dodge: 0, critDmg: 0, pen: 0, heal: 0, block: 0, acc: 0 };
const whole = (n: number | undefined) => Number.isFinite(n) ? Math.max(0, Math.floor(n!)) : 0;
const available = (h: Hero, p: Passive) => p.group === "general" || p.group === h.cls;
export function passiveRank(h: Hero, id: string): number {
  const p = PASSIVES.find(p => p.id === id);
  return p && available(h, p) ? Math.min(p.max, whole(h.passives?.[id])) : 0;
}
export const insightBank = (h: Hero) => whole(h.insight);
export const spentInsight = (h: Hero, group?: Passive["group"]) => PASSIVES.reduce((n, p) => n + (!group || p.group === group ? passiveRank(h, p.id) * p.cost : 0), 0);
/** Lifetime accounted Insight = unspent bank + purchased ranks. */
export const totalInsight = (h: Hero) => insightBank(h) + spentInsight(h);
export function passiveFx(h: Hero): Required<PassiveFx> {
  const out = { ...PASSIVE_FX_ZERO };
  for (const p of PASSIVES) for (const k of Object.keys(p.fx) as (keyof PassiveFx)[]) out[k] += (p.fx[k] ?? 0) * passiveRank(h, p.id);
  return out;
}
/** Use in computeStats before its existing caps; combat already consumes these Stats. */
export function mergePassiveFx(h: Hero, base: TalentFx): Required<PassiveFx> {
  const out = passiveFx(h);
  for (const k of Object.keys(base) as (keyof TalentFx)[]) out[k] += base[k] ?? 0;
  return out;
}
export function passiveBlocker(h: Hero, id: string): string | null {
  const p = PASSIVES.find(p => p.id === id);
  if (!p) return "Unknown passive";
  if (!available(h, p)) return `Requires ${p.group} class`;
  if (passiveRank(h, id) >= p.max) return "Maxed";
  // Every passive is upgradeable under any circumstance — prerequisites and tier
  // spending thresholds are removed; only the class gate, rank cap and Insight
  // cost remain.
  if (insightBank(h) < p.cost) return `Needs ${p.cost} Insight`;
  return null;
}
export function learnPassive(h: Hero, id: string): Hero {
  const next = { ...h, passives: { ...h.passives } };
  if (passiveBlocker(h, id)) return next;
  const p = PASSIVES.find(p => p.id === id)!;
  next.insight = insightBank(h) - p.cost;
  next.passives[id] = passiveRank(h, id) + 1;
  return next;
}
/** Call once inside the accepted reward/claim transaction; losses grant nothing. */
export type InsightEvent =
  | { kind: "campaign"; won: boolean; boss?: boolean; elite?: boolean }
  | { kind: "dungeon"; won: boolean }
  | { kind: "endless"; won: boolean }
  | { kind: "achievement"; claimed: boolean };
export function insightFrom(event: InsightEvent): number {
  if (event.kind === "achievement") return event.claimed ? 5 : 0;
  if (!event.won) return 0;
  if (event.kind === "dungeon") return 8;
  if (event.kind === "endless") return 2;
  return event.boss ? 6 : event.elite ? 3 : 1;
}
