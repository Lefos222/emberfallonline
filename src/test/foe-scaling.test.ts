import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_LEVEL,
  foeRating,
  heroStats,
  makeItem,
  newHero,
  stageFoe,
  type Hero,
  type HeroClass,
  type Slot,
} from "@/game/data";
import { prepareFoe } from "@/game/foe-scaling";
import { forecastFight } from "@/game/battle-advice";
import { initBattle, runBattle } from "@/game/combat";

const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

/** The same geared benchmark hero the balance suite uses, so these numbers stay comparable. */
function heroAt(level: number, cls: HeroClass = "warrior"): Hero {
  const h = newHero("Scaled", cls);
  h.level = Math.min(MAX_LEVEL, level);
  h.attrs = {
    str: Math.round(level * 0.4),
    int: Math.round(level * 0.2),
    agi: Math.round(level * 0.2),
    vit: Math.round(level * 0.5),
  };
  const rarity = level < 10 ? 1 : level < 25 ? 2 : level < 45 ? 3 : level < 65 ? 4 : 5;
  h.equipment = {};
  for (const slot of SLOTS) {
    const it = makeItem(cls, level, rarity, slot);
    it.enh = Math.min(30, Math.round(level / 5));
    h.equipment[slot] = it;
  }
  return h;
}

function seeded(seed: number) {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

/** Auto-battle through the passive turn-based engine. */
function autoBattle(h: Hero, foe: ReturnType<typeof stageFoe>) {
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
      cls: h.cls,
      critDmg: stats.critDmg,
      pen: stats.pen,
      acc: stats.acc,
      block: stats.block,
      heal: stats.heal,
    },
    foe,
  );
  runBattle(s);
  return { over: s.over, turns: s.round };
}

describe("monsters do not scale", () => {
  it("keeps every fight's own numbers, whatever the hero has become", () => {
    for (const level of [1, 10, 30, 60, 80]) {
      const foe = stageFoe(level);
      const fresh = prepareFoe(foe);
      const trained = prepareFoe(stageFoe(level));
      expect(fresh.hp).toBe(foe.hp);
      expect(fresh.atk).toBe(foe.atk);
      expect(fresh.def).toBe(foe.def);
      expect(fresh.level).toBe(foe.level);
      expect(trained.hp).toBe(foe.hp);
      expect(trained.level).toBe(foe.level);
    }
  });

  it("grows only with the ladder: deeper stages field stronger monsters", () => {
    const ladder = [1, 20, 45, 80].map((stage) => prepareFoe(stageFoe(stage)));
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].hp).toBeGreaterThan(ladder[i - 1].hp);
      expect(ladder[i].atk).toBeGreaterThan(ladder[i - 1].atk);
    }
  });

  it("prepares a previewed foe only once, so the gate shows the fight the player gets", () => {
    const once = prepareFoe(stageFoe(30));
    const twice = prepareFoe(once);
    expect(twice.hp).toBe(once.hp);
    expect(twice.atk).toBe(once.atk);
    expect(twice.def).toBe(once.def);
    expect(twice.level).toBe(once.level);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the campaign winnable for the hero who keeps up with it", () => {
    vi.spyOn(Math, "random").mockImplementation(seeded(7));
    for (const cls of ["warrior", "mage", "archer"] as const) {
      for (const stage of [1, 10, 20, 40, 60]) {
        const h = heroAt(stage, cls);
        const r = autoBattle(h, prepareFoe(stageFoe(stage)));
        expect(r.over, `${cls} should still win stage ${stage}`).toBe("won");
        expect(r.turns, `${cls} should not stall on stage ${stage}`).toBeLessThan(60);
      }
    }
  });
});

describe("the gate's rating forecast", () => {
  it("reads a level-matched fight as winnable and an over-levelled one as comfortable", () => {
    const hero = heroAt(40);
    const stats = heroStats(hero);
    const matched = forecastFight(stats, prepareFoe(stageFoe(40)));
    const replay = forecastFight(stats, prepareFoe(stageFoe(5)));
    expect(matched.margin).toBeGreaterThan(1);
    expect(replay.margin).toBeGreaterThan(matched.margin);
  });

  it("warns a hero who walks into a fight far above them", () => {
    const hero = heroAt(20);
    const stats = heroStats(hero);
    const deadly = forecastFight(stats, prepareFoe(stageFoe(45)));
    expect(deadly.verdict).toBe("Deadly");
    // The recommendation is the rating that would make the same fight fair — above where the hero stands.
    expect(deadly.recommended).toBeGreaterThan(stats.power);
  });

  it("recommends a rating at or below the hero's own for a fight they comfortably win", () => {
    const hero = heroAt(60);
    const stats = heroStats(hero);
    const easy = forecastFight(stats, prepareFoe(stageFoe(20)));
    expect(easy.recommended).toBeLessThan(stats.power);
    expect(foeRating(prepareFoe(stageFoe(20)))).toBeLessThan(stats.power);
  });
});
