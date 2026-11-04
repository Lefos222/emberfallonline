import { describe, expect, it } from "vitest";
import { heroStats, newHero, normalizeHero, type Hero } from "@/game/data";
import { matCount } from "@/game/crafting";
import {
  SYNTH_LEVELS, SYNTH_SLOTS, SYNTH_TIER_COUNT, appearanceTier, craftSynth, isCrafted, normalizeSynth,
  overallProgress, pieceFx, pieceState, setCost, setProgress, synthBlocker, synthCost, synthFx, synthLevel,
  synthUnlocked, tierOverview, unlockedTier, unwearSynth, wearSynth,
} from "@/game/synthesis";

function heroAt(level: number, cls: "warrior" | "mage" | "archer" = "warrior"): Hero {
  const h = newHero("Synthesis", cls);
  h.level = level;
  return h;
}

/** Enough of every material to forge anything. */
function rich(h: Hero): Hero {
  h.mats = { ore: 999_999, hide: 999_999, bloom: 999_999, essence: 999_999, fragment: 999_999, crystal: 999_999, sigil: 999_999, bossCore: 999_999, starshard: 999_999 };
  return h;
}

describe("synthesis sets", () => {
  it("has nine sets from level 40 to 120 and eight pieces each", () => {
    expect(SYNTH_TIER_COUNT).toBe(9);
    expect(SYNTH_LEVELS).toEqual([40, 50, 60, 70, 80, 90, 100, 110, 120]);
    expect(SYNTH_SLOTS).toHaveLength(8);
    expect(new Set(SYNTH_SLOTS).size).toBe(8);
  });

  it("opens the forge at level 30 and unlocks one set every ten levels after that", () => {
    expect(synthUnlocked(heroAt(29))).toBe(false);
    expect(synthUnlocked(heroAt(40))).toBe(true);
    expect(unlockedTier(heroAt(39))).toBe(0);
    expect(unlockedTier(heroAt(40))).toBe(1);
    expect(unlockedTier(heroAt(85))).toBe(5);
    expect(unlockedTier(heroAt(90))).toBe(6);
    const ascended = heroAt(80);
    ascended.paragon = 40;
    expect(synthLevel(ascended)).toBe(120);
    expect(unlockedTier(ascended)).toBe(9);
    expect(tierOverview(ascended).filter((t) => t.unlocked)).toHaveLength(9);
  });

  it("gives every piece its own requirements that add up to the set bill", () => {
    for (let tier = 1; tier <= SYNTH_TIER_COUNT; tier++) {
      const costs = SYNTH_SLOTS.map((slot) => synthCost(tier, slot));
      const signatures = new Set(costs.map((c) => JSON.stringify(Object.entries(c).sort())));
      expect(signatures.size).toBe(8);
      const total = setCost(tier);
      const summed = costs.reduce<Record<string, number>>((acc, c) => {
        for (const [m, n] of Object.entries(c)) acc[m] = (acc[m] ?? 0) + (n ?? 0);
        return acc;
      }, {});
      for (const [mat, n] of Object.entries(total)) expect(Math.abs((summed[mat] ?? 0) - n)).toBeLessThanOrEqual(45);
    }
  });

  it("asks more of the later sets than of the first", () => {
    const first = setCost(1);
    const last = setCost(9);
    expect(last.ore!).toBeGreaterThan(first.ore! * 2);
    expect(last.hide!).toBeGreaterThan(first.hide! * 2);
    // A full set is a two-week climb, not an afternoon: four figures of ore at the least.
    expect(first.ore!).toBeGreaterThan(2000);
  });

  it("gives every piece stats that grow with the set", () => {
    for (const slot of SYNTH_SLOTS) {
      const one = Object.values(pieceFx(1, slot, "warrior")).reduce((a, b) => a + b, 0);
      const nine = Object.values(pieceFx(9, slot, "warrior")).reduce((a, b) => a + b, 0);
      expect(one).toBeGreaterThan(0);
      expect(nine).toBeGreaterThan(one * 3);
    }
  });
});

describe("forging synthesis pieces", () => {
  it("refuses pieces of a set the character has not unlocked", () => {
    const h = rich(heroAt(40));
    expect(synthBlocker(h, 2, "helmet")).toBe("Requires character level 50");
    expect(craftSynth(h, 2, "helmet")).toBe("Requires character level 50");
    expect(isCrafted(h, 2, "helmet")).toBe(false);
  });

  it("refuses a piece the player cannot pay for and names the missing material", () => {
    const h = heroAt(40);
    h.mats = { ore: 1 };
    const blocked = synthBlocker(h, 1, "chest");
    expect(blocked).toMatch(/Not enough/);
    expect(craftSynth(h, 1, "chest")).toBe(blocked);
    expect(matCount(h, "ore")).toBe(1);
  });

  it("spends exactly the piece's materials and records it once", () => {
    const h = rich(heroAt(40));
    const cost = synthCost(1, "weapon");
    const before = Object.fromEntries(Object.keys(cost).map((m) => [m, matCount(h, m as never)]));
    expect(craftSynth(h, 1, "weapon")).toBeNull();
    for (const [mat, need] of Object.entries(cost)) {
      expect(matCount(h, mat as never)).toBe(before[mat] - (need ?? 0));
    }
    expect(isCrafted(h, 1, "weapon")).toBe(true);
    expect(craftSynth(h, 1, "weapon")).toBe("Already forged");
    expect(h.synth!.crafted!.filter((k) => k === "1:weapon")).toHaveLength(1);
  });

  it("reports the piece state the interface needs", () => {
    const h = heroAt(40);
    const st = pieceState(h, 1, "helmet");
    expect(st.crafted).toBe(false);
    expect(st.locked).toBe(false);
    expect(st.missing.length).toBeGreaterThan(0);
    expect(st.blocker).toMatch(/Not enough/);
    const locked = pieceState(h, 9, "helmet");
    expect(locked.locked).toBe(true);
    expect(locked.blocker).toBe("Requires character level 120");
  });
});

describe("worn synthesis equipment", () => {
  it("only wears pieces that were actually forged", () => {
    const h = rich(heroAt(40));
    expect(wearSynth(h, 1, "helmet")).toBe("Forge the piece first");
    craftSynth(h, 1, "helmet");
    expect(wearSynth(h, 1, "helmet")).toBeNull();
    expect(appearanceTier(h)).toBe(1);
    unwearSynth(h, "helmet");
    expect(appearanceTier(h)).toBeNull();
  });

  it("changes the hero's stats through the shared pipeline", () => {
    const h = rich(heroAt(40));
    const bare = heroStats(h).power;
    for (const slot of SYNTH_SLOTS) {
      craftSynth(h, 1, slot);
      wearSynth(h, 1, slot);
    }
    expect(setProgress(h, 1)).toEqual({ crafted: 8, worn: 8, total: 8 });
    expect(heroStats(h).power).toBeGreaterThan(bare);
    expect(synthFx(h).hpPct).toBeGreaterThan(0);
    // The appearance follows the highest set worn, never the level.
    expect(appearanceTier(h)).toBe(1);
    const ascended = { ...h, level: 110 };
    expect(appearanceTier(ascended)).toBe(1);
  });

  it("reads the magic classes' attack bonus as magic attack", () => {
    expect(pieceFx(1, "weapon", "mage").matkPct).toBeGreaterThan(0);
    expect(pieceFx(1, "weapon", "warrior").atkPct).toBeGreaterThan(0);
    expect(pieceFx(1, "weapon", "mage").atkPct).toBeUndefined();
  });

  it("survives a save round-trip and drops impossible entries", () => {
    const h = rich(heroAt(50));
    craftSynth(h, 1, "helmet");
    craftSynth(h, 2, "chest");
    wearSynth(h, 1, "helmet");
    wearSynth(h, 2, "chest");
    const saved = JSON.parse(JSON.stringify(h)) as Hero;
    normalizeHero(saved);
    expect(appearanceTier(saved)).toBe(2);
    expect(isCrafted(saved, 2, "chest")).toBe(true);

    const tampered: Hero = { ...saved, synth: { crafted: ["2:chest", "9:hat", "x:1"], worn: { chest: 2, belt: 3, shoes: 1 } } };
    normalizeSynth(tampered);
    expect(tampered.synth!.crafted).toEqual(["2:chest"]);
    // belt 3 was never forged and "shoes" is not a slot.
    expect(tampered.synth!.worn).toEqual({ chest: 2 });
    expect(appearanceTier(tampered)).toBe(2);
  });

  it("counts overall progress for the progression rail", () => {
    const h = rich(heroAt(40));
    for (const slot of SYNTH_SLOTS) craftSynth(h, 1, slot);
    const prog = overallProgress(h);
    expect(prog.crafted).toBe(8);
    expect(prog.total).toBe(72);
    expect(prog.complete).toBe(1);
    expect(prog.unlocked).toBe(1);
  });
});
