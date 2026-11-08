import { describe, expect, it } from "vitest";
import {
  MAX_LEVEL,
  RATING_CAP,
  battleRating,
  foeRating,
  heroStats,
  makeItem,
  newHero,
  ratingScale,
  scaledFoe,
  stageFoe,
  WORLD_DRIFT,
  type Hero,
  type HeroClass,
  type Slot,
} from "@/game/data";
import { campaignFoe, regionOf } from "@/game/world";

const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

/** A hero who trained and geared along the way, matching the balance suite's own benchmark. */
function heroAtLevel(level: number, cls: HeroClass = "warrior"): Hero {
  const h = newHero("Rated", cls);
  h.level = level;
  h.paragon = Math.round(level / 10);
  h.attrs = { str: Math.round(level * 0.4), int: Math.round(level * 0.2), agi: Math.round(level * 0.2), vit: Math.round(level * 0.5) };
  const rarity = level < 10 ? 1 : level < 25 ? 2 : level < 45 ? 3 : level < 65 ? 4 : 5;
  h.equipment = {};
  for (const slot of SLOTS) {
    const it = makeItem(cls, level, rarity, slot);
    it.enh = Math.min(30, Math.round(level / 5));
    h.equipment[slot] = it;
  }
  return h;
}

describe("Battle Rating scales with the hero", () => {
  it("keeps level 1 unchanged and climbs past three times the raw score at the cap", () => {
    expect(ratingScale(1)).toBeCloseTo(1, 2);
    expect(ratingScale(MAX_LEVEL)).toBeGreaterThan(3.3);
    expect(ratingScale(MAX_LEVEL)).toBeLessThan(3.6);
    expect(battleRating(1000, 1)).toBeCloseTo(1000, -1);
    expect(battleRating(1000, MAX_LEVEL)).toBeGreaterThan(3300);
  });

  it("reaches the hundreds of thousands with a geared level 140 hero", () => {
    const h = heroAtLevel(140);
    expect(heroStats(h).power).toBeGreaterThan(400_000);
    expect(heroStats(h).power).toBeLessThan(RATING_CAP * 1.4);
  });

  it("makes one step of an upgrade worth more the higher the hero stands", () => {
    const low = newHero("Low", "warrior");
    const high = heroAtLevel(140);
    const beforeLow = heroStats(low).power;
    low.attrs.str += 1;
    const lowGain = heroStats(low).power - beforeLow;
    const beforeHigh = heroStats(high).power;
    high.attrs.str += 1;
    const highGain = heroStats(high).power - beforeHigh;
    expect(highGain).toBeGreaterThan(lowGain * 5);
  });

  it("still rewards a level with a visible rating jump", () => {
    const h = heroAtLevel(100);
    const before = heroStats(h).power;
    h.level = 101;
    expect(heroStats(h).power).toBeGreaterThan(before);
  });
});

describe("the world levels up with the hero", () => {
  it("leaves a foe alone when the hero is at or below its level", () => {
    const foe = stageFoe(1);
    expect(scaledFoe(foe, 1)).toBe(foe);
    expect(scaledFoe(foe, 0)).toBe(foe);
  });

  it("raises an old stage's foes toward the hero, never past the drift cap", () => {
    const foe = stageFoe(1);
    const up = scaledFoe(foe, 100);
    expect(up.level).toBe(1 + WORLD_DRIFT);
    expect(up.hp).toBeGreaterThan(foe.hp);
    expect(up.atk).toBeGreaterThan(foe.atk);
    expect(foeRating(up)).toBeGreaterThan(foeRating(foe));
  });

  it("keeps the campaign endless at any stage", () => {
    for (const stage of [50, 200, 1000, 5000]) {
      expect(Number.isFinite(campaignFoe(stage).hp)).toBe(true);
      expect(campaignFoe(stage).hp).toBeGreaterThan(0);
      expect(regionOf(stage)).toBeTruthy();
    }
  });
});
