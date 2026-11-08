import { describe, expect, it } from "vitest";
import { buildKit, current, enemyAct, formation, initBattle, playerAct, validTargets, heroUnit, livingFoes, BLOCK_CAP, HEAL_CAP, type FighterInput } from "@/game/combat";
import { addLoot, claimOverflow } from "@/game/logic";
import { invCap, makeItem, newHero, bagRowCost } from "@/game/data";

const hero = (cls: "warrior" | "mage" | "archer"): FighterInput => ({ name: "H", img: "", hp: 1000, atk: 200, def: 50, crit: 0, dodge: 0, level: 10, cls, acc: 100, block: 90, heal: 90 });
const foe = (o: Partial<FighterInput> = {}): FighterInput => ({ name: "Goblin Brute", img: "", hp: 500, atk: 20, def: 10, crit: 0, dodge: 0, level: 6, ...o });

function heroTurn(s: ReturnType<typeof initBattle>) {
  let n = 0;
  while (current(s)?.side === "foe" && n++ < 20) enemyAct(s);
}

describe("auto-battle combat", () => {
  it.each(["warrior", "mage", "archer"] as const)("%s enters combat with a basic attack only", (cls) => {
    const s = initBattle(hero(cls), formation(foe()));
    expect(heroUnit(s).kit).toHaveLength(1);
    expect(heroUnit(s).kit[0].id).toBe("hit");
    expect(livingFoes(s).length).toBe(3); // level 6 → 3-enemy formation
  });

  it("caps block at 25% and healing power at 50%", () => {
    const s = initBattle(hero("warrior"), [foe()]);
    expect(heroUnit(s).block).toBe(BLOCK_CAP);
    expect(heroUnit(s).heal).toBe(HEAL_CAP);
  });

  it("auto-attacks the first living foe on the hero's turn", () => {
    const s = initBattle(hero("warrior"), [foe({ hp: 1e9 })]);
    heroTurn(s);
    const r = playerAct(s, "hit", []);
    expect(r.ok).toBe(true);
    expect(s.units.find((u) => u.side === "foe")!.hp).toBeLessThan(1e9);
  });

  it("does not let the hero act out of turn (no double execution)", () => {
    const s = initBattle({ ...hero("warrior"), dodge: 0 }, [foe({ hp: 1e9, dodge: 200 })]);
    heroTurn(s);
    expect(playerAct(s, "hit", []).ok).toBe(true);
    if (current(s)?.side === "foe") expect(playerAct(s, "hit", []).ok).toBe(false);
  });

  it("battles end in victory when all foes are defeated", () => {
    const s = initBattle(hero("warrior"), [foe({ hp: 10, level: 1 }), foe({ hp: 10, level: 1 })]);
    for (let i = 0; i < 20 && !s.over; i++) {
      const u = current(s)!;
      if (u.side === "foe") enemyAct(s); else playerAct(s, "hit", []);
    }
    expect(s.over).toBe("won");
    expect(livingFoes(s).length).toBe(0);
  });

  it("dead enemies are not valid targets", () => {
    const s = initBattle(hero("archer"), [foe({ hp: 1, level: 1 }), foe({ hp: 1e9, level: 1 })]);
    heroTurn(s);
    playerAct(s, "hit", []);
    const kit = heroUnit(s).kit[0];
    expect(validTargets(s, heroUnit(s), kit)).toEqual(["F1"]);
  });

  it("bosses fight with adds", () => {
    const f = formation(foe({ boss: true, level: 10 }));
    expect(f.filter((x) => x.boss).length).toBe(1);
    expect(f.length).toBe(3);
  });

  it("defeat ends the battle", () => {
    const s = initBattle({ ...hero("mage"), hp: 1, block: 0 }, [foe({ atk: 1e6, acc: 1000, level: 1 })]);
    for (let i = 0; i < 10 && !s.over; i++) { const u = current(s)!; if (u.side === "foe") enemyAct(s); else playerAct(s, "hit", []); }
    expect(s.over).toBe("lost");
  });

  it("every class kit is just a basic attack", () => {
    expect(buildKit("warrior")).toHaveLength(1);
    expect(buildKit("archer")).toHaveLength(1);
    expect(buildKit("mage")).toHaveLength(1);
    expect(buildKit("warrior")[0].id).toBe("hit");
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
