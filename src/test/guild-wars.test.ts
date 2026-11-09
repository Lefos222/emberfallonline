import { describe, expect, it } from "vitest";
import { WAR_ATTACKS, WAR_SIZES, warBracket, warSpoils } from "@/game/guild-wars";

describe("guild war brackets", () => {
  it("covers 5v5 through 100v100 in fives", () => {
    expect(WAR_SIZES[0]).toBe(5);
    expect(WAR_SIZES[WAR_SIZES.length - 1]).toBe(100);
    expect(WAR_SIZES.every((n) => n % 5 === 0)).toBe(true);
    expect(WAR_SIZES).toHaveLength(20);
    expect(warBracket(5)).toBe("5v5");
    expect(warBracket(100)).toBe("100v100");
  });

  it("gives every hero two attacks for the whole war", () => {
    expect(WAR_ATTACKS).toBe(2);
  });

  it("pays both sides, the winner more and bigger brackets more", () => {
    const win = warSpoils(5, "win", 10);
    const draw = warSpoils(5, "draw", 10);
    const loss = warSpoils(5, "loss", 10);
    expect(win.gold).toBeGreaterThan(draw.gold);
    expect(draw.gold).toBeGreaterThan(loss.gold);
    expect(loss.gold).toBeGreaterThan(0); // the losing guild is still paid
    expect(win.mats["starshard"]).toBeGreaterThan(0);
    expect(win.mats["bossCore"]).toBeGreaterThan(0);

    const big = warSpoils(100, "win", 10);
    expect(big.gold).toBeGreaterThan(win.gold);
    expect(big.mats["starshard"]).toBeGreaterThan(win.mats["starshard"]);
  });

  it("pays the losing side a small consolation in a large bracket", () => {
    expect(warSpoils(5, "loss", 1).mats).toEqual({});
    expect(warSpoils(50, "loss", 1).mats["starshard"]).toBe(1);
  });
});
