import { describe, expect, it } from "vitest";
import { EARLY_GAME_LEVEL, SLOTS, earlyEase, foeToughness, newHero, riftFactor, stageFoe } from "@/game/data";

describe("gentler opening levels", () => {
  it("softens foes hardest at stage 1 and stops easing after level 17", () => {
    expect(earlyEase(1)).toBeLessThan(0.8);
    for (let stage = 1; stage < EARLY_GAME_LEVEL; stage++) {
      expect(earlyEase(stage + 1)).toBeGreaterThan(earlyEase(stage));
    }
    expect(earlyEase(EARLY_GAME_LEVEL + 1)).toBe(1);
    expect(earlyEase(60)).toBe(1);
  });

  it("early foes hit softer than the raw stage curve", () => {
    const eased = stageFoe(1);
    expect(eased.atk).toBeLessThan(Math.round(12 + 8 + 0.2));
    expect(eased.hp).toBeLessThan(300);
    // The late campaign is untouched: no easing is applied past the opening levels.
    const raw = (150 + 41 * 150) * riftFactor(41) * foeToughness(41);
    expect(stageFoe(41).hp).toBe(Math.round(raw));
  });

  it("starts a new hero with a full set of common gear", () => {
    const hero = newHero("Newcomer", "warrior");
    const worn = Object.values(hero.equipment).filter(Boolean);
    expect(worn.length).toBeGreaterThanOrEqual(SLOTS.length - 1);
    for (const piece of worn) expect(piece!.rarity).toBe(0);
  });
});
