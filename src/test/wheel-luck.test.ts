import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { WHEEL_SEGMENTS, WHEEL_SEG_DEG, landingOffset, wheelGoodChance } from "@/game/wheel";
import { BM_LUCKY_CHANCE, rollBlackMarket } from "@/game/black-market";
import { newHero } from "@/game/data";

describe("diamond luck", () => {
  it("has more than the old 8 wheel prizes", () => {
    expect(WHEEL_SEGMENTS.length).toBe(16);
  });
  it("wheel odds add up to 100%", () => {
    expect(+WHEEL_SEGMENTS.reduce((a, s) => a + s.weight, 0).toFixed(2)).toBe(100);
  });
  it("good wheel prizes hit 5% of spins", () => {
    expect(wheelGoodChance()).toBe(5);
  });
  it("normal wheel prizes hit 95% of spins", () => {
    expect(
      +WHEEL_SEGMENTS.filter((x) => !x.good)
        .reduce((a, x) => a + x.weight, 0)
        .toFixed(2),
    ).toBe(95);
  });
  it("the server rolls exactly the odds the wheel shows", () => {
    const sql = readFileSync("drizzle/migrations/0035_wheel_classic_rng.sql", "utf8");
    const steps = [...sql.matchAll(/r < ([\d.]+) THEN seg := (\d+)/g)].map(
      (m) => [+m[1]!, +m[2]!] as const,
    );
    const elseSeg = +/ELSE seg := (\d+)/.exec(sql)![1]!;
    const odds: Record<number, number> = {};
    let prev = 0;
    for (const [cut, seg] of steps) {
      odds[seg] = +(cut - prev).toFixed(2);
      prev = cut;
    }
    odds[elseSeg] = +(100 - prev).toFixed(2);
    WHEEL_SEGMENTS.forEach((seg, i) => expect([i, odds[i]]).toEqual([i, seg.weight]));
  });
  it("normal prizes pay the classic amounts", () => {
    const sql = readFileSync("drizzle/migrations/0035_wheel_classic_rng.sql", "utf8");
    expect(sql).toContain("seg := 0; gold := 3000 + lvl * 400;");
    expect(sql).toContain("seg := 2; xp := 200 + lvl * 120;");
    expect(sql).toContain("seg := 3; add := jsonb_build_object('ore', 40, 'essence', 10);");
    expect(sql).toContain("seg := 5; add := jsonb_build_object('frostCrystal', 4);");
  });
  it("the pointer always stops inside the winning slice", () => {
    for (let seg = 0; seg < WHEEL_SEGMENTS.length; seg++) {
      for (const r of [0, 0.01, 0.39, 0.5, 0.99]) {
        expect(Math.abs(landingOffset(seg, () => r))).toBeLessThan(WHEEL_SEG_DEG / 2);
      }
    }
  });
  it("a near miss leans toward the neighbouring ★ slice", () => {
    // Slice 0 (Gold) sits just before slice 1 (★ Void Crystals), so its near miss is clockwise.
    expect(landingOffset(0, () => 0.1)).toBeGreaterThan((WHEEL_SEG_DEG / 2) * 0.75);
  });
  it("Black Market lucky stock is a 5% roll", () => {
    expect(BM_LUCKY_CHANCE).toBe(0.05);
  });
  it("a lucky Black Market roll adds an Epic non-armour piece and a Sun Crystal", () => {
    const h = newHero("Tester", "warrior");
    rollBlackMarket(h, () => 0.01);
    expect(h.blackMarket!.lucky).toBe(true);
    expect(h.blackMarket!.items.some((i) => i.rarity === 3)).toBe(true);
    expect(h.blackMarket!.mats.some((m) => m.mat === "sunCrystal")).toBe(true);
  });
  it("an unlucky roll has no Sun Crystal", () => {
    const h = newHero("Tester", "warrior");
    rollBlackMarket(h, () => 0.9);
    expect(h.blackMarket!.lucky).toBe(false);
    expect(h.blackMarket!.mats.some((m) => m.mat === "sunCrystal")).toBe(false);
  });
});
