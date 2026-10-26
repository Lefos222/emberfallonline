import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MITIGATION_FLOOR,
  calcDamage,
  heroStats,
  makeItem,
  newHero,
  stageFoe,
  stageRewards,
  xpToNext,
  type Hero,
  type HeroClass,
  type Slot,
} from "@/game/data";
import {
  current,
  drinkPotion,
  enemyAct,
  formation,
  heroUnit,
  initBattle,
  playerAct,
  skillReady,
} from "@/game/combat";
import { DRILLS, drillFx, trainDrill } from "@/game/drills";

const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

/** A hero who trained along the way and keeps gear roughly current for the stage they face. */
function heroAt(stage: number, cls: HeroClass): Hero {
  const h = newHero("Balanced", cls);
  h.level = Math.min(80, stage);
  h.attrs = {
    str: Math.round(stage * 0.4),
    int: Math.round(stage * 0.2),
    agi: Math.round(stage * 0.2),
    vit: Math.round(stage * 0.5),
  };
  const rarity = stage < 10 ? 1 : stage < 25 ? 2 : stage < 45 ? 3 : stage < 65 ? 4 : 5;
  h.equipment = {};
  for (const slot of SLOTS) h.equipment[slot] = makeItem(cls, stage, rarity, slot);
  return h;
}

/** Auto-battle, using the same skill choice the battle screen's AUTO mode makes. */
function autoBattle(stage: number, cls: HeroClass) {
  const h = heroAt(stage, cls);
  const stats = heroStats(h);
  const s = initBattle(
    {
      name: h.name,
      img: "",
      hp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      crit: stats.crit,
      dodge: stats.dodge,
      level: h.level,
      cls,
      critDmg: stats.critDmg,
      pen: stats.pen,
      acc: stats.acc,
      block: stats.block,
      heal: stats.heal,
    },
    formation(stageFoe(stage)),
  );
  let turns = 0;
  while (!s.over && turns < 80) {
    const actor = current(s);
    if (!actor) break;
    if (actor.side === "foe") {
      enemyAct(s);
      continue;
    }
    const hero = heroUnit(s);
    if (s.potions > 0 && hero.hp < hero.maxHp * 0.35) {
      drinkPotion(s);
      turns++;
      continue;
    }
    const foes = s.units.filter((u) => u.side === "foe" && u.hp > 0).sort((a, b) => a.hp - b.hp);
    if (foes.length === 0) break;
    const ready =
      [...hero.kit]
        .filter((k) => !skillReady(hero, k) && k.mult > 0)
        .sort(
          (a, b) =>
            b.mult * (b.hits ?? 1) * (b.target === "all" ? foes.length : 1) -
            a.mult * (a.hits ?? 1) * (a.target === "all" ? foes.length : 1),
        )[0] ?? hero.kit[0];
    playerAct(
      s,
      ready.id,
      foes.slice(0, ready.maxTargets ?? 1).map((f) => f.id),
    );
    turns++;
  }
  return { over: s.over, turns };
}

function seeded(seed: number) {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

describe("campaign balance", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockImplementation(seeded(42));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["warrior", "mage", "archer"] as const)(
    "%s clears the stages a level-matched hero faces",
    (cls) => {
      for (const stage of [1, 5, 10, 20, 30, 40, 50, 60, 70, 80]) {
        const r = autoBattle(stage, cls);
        expect(r.over, `${cls} should win stage ${stage}`).toBe("won");
        expect(r.turns, `${cls} should not stall on stage ${stage}`).toBeLessThan(30);
      }
    },
  );

  it("keeps enemy health and damage rising without an exponential wall", () => {
    // Compare ordinary stages: every tenth stage is a boss and is meant to spike.
    for (const stage of [8, 23, 38, 48]) {
      expect(stageFoe(stage + 1).hp).toBeGreaterThan(stageFoe(stage).hp);
      expect(stageFoe(stage + 1).atk).toBeGreaterThan(stageFoe(stage).atk);
      expect(stageFoe(stage + 1).hp / stageFoe(stage).hp).toBeLessThan(2);
      expect(stageFoe(stage + 1).atk / stageFoe(stage).atk).toBeLessThan(2);
    }
  });

  it("pays rewards on the same curve the next level costs", () => {
    for (const stage of [5, 20, 40, 60, 80]) {
      const rw = stageRewards(stage);
      const need = xpToNext({ level: stage, paragon: 0 });
      expect(rw.xp).toBeGreaterThan(need * 0.15);
      expect(rw.xp).toBeLessThan(need);
    }
    expect(stageRewards(51).xp).toBeGreaterThan(stageRewards(50).xp);
    expect(stageRewards(51).gold).toBeGreaterThan(stageRewards(50).gold);
  });

  it("armor can never reduce a hit below the mitigation floor", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const raw = 1000 * (0.9 + 0.99 * 0.2);
    expect(calcDamage(1000, 100000, 1, 0, 0, false, 200, 0, 0).dmg).toBe(
      Math.round(raw * MITIGATION_FLOOR),
    );
    expect(calcDamage(1000, 0, 1, 0, 0, false, 200, 0, 0).dmg).toBe(Math.round(raw));
  });
});

describe("health training options", () => {
  it("offers several health drills, one from the very first barracks level", () => {
    const health = DRILLS.filter((d) => d.stat === "hpPct");
    expect(health.length).toBeGreaterThanOrEqual(2);
    expect(health.some((d) => d.barracks === 1)).toBe(true);
    expect(health.reduce((a, d) => a + d.per * d.max, 0)).toBeGreaterThanOrEqual(50);
  });

  it("a health drill rank raises the hero's real max HP", () => {
    const h = newHero("Driller", "warrior");
    h.gold = 1_000_000;
    const before = heroStats(h).hp;
    expect(trainDrill(h, "vitality")).toBeNull();
    expect(drillFx(h).hpPct).toBeGreaterThan(0);
    expect(heroStats(h).hp).toBeGreaterThan(before);
  });
});
