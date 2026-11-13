import { MITIGATION_FLOOR, type Foe, type Stats } from "./data";

/**
 * How a fight is likely to go, from the same rules the battle itself uses: dodge and accuracy decide
 * whether a blow lands, crit and crit damage decide how hard it hits, and armour mitigates it with
 * the battle's own floor. The gate turns this into one honest verdict and one recommended rating,
 * so a "Fair" pill really means the hero wins with room to spare.
 */

/** A hero's turn averages a little above a basic attack, because skills and crits are turned on. */
export const HERO_TURN_MULT = 1.35;
/** Margin at which a fight reads Fair: the hero lasts this many times longer than the kill takes. */
export const FAIR_MARGIN = 1.6;
/** A comfortable fight: twice as long lived as the kill needs. */
export const EASY_MARGIN = 2.6;
/** A fight the hero only just wins on average. */
export const HARD_MARGIN = 1.05;

export type Verdict = "Easy" | "Fair" | "Hard" | "Deadly";

export interface FightForecast {
  /** Turns the hero needs to fell the foe at their average damage. */
  turns: number;
  /** Turns the hero survives under the foe's average damage. */
  survival: number;
  /** survival / turns — above FAIR_MARGIN the fight is comfortably won. */
  margin: number;
  verdict: Verdict;
  /** Battle Rating this hero would need for the same fight to read Fair. */
  recommended: number;
}

const hitChance = (dodge: number, acc: number) => Math.max(0.05, 1 - Math.max(0, dodge - acc) / 100);

const mitigation = (def: number, pen = 0) =>
  Math.max(MITIGATION_FLOOR, 100 / (100 + Math.max(0, def) * (1 - Math.min(40, pen) / 100) * 0.9));

/** One turn of expected damage from an attacker against this defender's stats. */
export function damagePerTurn(
  atk: number,
  mult: number,
  crit: number,
  critDmg: number,
  pen: number,
  acc: number,
  targetDef: number,
  targetDodge: number,
) {
  const critFactor = 1 + (Math.max(0, Math.min(100, crit)) / 100) * (Math.max(100, critDmg) / 100 - 1);
  return Math.max(1, atk) * mult * hitChance(targetDodge, acc) * critFactor * mitigation(targetDef, pen);
}

export function forecastFight(stats: Stats, foe: Foe): FightForecast {
  const mine = damagePerTurn(stats.atk, HERO_TURN_MULT, stats.crit, stats.critDmg, stats.pen, stats.acc, foe.def, foe.dodge);
  const theirs = damagePerTurn(foe.atk, 1, foe.crit ?? 0, 200, 0, 0, stats.def, stats.dodge);
  const turns = Math.max(1, Math.round(foe.hp / mine));
  const survival = Math.max(1, Math.round(stats.hp / theirs));
  const margin = survival / turns;
  const verdict: Verdict =
    margin >= EASY_MARGIN ? "Easy" : margin >= FAIR_MARGIN ? "Fair" : margin >= HARD_MARGIN ? "Hard" : "Deadly";
  // Rating and fighting strength move together, so the rating that turns this fight Fair is the
  // hero's own rating scaled by how far the fight is from that margin.
  const recommended = Math.max(1, Math.round(stats.power * Math.sqrt(FAIR_MARGIN / Math.max(0.05, margin))));
  return { turns, survival, margin, verdict, recommended };
}
