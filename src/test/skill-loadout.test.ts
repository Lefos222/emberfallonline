import { describe, it, expect } from "vitest";
import { buildKit, initBattle, heroUnit } from "@/game/combat";

describe("auto-battle kit", () => {
  it("every fighter has exactly one move: the basic attack", () => {
    expect(buildKit("warrior")).toHaveLength(1);
    expect(buildKit("archer")).toHaveLength(1);
    expect(buildKit("mage")).toHaveLength(1);
  });

  it("the basic attack enters the actual battle state", () => {
    const fighter = { name: "Knight", img: "", hp: 100, atk: 10, def: 5, crit: 0, dodge: 0, level: 2, cls: "warrior" as const };
    const state = initBattle(fighter, [{ ...fighter, name: "Enemy", cls: undefined }]);
    expect(heroUnit(state).kit).toHaveLength(1);
    expect(heroUnit(state).kit[0].id).toBe("hit");
  });
});
