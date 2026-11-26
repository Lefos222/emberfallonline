import { describe, expect, it, vi } from "vitest";
import { initBattle, runBattle, heroUnit, foeUnit, type FighterInput } from "@/game/combat";

/**
 * With abilities removed, AUTO just runs the fight to completion — no skill picker needed.
 * These tests verify the auto-resolved battle produces a clean outcome without stalling.
 */

const hero: FighterInput = { name: "Hero", img: "", hp: 1000, atk: 200, def: 50, crit: 10, dodge: 5, level: 10, cls: "warrior", acc: 100 };
const weakFoe: FighterInput = { name: "Goblin", img: "", hp: 100, atk: 10, def: 5, crit: 0, dodge: 0, level: 5 };

describe("auto-resolved battle", () => {
  it("produces a victory against a weaker foe", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const s = initBattle(hero, weakFoe);
    runBattle(s);
    expect(s.over).toBe("won");
    expect(foeUnit(s).hp).toBe(0);
    expect(heroUnit(s).hp).toBeGreaterThan(0);
    vi.restoreAllMocks();
  });

  it("produces a defeat against an overwhelming foe", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const s = initBattle({ ...hero, hp: 10, atk: 1 }, { ...weakFoe, hp: 1e6, atk: 1e6 });
    runBattle(s);
    expect(s.over).toBe("lost");
    expect(heroUnit(s).hp).toBe(0);
    vi.restoreAllMocks();
  });

  it("never stalls: the fight always resolves within the step guard", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const s = initBattle(hero, { ...weakFoe, hp: 1e6, def: 0, atk: 1 });
    runBattle(s);
    expect(s.over).not.toBeNull();
    expect(s.round).toBeLessThan(500);
    vi.restoreAllMocks();
  });
});
