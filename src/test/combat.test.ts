import { describe, expect, it } from "vitest";
import { initBattle, step, runBattle, current, heroUnit, foeUnit, unitRating, paceGateBattle, BLOCK_CAP, HEAL_CAP, type FighterInput } from "@/game/combat";
import { addLoot, claimOverflow } from "@/game/logic";
import { invCap, makeItem, newHero, bagRowCost } from "@/game/data";

const hero = (cls: "warrior" | "mage" | "archer"): FighterInput => ({ name: "H", img: "", hp: 1000, atk: 200, def: 50, crit: 0, dodge: 0, level: 10, cls, acc: 100, block: 90, heal: 90 });
const foe = (o: Partial<FighterInput> = {}): FighterInput => ({ name: "Goblin Brute", img: "", hp: 500, atk: 20, def: 10, crit: 0, dodge: 0, level: 6, ...o });

describe("turn-based combat", () => {
  it("creates a 1v1 duel with two fighters", () => {
    const s = initBattle(hero("warrior"), foe());
    expect(s.units).toHaveLength(2);
    expect(s.over).toBeNull();
    expect(heroUnit(s).hp).toBe(1000);
    expect(foeUnit(s).hp).toBe(500);
  });

  it("caps block at 25% and healing power at 50%", () => {
    const s = initBattle(hero("warrior"), foe());
    expect(heroUnit(s).block).toBe(BLOCK_CAP);
    expect(heroUnit(s).heal).toBe(HEAL_CAP);
  });

  it("alternates turns: each fighter strikes once per round", () => {
    const s = initBattle(hero("warrior"), foe({ hp: 1e9 }));
    const first = s.turn;
    step(s);
    expect(s.turn).toBe(first === 0 ? 1 : 0);
    step(s);
    expect(s.turn).toBe(first);
    expect(s.round).toBe(2);
  });

  it("deals damage on a hit and ends the battle at 0 hp", () => {
    const s = initBattle(hero("warrior"), foe({ hp: 10 }));
    runBattle(s);
    expect(s.over).toBe("won");
    expect(foeUnit(s).hp).toBe(0);
  });

  it("defeat ends the battle", () => {
    const s = initBattle({ ...hero("mage"), hp: 1, block: 0 }, foe({ atk: 1e6, acc: 1000, level: 1 }));
    runBattle(s);
    expect(s.over).toBe("lost");
  });

  it("does not let a dead fighter act", () => {
    const s = initBattle(hero("warrior"), foe({ hp: 10 }));
    runBattle(s);
    expect(current(s)).toBeNull();
  });

  it("unitRating scales with HP and attack", () => {
    const u = heroUnit(initBattle(hero("warrior"), foe()));
    expect(unitRating({ ...u, maxHp: u.maxHp * 2, atk: u.atk })).toBeGreaterThan(unitRating(u));
  });

  it("paceGateBattle caps the foe's health for a short gate fight", () => {
    const s = initBattle(hero("warrior"), foe({ hp: 1e9 }));
    paceGateBattle(s);
    expect(foeUnit(s).maxHp).toBeLessThan(1e9);
  });
});

describe("full bag", () => {
  it("never destroys loot: overflow is kept and claimable once", () => {
    const h = newHero("T", "warrior");
    while (h.inventory.length < invCap(h)) h.inventory.push(makeItem("warrior", 1, 0));
    const gold = h.gold;
    const it = makeItem("warrior", 1, 3, "weapon");
    expect(addLoot(h, it)).toBe(false);
    expect(h.gold).toBe(gold);
    expect(h.overflow?.[0].id).toBe(it.id);
    h.inventory.pop();
    expect(claimOverflow(h)).toBe(1);
    expect(claimOverflow(h)).toBe(0);
    expect(h.inventory.filter((x) => x.id === it.id).length).toBe(1);
  });

  it("bag expansion pricing unchanged: 5,000 doubling, +8 slots", () => {
    expect(bagRowCost({ bagRows: 0 })).toBe(5000);
    expect(bagRowCost({ bagRows: 2 })).toBe(20000);
    expect(invCap({ bagRows: 1 }) - invCap({ bagRows: 0 })).toBe(8);
  });
});
