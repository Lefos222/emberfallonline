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

describe("tactical combat", () => {
  it.each(["warrior", "mage", "archer"] as const)("%s can enter combat with class kit", (cls) => {
    const s = initBattle(hero(cls), formation(foe()));
    expect(heroUnit(s).kit.length).toBeGreaterThanOrEqual(5);
    expect(livingFoes(s).length).toBe(3); // level 6 → 3-enemy formation
  });

  it("caps block at 25% and healing power at 50%", () => {
    const s = initBattle(hero("warrior"), [foe()]);
    expect(heroUnit(s).block).toBe(BLOCK_CAP);
    expect(heroUnit(s).heal).toBe(HEAL_CAP);
  });

  it("rejects invalid targets, unaffordable and cooling-down skills", () => {
    const s = initBattle(hero("warrior"), [foe({ hp: 1e9 })]);
    heroTurn(s);
    expect(playerAct(s, "strike", ["nope"])).toEqual({ ok: false, error: "Invalid target" });
    heroUnit(s).mana = 0;
    expect(playerAct(s, "guard", []).ok).toBe(false);
    heroUnit(s).mana = 100;
    expect(playerAct(s, "guard", []).ok).toBe(true);
    heroTurn(s);
    expect(playerAct(s, "guard", []).ok).toBe(false); // cooldown
  });

  it("does not let the hero act out of turn (no double execution)", () => {
    const s = initBattle({ ...hero("warrior"), dodge: 0 }, [foe({ hp: 1e9, dodge: 200 })]);
    heroTurn(s);
    expect(playerAct(s, "strike", ["F0"]).ok).toBe(true);
    if (current(s)?.side === "foe") expect(playerAct(s, "strike", ["F0"]).ok).toBe(false);
  });

  it("area skills hit every living enemy and battles end in victory", () => {
    const s = initBattle(hero("warrior"), [foe({ hp: 10, level: 1 }), foe({ hp: 10, level: 1 })].map((f) => f));
    heroTurn(s);
    heroUnit(s).mana = 100;
    const r = playerAct(s, "cleave", []);
    expect(r.ok).toBe(true);
    expect(s.over).toBe("won");
    expect(livingFoes(s).length).toBe(0);
  });

  it("dead enemies are not valid targets", () => {
    const s = initBattle(hero("archer"), [foe({ hp: 1, level: 1 }), foe({ hp: 1e9, level: 1 })]);
    heroTurn(s);
    playerAct(s, "shot", ["F0"]);
    const kit = heroUnit(s).kit.find((k) => k.id === "shot")!;
    expect(validTargets(s, heroUnit(s), kit)).toEqual(["F1"]);
  });

  it("bosses telegraph a heavy attack and fight with adds", () => {
    const f = formation(foe({ boss: true, level: 10 }));
    expect(f.filter((x) => x.boss).length).toBe(1);
    expect(f.length).toBe(3);
    const s = initBattle({ ...hero("mage"), hp: 1e9 }, [foe({ boss: true, hp: 1e9, level: 10 })]);
    const texts: string[] = [];
    for (let i = 0; i < 12 && !s.over; i++) {
      const u = current(s)!;
      const r = u.side === "foe" ? enemyAct(s) : playerAct(s, "bolt", ["F0"]);
      if (r.ok) texts.push(...r.events.map((e) => e.text));
    }
    expect(texts.some((t) => /CATACLYSM/.test(t))).toBe(true);
  });

  it("defeat ends the battle", () => {
    const s = initBattle({ ...hero("mage"), hp: 1, block: 0 }, [foe({ atk: 1e6, acc: 1000, level: 1 })]);
    for (let i = 0; i < 10 && !s.over; i++) { const u = current(s)!; if (u.side === "foe") enemyAct(s); else playerAct(s, "bolt", ["F0"]); }
    expect(s.over).toBe("lost");
  });

  it("knight, archer and mage kits contain their signature tactical skills", () => {
    expect(buildKit("warrior").map((k) => k.id)).toEqual(expect.arrayContaining(["guard", "taunt", "cleave", "counter"]));
    expect(buildKit("archer").map((k) => k.id)).toEqual(expect.arrayContaining(["mark", "evade", "volley", "snipe"]));
    expect(buildKit("mage").map((k) => k.id)).toEqual(expect.arrayContaining(["firestorm", "barrier", "restore", "nova"]));
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
