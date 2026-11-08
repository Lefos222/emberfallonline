import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MITIGATION_FLOOR,
  calcDamage,
  catchUpXpFactor,
  enhanceCost,
  heroStats,
  makeItem,
  riftFactor,
  EASY_FIGHTS,
  GRIND_FIGHTS,
  MAX_LEVEL,
  fightsToLevel,
  fightsToNextLevel,
  foeToughness,
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
function heroAt(stage: number, cls: HeroClass, enh = 0): Hero {
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
  for (const slot of SLOTS) {
    const it = makeItem(cls, stage, rarity, slot);
    it.enh = enh;
    h.equipment[slot] = it;
  }
  return h;
}

/** Auto-battle, using the same skill choice the battle screen's AUTO mode makes. */
function autoBattle(stage: number, cls: HeroClass, enh = 0) {
  const h = heroAt(stage, cls, enh);
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

describe("ten fights a level, then a smooth climb", () => {
  it("costs exactly ten fights a level up to level 19", () => {
    expect(EASY_FIGHTS).toBe(10);
    expect(xpToNext({ level: 0, paragon: 0 })).toBe(10 * stageRewards(1).xp);
    for (const lv of [1, 5, 10, 17, 19]) {
      expect(fightsToLevel(lv)).toBe(EASY_FIGHTS);
      expect(xpToNext({ level: lv, paragon: 0 })).toBe(EASY_FIGHTS * stageRewards(lv).xp);
    }
  });
  it("climbs gently from level 20 instead of jumping a wall", () => {
    expect(fightsToLevel(20)).toBe(EASY_FIGHTS + GRIND_FIGHTS);
    for (let lv = 20; lv < MAX_LEVEL; lv++) {
      // Every level asks for more than the one before it, and none of them doubles the last.
      expect(fightsToLevel(lv + 1)).toBeGreaterThan(fightsToLevel(lv));
      expect(fightsToLevel(lv + 1)).toBeLessThanOrEqual(fightsToLevel(lv) * 1.3);
      expect(xpToNext({ level: lv, paragon: 0 })).toBe(fightsToLevel(lv) * stageRewards(lv).xp);
    }
  });
  it("keeps every level a session's work, with no multi-million bill", () => {
    // Level 30→31 used to demand 2.8 million XP; it is now dozens of fights.
    expect(fightsToLevel(30)).toBe(46);
    expect(fightsToLevel(80)).toBe(141);
    expect(xpToNext({ level: 30, paragon: 0 })).toBeLessThan(300_000);
    for (const lv of [25, 30, 40, 50, 60, 80, 100]) expect(fightsToLevel(lv)).toBeLessThan(200);
  });
  it("still takes thousands of wins to reach level 80 — weeks, not a weekend", () => {
    let total = 0;
    for (let lv = 1; lv < 80; lv++) total += fightsToLevel(lv);
    expect(total).toBeGreaterThan(4_000);
    expect(total).toBeLessThan(7_000);
  });
  it("counts the fights left in the current level from saved XP", () => {
    const hero = newHero("Balanced", "warrior");
    expect(fightsToNextLevel({ level: hero.level, paragon: 0, xp: 0 })).toBe(EASY_FIGHTS);
    expect(fightsToNextLevel({ level: hero.level, paragon: 0, xp: xpToNext(hero) - 1 })).toBe(1);
    expect(fightsToNextLevel({ level: hero.level, paragon: 0, xp: xpToNext(hero) })).toBe(1);
  });
  it("pays catch-up XP when a hero fights above their level, capped at double", () => {
    expect(catchUpXpFactor(20, 20)).toBe(1);
    expect(catchUpXpFactor(10, 20)).toBe(2);
    expect(catchUpXpFactor(5, 80)).toBe(2);
    expect(catchUpXpFactor(17, 20)).toBeCloseTo(1.3);
  });
  it("gold rewards are nerfed versus the old formula", () => {
    for (const st of [10, 40, 80]) expect(stageRewards(st).gold).toBeLessThan((12 + 10 * Math.pow(st, 1.85)) * 0.7);
  });
  it("monsters get tougher with stage", () => {
    expect(stageFoe(79).hp).toBeGreaterThan(Math.round((150 + 79 * 150) * riftFactor(79) * 1.4));
  });
  it("steepens the enemy curve after level 30 and keeps climbing past it", () => {
    // The late multiplier only starts past HARD_STAGE, then compounds every stage.
    expect(foeToughness(80)).toBeGreaterThan(3);
    expect(foeToughness(140)).toBeGreaterThan(5);
    for (const stage of [40, 60, 80, 120]) {
      const steady = 1 + (stage - 5) * 0.006;
      expect(foeToughness(stage), `stage ${stage}`).toBeGreaterThan(steady * 1.1);
    }
  });
});

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
      for (const stage of [1, 5, 10, 20, 30, 40, 50, 60, 70]) {
        const r = autoBattle(stage, cls);
        expect(r.over, `${cls} should win stage ${stage}`).toBe("won");
        expect(r.turns, `${cls} should not stall on stage ${stage}`).toBeLessThan(30);
      }
    },
  );

  it.each(["warrior", "mage", "archer"] as const)(
    "%s scales past the late-game wall with enhanced gear",
    (cls) => {
      // Past stage 30 foes gain extra toughness; the endgame wall at stage 80 is answered by
      // enhancing current gear (+8), which is the progression lever a stuck hero always has.
      const r = autoBattle(80, cls, 8);
      expect(r.over, `${cls} should win stage 80 with enhanced gear`).toBe("won");
      expect(r.turns, `${cls} should not stall on stage 80`).toBeLessThan(30);
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
    // One cleared stage is one fight: the level bill divided by a stage's XP is the fight count.
    for (const stage of [5, 10, 17]) {
      expect(xpToNext({ level: stage, paragon: 0 }) / stageRewards(stage).xp).toBe(EASY_FIGHTS);
    }
    // From level 20 that count climbs by fifty-two every level.
    for (const stage of [40, 50, 60, 80]) {
      expect(xpToNext({ level: stage, paragon: 0 }) / stageRewards(stage).xp).toBe(fightsToLevel(stage));
    }
    expect(stageRewards(51).xp).toBeGreaterThan(stageRewards(50).xp);
    expect(stageRewards(51).gold).toBeGreaterThan(stageRewards(50).gold);
  });

  it("keeps gold valuable: a stage pays a fraction of one enhancement", () => {
    // Through the bulk of the game one enhancement of current gear still costs cleared stages.
    for (const lv of [10, 20, 30, 40]) {
      const piece = makeItem("warrior", lv, 2, "weapon");
      piece.enh = 5;
      expect(stageRewards(lv).gold).toBeLessThan(enhanceCost(piece, lv));
    }
    // Past level 21 rewards grow 8% a level, but a deep stage still never pays four enhancements.
    for (const lv of [60, 70, 80]) {
      const piece = makeItem("warrior", lv, 2, "weapon");
      piece.enh = 5;
      expect(stageRewards(lv).gold).toBeLessThan(enhanceCost(piece, lv) * 4);
    }
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
