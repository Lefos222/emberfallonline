import { FAIR_MARGIN, forecastFight } from "./battle-advice";
import { conquestFoe } from "./conquest";
import {
  MAX_LEVEL,
  heroStats,
  makeItem,
  newHero,
  stageFoe,
  type Foe,
  type Hero,
  type HeroClass,
  type Slot,
} from "./data";
import { prepareFoe } from "./foe-scaling";

/**
 * What each gate floor asks of a hero, in Battle Rating.
 *
 * The number is not a guess or a ratio of raw scores: it is the rating at which the very same
 * fight reads Fair in the gate's own forecast (see forecastFight), measured on the game's
 * reference player — the hero who trained and geared along the way, exactly the benchmark the
 * balance suite uses for levels 1 to 140. So a hero at the required rating wins the floor with
 * room to spare, one below it does not, and the ladder is the same for everyone standing at the
 * same level.
 *
 * Two properties follow from that, and both are what the gate is for:
 *  - deeper floors ask for more, floor after floor, in one ladder that only steps up (every tenth
 *    floor is a boss and spikes above its neighbours, then the climb carries on from where it was);
 *  - the same floor asks for more as the hero levels up, because a gate floor keeps pace with the
 *    hero's trained attributes (prepareFoe). Levels alone never carry a hero past the gate — gear,
 *    gems and the trained tracks do, which is why a well-built hero clears floors a bare one cannot.
 */

export type GateKind = "campaign" | "conquest";

const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];
const REFERENCE_CLASSES: HeroClass[] = ["warrior", "mage", "archer"];

/** Gear rarity the reference player wears by a level: the balance suite's own ramp. */
const referenceRarity = (level: number) =>
  level < 10 ? 1 : level < 25 ? 2 : level < 45 ? 3 : level < 65 ? 4 : 5;

/**
 * The reference player at a level: the attribute spread and the gear a hero who keeps up has —
 * the same benchmark the balance and rating suites measure the game against, so the requirement
 * a player sees is the requirement the game's own numbers were tuned to.
 */
export function referenceHero(level: number, cls: HeroClass, paragon = 0): Hero {
  const h = newHero("Reference", cls);
  h.level = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  h.paragon = Math.max(0, Math.floor(paragon));
  h.attrs = {
    str: Math.round(h.level * 0.4),
    int: Math.round(h.level * 0.2),
    agi: Math.round(h.level * 0.2),
    vit: Math.round(h.level * 0.5),
  };
  const rarity = referenceRarity(h.level);
  h.equipment = {};
  for (const slot of SLOTS) {
    const it = makeItem(cls, h.level, rarity, slot);
    it.enh = Math.min(30, Math.round(h.level / 5));
    h.equipment[slot] = it;
  }
  return h;
}

/** The foe a floor fields — the gate's own factory, never a second scaling path. */
const foeOf = (gate: GateKind, floor: number): Foe =>
  gate === "conquest" ? conquestFoe(floor) : stageFoe(floor);

/** A Conquest floor fights at the gate's own scaling; the campaign road fights at the world's. */
const scalingOf = (gate: GateKind) => (gate === "conquest" ? "gate" : "world");

/** Ratings read as tidy numbers: three significant figures, so 11 277 reads 11 300. */
function tidy(n: number): number {
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.max(1, n))) - 2));
  return Math.max(1, Math.round(n / mag) * mag);
}

const cache = new Map<string, number>();
const statsCache = new Map<string, { power: number; marginAgainst: (foe: Foe) => number }>();

/** The reference player's rating and fight forecast at one level, worked out once per level. */
function referenceStanding(level: number, paragon: number) {
  const key = `${level}:${paragon}`;
  const hit = statsCache.get(key);
  if (hit) return hit;
  const all = REFERENCE_CLASSES.map((cls) => heroStats(referenceHero(level, cls, paragon)));
  const power = all.reduce((sum, s) => sum + s.power, 0) / all.length;
  const marginAgainst = (foe: Foe) =>
    all.reduce((sum, s) => sum + forecastFight(s, foe).margin, 0) / all.length;
  const standing = { power, marginAgainst };
  statsCache.set(key, standing);
  return standing;
}

/**
 * The Battle Rating a floor asks of a hero standing at `level`.
 *
 * Built from the real fight: the floor's foe is prepared for the reference hero of that level,
 * with the gate's own scaling (see ScalingMode), and the forecast says how far that hero stands
 * from a Fair win. Because fighting strength and rating
 * move together, the rating that lands the fight exactly on Fair is the reference rating times
 * the square root of that distance — the same inverse forecast the gate has always used, now
 * measured on the reference player instead of on whoever happens to be looking.
 */
export function floorRequirement(
  gate: GateKind,
  floor: number,
  level: number,
  paragon = 0,
): number {
  const f = Math.max(1, Math.floor(floor));
  const lv = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  const asc = Math.max(0, Math.floor(paragon));
  const key = `${gate}:${f}:${lv}:${asc}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const foe = prepareFoe(
    foeOf(gate, floor),
    referenceHero(level, "warrior", paragon),
    scalingOf(gate),
  );
  const { power, marginAgainst } = referenceStanding(level, paragon);
  // All three classes share the same attributes, so they meet the same prepared foe.
  const margin = marginAgainst(foe);
  const required = tidy(power * Math.sqrt(FAIR_MARGIN / Math.max(1e-6, margin)));
  cache.set(key, required);
  return required;
}

/** One floor of the gate's rating ladder, weighed against the hero reading it. */
export interface FloorTarget {
  floor: number;
  required: number;
  /** Every tenth floor is a boss: it asks a spike above its neighbours, then the climb resumes. */
  boss: boolean;
  /** The hero's own Battle Rating. */
  yours: number;
  /** True when the hero's rating covers the floor's requirement. */
  met: boolean;
  /** How much rating the hero is short by (0 when the floor is met). */
  gap: number;
}

/** The ladder rows for a run of floors, against the hero's own rating. */
export function floorTargets(
  gate: GateKind,
  floors: number[],
  hero: Pick<Hero, "level" | "paragon">,
  rating: number,
): FloorTarget[] {
  return floors.map((floor) => {
    const required = floorRequirement(gate, floor, hero.level, hero.paragon);
    return {
      floor,
      required,
      boss: floor % 10 === 0,
      yours: rating,
      met: rating >= required,
      gap: Math.max(0, required - rating),
    };
  });
}
