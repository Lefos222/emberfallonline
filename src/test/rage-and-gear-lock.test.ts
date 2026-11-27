import { describe, expect, it } from "vitest";
import { initBattle, step, RAGE_MAX, type FighterInput } from "@/game/combat";
import { makeItem, newHero, normalizeHero } from "@/game/data";

const f = (name: string): FighterInput => ({ name, img: "", hp: 1e9, atk: 100, def: 0, crit: 0, dodge: 0, level: 1 });

describe("rage", () => {
  it("builds with every exchange and fires one Rage Strike when full, then empties", () => {
    const s = initBattle(f("A"), f("B"));
    let strikes = 0;
    for (let i = 0; i < 40; i++) {
      const before = s.units.map((u) => u.rage);
      const r = step(s);
      if (r.ok && before[s.units.indexOf(r.actor)] >= RAGE_MAX) { strikes++; expect(r.actor.rage).toBe(0); }
      for (const u of s.units) expect(u.rage).toBeLessThanOrEqual(RAGE_MAX);
    }
    expect(strikes).toBeGreaterThan(0);
  });
});

describe("gear level lock", () => {
  it("takes worn gear above the hero's level off and back into the bag", () => {
    const h = newHero("Lock", "warrior");
    h.level = 1;
    const big = makeItem("warrior", 70, 0, "weapon");
    h.equipment.weapon = big;
    normalizeHero(h);
    expect(h.equipment.weapon).toBeUndefined();
    expect(h.inventory.some((i) => i.id === big.id)).toBe(true);
  });
});
