import { describe, expect, it } from "vitest";
import { itemStats, makeItem } from "@/game/data";
import { EPIC_SETS } from "@/game/epic-armour";
import { MATS } from "@/game/crafting";

describe("epic armours", () => {
  it("multiply a piece's stats by its set multiplier", () => {
    const base = { ...makeItem("warrior", 60, 4, "armour"), enh: 0 };
    const epic = { ...base, epic: "moonwarden" };
    expect(itemStats(epic).hp / itemStats(base).hp).toBeCloseTo(1.7, 5);
  });
  it("each new material drops from one named place", () => {
    expect(MATS.wyrmBone.src).toMatch(/elite hunts only/);
    expect(MATS.shadowSilk.src).toMatch(/Relic Trials/);
    expect(MATS.phoenixAsh.src).toMatch(/vaults only/);
    expect(EPIC_SETS.map((s) => s.minLevel)).toEqual([30, 60, 90, 120]);
  });
});
