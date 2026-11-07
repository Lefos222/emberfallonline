import { describe, expect, it } from "vitest";
import {
  ATLAS_BAND_H,
  ATLAS_BANDS,
  ATLAS_H,
  ATLAS_W,
  iconCount,
  iconRect,
  iconTier,
  makeItem,
  rollArt,
  SLOTS,
  type HeroClass,
} from "@/game/data";
import { RELIC_SETS, relicItem } from "@/game/relics";

const CLASSES: HeroClass[] = ["warrior", "mage", "archer"];

describe("gear atlas", () => {
  it("stacks both painted class sheets into one image", () => {
    expect(ATLAS_BANDS).toBe(2);
    expect(ATLAS_W).toBe(1920);
    expect(ATLAS_H).toBe(ATLAS_BAND_H * ATLAS_BANDS);
    expect(ATLAS_H).toBe(2144);
  });

  it("keeps every icon inside the atlas in both bands", () => {
    for (const cls of CLASSES) {
      for (const slot of SLOTS) {
        for (let icon = 0; icon < iconCount(slot); icon += 1) {
          for (let band = 0; band < ATLAS_BANDS; band += 1) {
            const r = iconRect({ slot, cls, icon }, band);
            expect(r.x).toBeGreaterThanOrEqual(0);
            expect(r.y).toBeGreaterThanOrEqual(band * ATLAS_BAND_H);
            expect(r.y + r.h).toBeLessThanOrEqual((band + 1) * ATLAS_BAND_H);
            expect(r.x + r.w).toBeLessThanOrEqual(ATLAS_W);
          }
        }
      }
    }
  });

  it("reaches every painted icon of a slot across the rarity ladder", () => {
    for (const slot of SLOTS) {
      const seen = new Set<number>();
      for (let rarity = 0; rarity <= 5; rarity += 1) {
        for (let k = 0; k < 50; k += 1) seen.add(iconTier(slot, rarity, () => k / 50));
      }
      expect([...seen].sort((a, b) => a - b)).toEqual(
        Array.from({ length: iconCount(slot) }, (_, i) => i),
      );
    }
  });

  it("rolls ordinary gear into both painted bands", () => {
    const bands = new Set<number>();
    for (let i = 0; i < 40; i += 1) bands.add(rollArt());
    expect([...bands].sort()).toEqual([0, 1]);
    expect(rollArt(() => 0)).toBe(0);
    expect(rollArt(() => 0.99)).toBe(ATLAS_BANDS - 1);
  });

  it("gives every new drop and craft a valid icon and band", () => {
    for (const cls of CLASSES) {
      for (let i = 0; i < 50; i += 1) {
        const it = makeItem(cls, 20, i % 6);
        expect(it.icon).toBeGreaterThanOrEqual(0);
        expect(it.icon).toBeLessThan(iconCount(it.slot));
        expect(it.art).toBeGreaterThanOrEqual(0);
        expect(it.art).toBeLessThan(ATLAS_BANDS);
      }
    }
  });

  it("pins the relic collections to the relic band", () => {
    for (const cls of CLASSES) {
      for (const piece of RELIC_SETS[cls].pieces) expect(relicItem(piece, cls, 30).art).toBe(1);
    }
  });
});
