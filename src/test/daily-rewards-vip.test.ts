import { describe, expect, it } from "vitest";
import { newHero, type Hero } from "@/game/data";
import {
  DAILY_REWARDS,
  DAILY_REWARD_DAYS,
  VIP_BOARD_MIN_LEVEL,
  VIP_DAILY_REWARDS,
  boardDayKey,
  canClaimBoardDay,
  canClaimVipBoardDay,
  claimBoardDay,
  claimVipBoardDay,
  claimedBoardDays,
  nextBoardDay,
  vipBoardReward,
  vipBoardUnlocked,
  vipClaimedBoardDays,
  vipNextBoardDay,
  type DailyReward,
} from "@/game/daily-rewards";

const NOON = Date.UTC(2026, 0, 1, 12, 0, 0);
const NEXT_DAY = NOON + 24 * 3_600_000;

/** A hero whose server-owned premium wallet carries an active VIP membership. */
const vipHero = (level: number): Hero => {
  const h = newHero("Member", "warrior") as Hero & { srv?: unknown };
  h.srv = {
    premium: {
      balance: 0,
      vip: { level, until: new Date(Date.now() + 30 * 24 * 3_600_000).toISOString() },
    },
  };
  return h;
};

describe("VIP reward board", () => {
  it("has thirty ordered days, each carrying a gift", () => {
    expect(VIP_DAILY_REWARDS).toHaveLength(DAILY_REWARD_DAYS);
    VIP_DAILY_REWARDS.forEach((rw, i) => {
      expect(rw.day).toBe(i + 1);
      expect(Boolean(rw.gold || rw.mats || rw.gems?.length)).toBe(true);
    });
  });

  it("never pays Diamonds, but does pay better gems, bonus chests and rare materials", () => {
    for (const rw of VIP_DAILY_REWARDS) {
      expect(rw).not.toHaveProperty("diamonds");
      for (const g of rw.gems ?? []) expect(g.tier).toBeGreaterThanOrEqual(1);
      for (const c of rw.chests ?? []) expect(["gold", "gem"]).toContain(c);
    }
    expect(VIP_DAILY_REWARDS.some((rw) => rw.chests?.includes("gem"))).toBe(true);
    expect(VIP_DAILY_REWARDS.some((rw) => (rw.gems ?? []).some((g) => g.tier >= 3))).toBe(true);
    expect(VIP_DAILY_REWARDS.some((rw) => rw.mats?.sigil)).toBe(true);
  });

  it("is a little richer than the free board, day for day", () => {
    const gold = (list: DailyReward[]) => list.reduce((sum, rw) => sum + (rw.gold ?? 0), 0);
    const mats = (list: DailyReward[]) =>
      list.reduce((sum, rw) => sum + Object.values(rw.mats ?? {}).reduce((a, n) => a + n, 0), 0);
    expect(gold(VIP_DAILY_REWARDS)).toBeGreaterThan(gold(DAILY_REWARDS));
    expect(mats(VIP_DAILY_REWARDS)).toBeGreaterThan(mats(DAILY_REWARDS));
    // Members who pay get a genuinely bigger board: at least twice the free cycle's gold.
    expect(gold(VIP_DAILY_REWARDS)).toBeGreaterThan(gold(DAILY_REWARDS) * 2);
  });

  it("stays locked below VIP 3 and opens at VIP 3", () => {
    expect(VIP_BOARD_MIN_LEVEL).toBe(3);
    expect(vipBoardUnlocked(newHero("Free", "warrior"))).toBe(false);
    expect(vipBoardUnlocked(vipHero(2))).toBe(false);
    expect(vipBoardUnlocked(vipHero(3))).toBe(true);
    expect(canClaimVipBoardDay(vipHero(2), NOON)).toBe(false);
    expect(canClaimVipBoardDay(vipHero(3), NOON)).toBe(true);
    expect(() => claimVipBoardDay(vipHero(2), NOON)).toThrow(/VIP 3/);
  });

  it("claims one VIP gift per Greek day on its own ledger", () => {
    const h = vipHero(3);
    const goldBefore = h.gold;
    claimVipBoardDay(h, NOON);
    expect(h.gold).toBe(goldBefore + (VIP_DAILY_REWARDS[0].gold ?? 0));
    expect(vipClaimedBoardDays(h)).toBe(1);
    expect(vipNextBoardDay(h)).toBe(2);
    expect(h.dailyRewards?.vip?.last).toBe(boardDayKey(NOON));
    expect(canClaimVipBoardDay(h, NOON)).toBe(false);
    expect(() => claimVipBoardDay(h, NOON + 60_000)).toThrow(/already claimed/i);

    claimVipBoardDay(h, NEXT_DAY);
    expect(vipNextBoardDay(h)).toBe(3);
  });

  it("keeps the two boards independent", () => {
    const h = vipHero(3);
    claimBoardDay(h, NOON);
    expect(nextBoardDay(h)).toBe(2);
    expect(vipNextBoardDay(h)).toBe(1); // the free claim never advances the VIP board
    claimVipBoardDay(h, NOON);
    expect(nextBoardDay(h)).toBe(2); // and the VIP claim never touches the free board
    expect(vipNextBoardDay(h)).toBe(2);
    expect(canClaimBoardDay(h, NOON)).toBe(false);
    expect(claimedBoardDays(h)).toBe(1);
  });

  it("rolls over to VIP day 1 after thirty days", () => {
    const h = vipHero(3);
    for (let day = 0; day < DAILY_REWARD_DAYS; day++)
      claimVipBoardDay(h, NOON + day * 24 * 3_600_000);
    expect(vipNextBoardDay(h)).toBe(1);
    expect(h.dailyRewards?.vip?.cycles).toBe(1);
    expect(vipBoardReward(1)).toBe(VIP_DAILY_REWARDS[0]);
  });
});
