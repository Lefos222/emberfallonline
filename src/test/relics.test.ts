import { describe, expect, it } from "vitest";
import { newHero, type Hero } from "@/game/data";
import {
  RELIC_RANKS,
  RELIC_SETS,
  equipBestRelics,
  isRelicItem,
  noteRelic,
  recoveredRelics,
  relicFoe,
  relicItem,
  relicUnlocked,
  rollRelic,
  wornRelics,
} from "@/game/relics";
import { SET_NAMES, activeSets, setFx } from "@/game/progress";

const CLASSES = ["warrior", "mage", "archer"] as const;

describe("relic collections", () => {
  it("gives every class a twelve-piece collection whose names form one set", () => {
    for (const cls of CLASSES) {
      const set = RELIC_SETS[cls];
      expect(set.pieces).toHaveLength(12);
      expect(new Set(set.pieces.map((p) => p.id)).size).toBe(12);
      expect(new Set(set.pieces.map((p) => p.name)).size).toBe(12);
      expect(set.pieces.every((p) => p.name.startsWith(`${set.set} `))).toBe(true);
      expect(SET_NAMES).toContain(set.set);
      // Every rank contributes pieces, so a full collection is reachable at each stage of the trials.
      for (const { rank } of RELIC_RANKS) expect(set.pieces.some((p) => p.rank === rank)).toBe(true);
      // At least three weapons per class: the picture's weapon rows are all used.
      expect(set.pieces.filter((p) => p.slot === "weapon").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps trial ranks behind their level gates", () => {
    const h = newHero("Gate", "warrior");
    h.level = 10;
    expect(relicUnlocked(h, 1)).toBe(true);
    expect(relicUnlocked(h, 2)).toBe(false);
    h.paragon = 25;
    expect(relicUnlocked(h, 2)).toBe(true);
  });

  it("only drops pieces the rank can reach, and favours undiscovered ones", () => {
    const h = newHero("Loot", "mage");
    h.level = 60;
    for (let i = 0; i < 40; i += 1) {
      const roll = rollRelic(h, 1);
      expect(roll.piece.rank).toBe(1);
      expect(roll.item.slot).toBe(roll.piece.slot);
      expect(roll.item.ilvl).toBe(60);
    }
    // With only one piece missing, the trial hands it over instead of rolling duplicates.
    const set = RELIC_SETS.mage;
    for (const piece of set.pieces.slice(1)) noteRelic(h, piece.id);
    const last = rollRelic(h, 3, () => 0);
    expect(last.piece.id).toBe(set.pieces[0]!.id);
    expect(recoveredRelics(h) + 1).toBe(set.pieces.length);
  });

  it("equips the best relics it owns and awards the signature bonus at six pieces", () => {
    const h: Hero = newHero("Wearer", "archer");
    h.level = 60;
    const pieces = RELIC_SETS.archer.pieces;
    const wornSlots = ["helmet", "armour", "boots", "belt", "weapon", "ring"] as const;
    for (const slot of wornSlots) h.inventory.push(relicItem(pieces.find((p) => p.slot === slot)!, "archer", 60));
    expect(equipBestRelics(h)).toBe(6);
    expect(wornRelics(h)).toBe(6);
    expect(activeSets(h.equipment)[0]!.count).toBe(6);
    const fx = setFx(h.equipment);
    // Shared 2/4/6-piece bonuses plus the Verdant signature.
    expect(fx.atkPct).toBe(12);
    expect(fx.defPct).toBe(11);
    expect(fx.crit).toBe(6);
  });

  it("draws relic pieces from the relic band of the shared atlas, for every class", () => {
    for (const cls of CLASSES) {
      for (const piece of RELIC_SETS[cls].pieces) {
        expect(isRelicItem(piece.name)).toBe(true);
        expect(relicItem(piece, cls, 30).art).toBe(1);
      }
      // The starter kit of the same class is cut from the original band.
      const h = newHero("Arms", cls);
      const worn = Object.values(h.equipment).flatMap((it) => (it ? [it] : []));
      expect(worn.length).toBeGreaterThan(0);
      for (const it of worn) {
        expect(isRelicItem(it.name)).toBe(false);
        expect(it.art ?? 0).toBe(0);
      }
    }
  });

  it("scales the trial warden with the hero's level", () => {
    const low = newHero("Low", "warrior");
    const high = newHero("High", "warrior");
    high.level = 60;
    expect(relicFoe(high, 1).hp).toBeGreaterThan(relicFoe(low, 1).hp);
    expect(relicFoe(high, 1).name).toBe(RELIC_SETS.warrior.boss.name + " · Rank I");
  });
});
