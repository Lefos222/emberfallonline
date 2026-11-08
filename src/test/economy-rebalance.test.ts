import { describe, expect, it } from "vitest";
import {
  ENHANCE_MAX,
  enhanceChance,
  enhanceCost,
  enhanceMaxed,
  heroStats,
  makeItem,
  newHero,
  rarityCap,
  rollRarity,
} from "@/game/data";
import { BOSS_CRYSTALS, CRYSTALS_PER_LEVEL, grant } from "@/game/logic";
import { barracksCost, barracksLevel, upgradeBarracks } from "@/game/barracks";
import { ADVANCED_DRILLS, advancedBlocker, advancedCost, advancedRank, drillAttrs, trainAdvanced } from "@/game/drills";

describe("gear enhancement climbs to +70", () => {
  it("caps enhancement at seventy", () => {
    expect(ENHANCE_MAX).toBe(70);
    const piece = makeItem("warrior", 40, 2, "weapon");
    expect(enhanceMaxed(piece)).toBe(false);
    piece.enh = ENHANCE_MAX;
    expect(enhanceMaxed(piece)).toBe(true);
  });

  it("charges more gold for each step and for each hero level", () => {
    const piece = makeItem("warrior", 40, 2, "weapon");
    const steps = [0, 5, 10, 20, 29].map((e) => { piece.enh = e; return enhanceCost(piece, 40); });
    for (let i = 1; i < steps.length; i++) expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    piece.enh = 10;
    expect(enhanceCost(piece, 60)).toBeGreaterThan(enhanceCost(piece, 20));
  });

  it("keeps a real chance of success at every step", () => {
    const piece = makeItem("warrior", 40, 2, "weapon");
    for (const e of [0, 10, 20, 29]) { piece.enh = e; expect(enhanceChance(piece)).toBeGreaterThanOrEqual(0.35); }
    piece.enh = 0;
    expect(enhanceChance(piece)).toBe(1);
    piece.enh = 20;
    expect(enhanceChance(piece)).toBeLessThan(0.7);
  });
});

describe("rarity is gated by level", () => {
  it("caps what a hero can find until they have earned it", () => {
    expect(rarityCap(1)).toBe(2);
    expect(rarityCap(39)).toBe(2);
    expect(rarityCap(40)).toBe(3);
    expect(rarityCap(55)).toBe(4);
    expect(rarityCap(70)).toBe(5);
  });

  it("never rolls above the gate, whatever luck says", () => {
    for (let i = 0; i < 500; i++) expect(rollRarity(80, 200, 5, 10)).toBeLessThanOrEqual(2);
    for (let i = 0; i < 500; i++) expect(rollRarity(80, 200, 5, 45)).toBeLessThanOrEqual(3);
    expect(rollRarity(80, 0, 0, 80)).toBeLessThanOrEqual(5);
  });

  it("keeps high rarities rare even at the cap", () => {
    let legendaryPlus = 0;
    for (let i = 0; i < 4000; i++) if (rollRarity(30, 10, 0, 80) >= 4) legendaryPlus++;
    expect(legendaryPlus / 4000).toBeLessThan(0.1);
  });
});

describe("void crystals", () => {
  it("pays crystals for every level gained", () => {
    const h = newHero("Crystalfinder", "warrior");
    expect(h.voidCrystals).toBe(0);
    const { levels } = grant(h, 100_000, 0);
    expect(levels).toBeGreaterThan(1);
    expect(h.voidCrystals).toBe(levels * CRYSTALS_PER_LEVEL);
    expect(BOSS_CRYSTALS).toBeGreaterThan(0);
  });
});

describe("advanced barracks training", () => {
  const rich = () => {
    const h = newHero("Voiddrill", "warrior");
    h.buildings = { barracks: 30 };
    h.voidCrystals = 100_000;
    return h;
  };

  it("offers a stronger version of each attribute, unlocked by the barracks", () => {
    expect(ADVANCED_DRILLS.map((d) => d.id)).toEqual(["str", "int", "agi", "vit"]);
    for (const d of ADVANCED_DRILLS) expect(d.per).toBe(5);
    const h = newHero("Locked", "warrior");
    h.voidCrystals = 100;
    expect(advancedBlocker(h, "str")).toMatch(/Requires barracks level/);
  });

  it("spends crystals instead of gold and banks five points a rank", () => {
    const h = rich();
    const gold = h.gold;
    const cost = advancedCost(ADVANCED_DRILLS[0], 0, barracksLevel(h));
    expect(trainAdvanced(h, "str")).toBeNull();
    expect(h.voidCrystals).toBe(100_000 - cost);
    expect(h.gold).toBe(gold);
    expect(advancedRank(h, "str")).toBe(1);
    expect(drillAttrs(h).str).toBe(5);
    expect(heroStats(h).patk).toBeGreaterThan(newHero("Base", "warrior").attrs.str + 10);
  });

  it("charges more each rank and refuses an empty purse", () => {
    const h = rich();
    expect(advancedCost(ADVANCED_DRILLS[0], 5, 30)).toBeGreaterThan(advancedCost(ADVANCED_DRILLS[0], 0, 30));
    h.voidCrystals = 1;
    expect(advancedBlocker(h, "str")).toBe("Not enough Void Crystals");
    expect(trainAdvanced(h, "str")).toBe("Not enough Void Crystals");
  });

  it("has no final rank", () => {
    const h = rich();
    for (let i = 0; i < 60; i++) expect(trainAdvanced(h, "agi")).toBeNull();
    expect(advancedRank(h, "agi")).toBe(60);
    expect(drillAttrs(h).agi).toBe(300);
  });
});

describe("the barracks never maxes out", () => {
  it("keeps upgrading past the old level-30 ceiling", () => {
    const h = newHero("Builder", "warrior");
    h.buildings = { barracks: 30 };
    h.gold = 100_000_000;
    expect(upgradeBarracks(h)).toBeNull();
    expect(barracksLevel(h)).toBe(31);
    h.buildings = { barracks: 74 };
    expect(upgradeBarracks(h)).toBeNull();
    expect(barracksLevel(h)).toBe(75);
    expect(barracksCost(75, 80)).toBeGreaterThan(barracksCost(30, 80));
  });
});
