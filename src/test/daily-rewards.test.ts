import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  DAILY_REWARDS,
  DAILY_REWARD_DAYS,
  boardDayKey,
  boardReward,
  canClaimBoardDay,
  claimBoardDay,
  claimedBoardDays,
  nextBoardDay,
} from "@/game/daily-rewards";

const NOON = Date.UTC(2026, 0, 1, 12, 0, 0);
const NEXT_DAY = NOON + 24 * 3_600_000;

describe("30-day reward board", () => {
  it("has thirty ordered days, each carrying a gift", () => {
    expect(DAILY_REWARDS).toHaveLength(DAILY_REWARD_DAYS);
    DAILY_REWARDS.forEach((rw, i) => {
      expect(rw.day).toBe(i + 1);
      expect(Boolean(rw.gold || rw.mats || rw.gems?.length)).toBe(true);
    });
  });
  it("mixes gold, level 1-2 gems, materials and gold chests", () => {
    expect(DAILY_REWARDS.some((rw) => rw.gold && !rw.chest)).toBe(true);
    expect(DAILY_REWARDS.some((rw) => rw.chest)).toBe(true);
    expect(DAILY_REWARDS.some((rw) => rw.mats?.fragment)).toBe(true);
    const tiers = DAILY_REWARDS.flatMap((rw) => rw.gems ?? []).map((g) => g.tier);
    expect(tiers.length).toBeGreaterThan(0);
    expect(tiers.every((t) => t === 1 || t === 2)).toBe(true);
  });
  it("starts on day 1 and only moves on after a claim", () => {
    const h = newHero("Board", "warrior");
    expect(nextBoardDay(h)).toBe(1);
    expect(canClaimBoardDay(h, NOON)).toBe(true);
    const goldBefore = h.gold;
    claimBoardDay(h, NOON);
    expect(claimedBoardDays(h)).toBe(1);
    expect(nextBoardDay(h)).toBe(2);
    expect(h.gold).toBeGreaterThan(goldBefore);
    expect(canClaimBoardDay(h, NOON)).toBe(false);
  });
  it("puts a real gold chest in the vault on chest days", () => {
    const h = newHero("Board", "warrior");
    const chestDay = DAILY_REWARDS.find((rw) => rw.chests?.includes("gold"))!;
    for (let i = 0; i < chestDay.day; i++) claimBoardDay(h, NOON + i * 24 * 3_600_000);
    expect(h.chests?.gold).toBeGreaterThanOrEqual(1);
  });
  it("allows one claim per Greek day", () => {
    const h = newHero("Board", "warrior");
    claimBoardDay(h, NOON);
    expect(h.dailyRewards?.last).toBe(boardDayKey(NOON));
    expect(() => claimBoardDay(h, NOON + 60_000)).toThrow(/already claimed/i);
    claimBoardDay(h, NEXT_DAY);
    expect(nextBoardDay(h)).toBe(3);
  });
  it("pays the day's gems and materials onto the save", () => {
    const h = newHero("Board", "warrior");
    const gemDay = DAILY_REWARDS.find((rw) => rw.gems?.length)!;
    for (let day = 1; day <= gemDay.day; day++) claimBoardDay(h, NOON + (day - 1) * 24 * 3_600_000);
    expect(Object.keys(h.gems ?? {}).length).toBeGreaterThan(0);
    const matDay = DAILY_REWARDS.find((rw) => rw.mats?.fragment && rw.day > gemDay.day);
    if (matDay) {
      for (let day = gemDay.day + 1; day <= matDay.day; day++)
        claimBoardDay(h, NOON + (day - 1) * 24 * 3_600_000);
      expect(h.mats?.fragment ?? 0).toBeGreaterThan(0);
    }
  });
  it("rolls over to day 1 after thirty days", () => {
    const h = newHero("Board", "warrior");
    for (let day = 0; day < DAILY_REWARD_DAYS; day++) claimBoardDay(h, NOON + day * 24 * 3_600_000);
    expect(nextBoardDay(h)).toBe(1);
    expect(h.dailyRewards?.cycles).toBe(1);
    expect(boardReward(1)).toBe(DAILY_REWARDS[0]);
  });
});
