import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MITIGATION_FLOOR,
  calcDamage,
  campaignFightRewards,
  enhanceCost,
  heroStats,
  makeItem,
  riftFactor,
  EASY_FIGHTS,
  GRIND_FIGHTS,
  LEVEL_COST_MULTIPLIER,
  baseFightsToLevel,
  MAX_LEVEL,
  fightsToLevel,
  fightsToNextLevel,
  foeToughness,
  newHero,
  stageFoe,
  stageRewards,
  xpToNext,
  xpPerFight,
  type Hero,
  type HeroClass,
  type Slot,
} from "@/game/data";
import { initBattle, runBattle } from "@/game/combat";
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

/** Auto-battle through the passive turn-based engine: run the fight to completion. */
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
    stageFoe(stage),
  );
  runBattle(s);
  return { over: s.over, turns: s.round };
}

function seeded(seed: number) {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

describe("eleven fights a level, then a smooth climb", () => {
  it("makes every level 10% harder than the old curve, and 3% more per level past 30", () => {
    expect(LEVEL_COST_MULTIPLIER).toBe(1.1);
    for (const lv of [1, 10, 19, 20, 30])
      expect(fightsToLevel(lv)).toBe(Math.round(baseFightsToLevel(lv) * 1.1));
    for (const lv of [40, 60, 80, 120])
      expect(fightsToLevel(lv)).toBe(Math.round(baseFightsToLevel(lv) * 1.1 * (1 + (lv - 30) * 0.03)));
  });
  it("costs exactly eleven fights a level up to level 19", () => {
    expect(EASY_FIGHTS).toBe(10);
    expect(xpToNext({ level: 0, paragon: 0 })).toBe(11 * stageRewards(1).xp);
    for (const lv of [1, 5, 10, 17, 19]) {
      expect(fightsToLevel(lv)).toBe(11);
      expect(xpToNext({ level: lv, paragon: 0 })).toBe(11 * stageRewards(lv).xp);
    }
  });
  it("climbs gently from level 20 instead of jumping a wall", () => {
    expect(fightsToLevel(20)).toBe(Math.round((EASY_FIGHTS + GRIND_FIGHTS) * 1.1));
    for (let lv = 20; lv < MAX_LEVEL; lv++) {
      // Every level asks for more than the one before it, and none of them doubles the last.
      expect(fightsToLevel(lv + 1)).toBeGreaterThan(fightsToLevel(lv));
      expect(fightsToLevel(lv + 1)).toBeLessThanOrEqual(fightsToLevel(lv) * 1.3);
      expect(xpToNext({ level: lv, paragon: 0 })).toBe(fightsToLevel(lv) * xpPerFight(lv));
    }
  });
  it("keeps every level a session's work, with no multi-million bill", () => {
    // Level 30→31 used to demand 2.8 million XP; it is now dozens of fights (46, +10% = 51).
    expect(fightsToLevel(30)).toBe(51);
    // Past level 40 the curve steepens a touch (69 → 76 and 149 → 164 with the +10%).
    expect(fightsToLevel(40)).toBe(99);
    expect(fightsToLevel(80)).toBe(410);
    expect(xpToNext({ level: 30, paragon: 0 })).toBeLessThan(300_000);
    for (const lv of [25, 30, 40, 50, 60, 80, 89]) expect(fightsToLevel(lv)).toBeLessThan(520);
  });
  it("adds a little more work to every level past 40, without ever walling the climb", () => {
    // Level 40 itself keeps the old bill; past it each level asks for a hair more.
    expect(baseFightsToLevel(40)).toBe(EASY_FIGHTS + Math.round(GRIND_FIGHTS * Math.pow(21, 0.75)));
    const ratio = (lv: number) => baseFightsToLevel(lv) / (EASY_FIGHTS + Math.round(GRIND_FIGHTS * Math.pow(lv - 20 + 1, 0.75)));
    expect(ratio(41)).toBeGreaterThanOrEqual(1);
    for (const lv of [45, 50, 60, 80, 100, 120, 140]) {
      expect(ratio(lv)).toBeGreaterThan(1);
      expect(ratio(lv)).toBeLessThan(1.16);
    }
    // The steepening never makes one level more than a third longer than the last.
    for (let lv = 40; lv < MAX_LEVEL; lv++)
      expect(fightsToLevel(lv + 1)).toBeLessThanOrEqual(fightsToLevel(lv) * 1.08);
  });

  it("still takes thousands of wins to reach level 80 — weeks, not a weekend", () => {
    let total = 0;
    for (let lv = 1; lv < 80; lv++) total += fightsToLevel(lv);
    expect(total).toBeGreaterThan(9_000);
    expect(total).toBeLessThan(14_000);
  });
  it("counts the fights left in the current level from saved XP", () => {
    const hero = newHero("Balanced", "warrior");
    expect(fightsToNextLevel({ level: hero.level, paragon: 0, xp: 0 })).toBe(
      Math.ceil(xpToNext(hero) / stageRewards(1).xp),
    );
    expect(fightsToNextLevel({ level: hero.level, paragon: 0, xp: xpToNext(hero) - 1 })).toBe(1);
    expect(fightsToNextLevel({ level: hero.level, paragon: 0, xp: xpToNext(hero) })).toBe(1);
  });
  it("pays campaign XP from the hero's level, so a runaway stage cannot rush the level bar", () => {
    // A level 31 hero whose frontier has run ahead to stage 90 still earns one level-31 fight's XP.
    expect(campaignFightRewards(31, 90, 90).xp).toBe(xpPerFight(31));
    expect(campaignFightRewards(31, 31, 31).xp).toBe(xpPerFight(31));
    // A cleared stage is still a replay and pays its reduced share.
    expect(campaignFightRewards(31, 31, 90).xp).toBe(Math.round(xpPerFight(31) * 0.25));
    // A whole level is exactly that many fights — the HUD's count is the real one.
    expect(xpToNext({ level: 31, paragon: 0 })).toBe(fightsToLevel(31) * xpPerFight(31));
    expect(fightsToNextLevel({ level: 31, paragon: 0, xp: 0 })).toBe(fightsToLevel(31));
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
        expect(r.turns, `${cls} should not stall on stage ${stage}`).toBeLessThan(60);
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
      expect(r.turns, `${cls} should not stall on stage 80`).toBeLessThan(60);
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
      expect(xpToNext({ level: stage, paragon: 0 }) / xpPerFight(stage)).toBe(11);
    }
    // From level 20 the bill is exactly the level's fight count times its fight pay.
    for (const stage of [40, 50, 60, 80]) {
      expect(xpToNext({ level: stage, paragon: 0 })).toBe(fightsToLevel(stage) * xpPerFight(stage));
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

describe("every level costs exactly the fights it advertises", () => {
  it("prices each level in whole fights, with no flat padding and no late discount", () => {
    for (const lv of [1, 10, 19, 20, 30, 31, 40, 60, 80, 120]) {
      expect(xpToNext({ level: lv, paragon: 0 })).toBe(fightsToLevel(lv) * xpPerFight(lv));
      expect(fightsToNextLevel({ level: lv, paragon: 0, xp: 0 })).toBe(fightsToLevel(lv));
    }
  });
});
