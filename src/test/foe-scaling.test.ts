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
import { FOE_ATTR_CAP, FOE_LEVEL_CAP, FOE_LEVEL_SCALE, foeScale, prepareFoe } from "@/game/foe-scaling";
import { forecastFight } from "@/game/battle-advice";
import { current, enemyAct, formation, heroUnit, initBattle, playerAct, skillReady } from "@/game/combat";

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

/** Auto-battle through the real battle engine, exactly like the balance suite. */
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
    formation(foe),
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

describe("monsters keep pace with the hero", () => {
  it("lifts the opening stages hardest, so a level-1 hero no longer ends a fight in one tap", () => {
    const fresh = newHero("Fresh", "warrior");
    const scaled = prepareFoe(stageFoe(1), fresh);
    expect(scaled.hp).toBeGreaterThan(stageFoe(1).hp);
    // The same lift is gentler where the campaign is already hard.
    const late = prepareFoe(stageFoe(60), heroAt(60));
    expect(late.hp).toBeLessThan(stageFoe(60).hp * 1.4);
  });

  it("grows with the attributes a hero trains", () => {
    const trained = heroAt(40);
    const untrained = newHero("Untrained", "warrior");
    untrained.level = trained.level;
    expect(foeScale(stageFoe(40).level, trained)).toBeGreaterThan(foeScale(stageFoe(40).level, untrained));
    const base = prepareFoe(stageFoe(40), untrained);
    const buffed = prepareFoe(stageFoe(40), trained);
    expect(buffed.hp).toBeGreaterThan(base.hp);
    expect(buffed.atk).toBeGreaterThan(base.atk);
  });

  it("grows with the hero's level above a fight, up to its cap", () => {
    const small = heroAt(20);
    const huge = heroAt(MAX_LEVEL);
    expect(foeScale(20, huge)).toBeGreaterThan(foeScale(20, small));
    // The level part of the scale saturates instead of growing forever.
    const cap = 1 + FOE_LEVEL_CAP * FOE_LEVEL_SCALE;
    expect(foeScale(20, huge) / foeScale(20, { ...huge, level: 20 })).toBeLessThanOrEqual(cap + 0.0001);
    // Attribute scaling saturates too.
    expect(foeScale(20, { ...huge, attrs: { str: 100000, int: 0, agi: 0, vit: 0 } })).toBeLessThanOrEqual(
      foeScale(20, huge) * (1 + FOE_ATTR_CAP),
    );
  });

  it("scales a previewed foe only once, so the gate shows the fight the player gets", () => {
    const hero = heroAt(45);
    const once = prepareFoe(stageFoe(30), hero);
    const twice = prepareFoe(once, hero);
    expect(twice.hp).toBe(once.hp);
    expect(twice.atk).toBe(once.atk);
    expect(twice.def).toBe(once.def);
    expect(twice.level).toBe(once.level);
  });

  it("never shows a hero a weaker monster than the fight's own numbers", () => {
    for (const level of [1, 10, 30, 60, 80]) {
      const foe = stageFoe(level);
      const scaled = prepareFoe(foe, newHero("Fresh", "warrior"));
      expect(scaled.hp).toBeGreaterThanOrEqual(foe.hp);
      expect(scaled.atk).toBeGreaterThanOrEqual(foe.atk);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the campaign winnable for the hero who keeps up with it", () => {
    vi.spyOn(Math, "random").mockImplementation(seeded(7));
    for (const cls of ["warrior", "mage", "archer"] as const) {
      for (const stage of [1, 10, 20, 40, 60]) {
        const h = heroAt(stage, cls);
        const r = autoBattle(h, prepareFoe(stageFoe(stage), h));
        expect(r.over, `${cls} should still win stage ${stage}`).toBe("won");
        expect(r.turns, `${cls} should not stall on stage ${stage}`).toBeLessThan(30);
      }
    }
  });
});

describe("the gate's rating forecast", () => {
  it("reads a level-matched fight as winnable and an over-levelled one as comfortable", () => {
    const hero = heroAt(40);
    const stats = heroStats(hero);
    const matched = forecastFight(stats, prepareFoe(stageFoe(40), hero));
    const replay = forecastFight(stats, prepareFoe(stageFoe(5), hero));
    expect(matched.margin).toBeGreaterThan(1);
    expect(replay.margin).toBeGreaterThan(matched.margin);
  });

  it("warns a hero who walks into a fight far above them", () => {
    const hero = heroAt(20);
    const stats = heroStats(hero);
    const deadly = forecastFight(stats, prepareFoe(stageFoe(45), hero));
    expect(deadly.verdict).toBe("Deadly");
    // The recommendation is the rating that would make the same fight fair — above where the hero stands.
    expect(deadly.recommended).toBeGreaterThan(stats.power);
  });

  it("recommends a rating at or below the hero's own for a fight they comfortably win", () => {
    const hero = heroAt(60);
    const stats = heroStats(hero);
    const easy = forecastFight(stats, prepareFoe(stageFoe(20), hero));
    expect(easy.recommended).toBeLessThan(stats.power);
    expect(foeRating(prepareFoe(stageFoe(20), hero))).toBeLessThan(stats.power);
  });
});
