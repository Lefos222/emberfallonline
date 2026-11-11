import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  MAX_LEVEL,
  heroStats,
  makeItem,
  newHero,
  xpToNext,
  type Hero,
  type Slot,
} from "@/game/data";
import { blockedKinds, impossibleRating, ratingCeiling } from "@/game/anticheat";

const SQL = fs.readFileSync(
  path.join(process.cwd(), "drizzle/migrations/0043_anti_cheat.sql"),
  "utf8",
);

/** The strongest build the game can put together at a level: top rarity, fully enhanced, trained. */
function strongHero(level: number): Hero {
  const slots: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];
  const h = newHero("Ceiling", "warrior");
  h.level = level;
  h.paragon = Math.round(level / 10);
  h.attrs = {
    str: level * 2,
    int: level,
    agi: level,
    vit: Math.round(level * 2.4),
  };
  h.equipment = {};
  for (const slot of slots) {
    const it = makeItem("warrior", level, 5, slot);
    it.enh = Math.min(30, Math.round(level / 5));
    h.equipment[slot] = it;
  }
  return h;
}

describe("the Battle Rating line the server draws", () => {
  it("rejects the reported exploit: 800,000 rating on a level-3 hero", () => {
    expect(impossibleRating(800_000, 3)).toBe(true);
    expect(ratingCeiling(3)).toBeLessThan(30_000);
  });

  it("leaves every real build far below the line", () => {
    for (const level of [1, 3, 10, 30, 60, 100, MAX_LEVEL]) {
      const hero = strongHero(level);
      const power = heroStats(hero).power;
      expect(
        power,
        `level ${level} is rated ${power}, line ${ratingCeiling(level, hero.paragon)}`,
      ).toBeLessThan(ratingCeiling(level, hero.paragon));
    }
  });

  it("still leaves room at the cap, where a geared hero sits near half a million", () => {
    expect(ratingCeiling(MAX_LEVEL)).toBeGreaterThan(600_000);
    expect(ratingCeiling(MAX_LEVEL)).toBeLessThanOrEqual(2_000_000);
  });

  it("rejects impossible and negative numbers, and keeps Ascension on the same line", () => {
    expect(impossibleRating(Number.NaN, 40)).toBe(true);
    expect(impossibleRating(Number.POSITIVE_INFINITY, 40)).toBe(true);
    expect(impossibleRating(-5, 40)).toBe(true);
    expect(impossibleRating(ratingCeiling(40, 5), 40, 5)).toBe(false);
    expect(ratingCeiling(40, 5)).toBeGreaterThan(ratingCeiling(40, 0));
  });

  it("uses the same numbers as the SQL guard, so the two cannot drift apart", () => {
    const ceiling = SQL.slice(SQL.indexOf("_hero_power_ceiling"));
    expect(ceiling).toContain("10000 + 147 * power(");
    expect(ceiling).toContain("1.87");
    expect(ceiling).toContain("0.03");
  });
});

describe("the XP bill the SQL guard charges for a level", () => {
  /** The SQL `_hero_xp_to_next` transcribed, to prove it matches the game's own curve. */
  const sqlXpToNext = (level: number) => {
    const lv = Math.max(1, Math.min(MAX_LEVEL, level));
    const fights = lv < 20 ? 10 : 10 + Math.round(6 * Math.pow(lv - 20 + 1, 0.75));
    const per = Math.round(
      22 *
        Math.pow(lv, 1.5) *
        Math.pow(1.012, Math.max(0, lv - 30)) *
        Math.pow(0.992, Math.max(0, lv - 30)),
    );
    return fights * per;
  };

  it("matches xpToNext for every level the game has", () => {
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      expect(sqlXpToNext(level), `level ${level}`).toBe(xpToNext({ level, paragon: 0 }));
    }
  });
});

describe("blocked values the warning names", () => {
  it("lists only the kinds the server actually refused", () => {
    expect(blockedKinds({ battle_rating: 800000, gold_violated: false })).toEqual([
      "battle_rating",
    ]);
    expect(blockedKinds({ gold: 1e9, level: 140, level_violated: true })).toEqual([
      "gold",
      "level",
    ]);
    expect(blockedKinds({ server_owned: { balance: 1 } })).toEqual(["server_owned"]);
    expect(blockedKinds({ gold_violated: true })).toEqual([]);
    expect(blockedKinds(null)).toEqual([]);
  });
});
