import { describe, expect, it } from "vitest";
import { FAIR_MARGIN, forecastFight } from "@/game/battle-advice";
import {
  CONQUEST_DEPTH_GROWTH,
  CONQUEST_MULT,
  CONQUEST_RIFT_STEP,
  conquestFoe,
} from "@/game/conquest";
import { ENHANCE_MAX, heroStats, newHero, stageFoe } from "@/game/data";
import { prepareFoe } from "@/game/foe-scaling";
import { floorRequirement, floorTargets, referenceHero } from "@/game/floor-rating";

/** A hero who upgraded their gear past the reference ramp: enhancement topped out on every slot. */
function upgraded(level: number) {
  const h = referenceHero(level, "warrior");
  for (const item of Object.values(h.equipment)) if (item) item.enh = ENHANCE_MAX;
  return h;
}

describe("the Battle Rating a gate floor asks of a hero", () => {
  it("rises floor by floor around a hero's own level", () => {
    for (const level of [20, 60, 120]) {
      const floors = Array.from({ length: level + 5 }, (_, i) => i + 1).filter((f) => f % 10 !== 0);
      const bars = floors.map((f) => floorRequirement("conquest", f, level));
      // Rounded to three significant figures, two neighbouring floors can read the same number,
      // but the climb never goes backwards and always ends well above where it started.
      for (let i = 1; i < bars.length; i += 1) {
        expect(
          bars[i]!,
          `floor ${floors[i]} over floor ${floors[i - 1]} at level ${level}`,
        ).toBeGreaterThanOrEqual(bars[i - 1]!);
      }
      expect(bars[bars.length - 1]!).toBeGreaterThan(bars[0]! * 5);
    }
  });

  it("asks more of a higher-level hero for the same floor", () => {
    // The gate keeps pace with the hero's training, so the very same room hardens as they level:
    // here for the frontier floor itself, and for one fixed room across the levels that can see it.
    const frontier = [20, 40, 60, 80, 100, 140].map((level) =>
      floorRequirement("conquest", level, level),
    );
    for (let i = 1; i < frontier.length; i += 1)
      expect(frontier[i]!).toBeGreaterThan(frontier[i - 1]!);
    const room = [40, 60, 80, 100, 140].map((level) => floorRequirement("conquest", 60, level));
    for (let i = 1; i < room.length; i += 1) expect(room[i]!).toBeGreaterThan(room[i - 1]!);
  });

  it("is the rating at which the very same fight reads Fair", () => {
    // Accuracy, measured against the real fight: each class's own forecast says what rating it
    // would need (rating and fighting strength move together, so it is power × √(Fair / margin)).
    // The gate shows one number for all three, so each class must land within a tenth of it.
    for (const [gate, level, floor] of [
      ["conquest", 20, 18],
      ["conquest", 60, 60],
      ["conquest", 140, 120],
      ["campaign", 40, 40],
      ["campaign", 90, 95],
    ] as const) {
      const shown = floorRequirement(gate, floor, level);
      for (const cls of ["warrior", "mage", "archer"] as const) {
        const hero = referenceHero(level, cls);
        const foe = prepareFoe(
          gate === "conquest" ? conquestFoe(floor) : stageFoe(floor),
          referenceHero(level, "warrior"),
          gate === "conquest" ? "gate" : "world",
        );
        const stats = heroStats(hero);
        const fair = stats.power * Math.sqrt(FAIR_MARGIN / forecastFight(stats, foe).margin);
        expect(
          Math.abs(shown / fair - 1),
          `${gate} ${floor} at level ${level} for ${cls}`,
        ).toBeLessThan(0.1);
      }
    }
  });

  it("belongs to the floor, not to the gear of whoever is reading it", () => {
    // The same hero, richer by a whole set of gear, reads the same requirement for the floor.
    const bare = newHero("Bare", "warrior");
    bare.level = 55;
    const geared = upgraded(55);
    expect(heroStats(geared).power).toBeGreaterThan(heroStats(bare).power * 3);
    expect(floorRequirement("conquest", 50, geared.level, geared.paragon)).toBe(
      floorRequirement("conquest", 50, bare.level, bare.paragon),
    );
  });

  it("is cleared by the reference player on a floor below their level, and not on one far above", () => {
    const hero = referenceHero(60, "warrior");
    const power = heroStats(hero).power;
    expect(floorRequirement("conquest", 50, 60)).toBeLessThan(power);
    expect(floorRequirement("conquest", 80, 60)).toBeGreaterThan(power);
  });

  it("keeps the endless gate climbable with upgraded gear at the level cap", () => {
    // The balance change: the Conquest's own late ramp is gentler than the campaign's wall, so a
    // hero who keeps upgrading still takes the floor at their own level — the gate never walls.
    for (const level of [100, 140]) {
      const power = heroStats(upgraded(level)).power;
      expect(power, `level ${level} frontier floor`).toBeGreaterThan(
        floorRequirement("conquest", level, level),
      );
    }
    expect(CONQUEST_DEPTH_GROWTH).toBeLessThan(1.015);
    expect(CONQUEST_RIFT_STEP).toBeLessThan(0.02);
    // ...while the campaign's own wall is left exactly as it was.
    expect(stageFoe(120, CONQUEST_MULT).hp).toBeGreaterThan(conquestFoe(120).hp);
  });

  it("is not turned upside down by the world's level lift", () => {
    // A floor far below the hero used to be lifted harder than the floor at the hero's own level,
    // which asked more for floor 70 than for floor 80. The gate's ladder now only steps up.
    for (const level of [40, 80, 140]) {
      const near = floorRequirement("conquest", level - 10, level);
      const at = floorRequirement("conquest", level, level);
      expect(at, `level ${level}`).toBeGreaterThan(near);
    }
  });

  it("weighs every floor against the hero reading the ladder", () => {
    const hero = referenceHero(40, "warrior");
    const power = heroStats(hero).power;
    const rows = floorTargets("conquest", [30, 40, 60], hero, power);
    expect(rows[0]!.met).toBe(true);
    expect(rows[0]!.gap).toBe(0);
    expect(rows[0]!.boss).toBe(true);
    // The hero clears the floor at their own level, and is short of the one twenty floors ahead.
    expect(rows[1]!.required).toBeGreaterThan(rows[0]!.required);
    expect(rows[1]!.met).toBe(true);
    expect(rows[2]!.met).toBe(false);
    expect(rows[2]!.gap).toBe(rows[2]!.required - power);
  });
});
