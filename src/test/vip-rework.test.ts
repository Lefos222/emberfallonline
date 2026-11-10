import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { grant } from "@/game/logic";
import { openVipActivities, claimVipActivity, vipActivityStates } from "@/game/vip-activities";
import { VIP_DAYS } from "@/game/vip-perks";

const vipHero = (level = 2) => {
  const hero = newHero("Member", "warrior");
  hero.srv = {
    premium: {
      balance: 0,
      vip: { level, until: new Date(Date.now() + VIP_DAYS * 86_400_000).toISOString() },
    },
  };
  return hero;
};

describe("VIP gold advantage", () => {
  it("pays a member more gold from the same reward", () => {
    const free = newHero("Free", "warrior");
    const member = vipHero(3);
    free.gold = 0;
    member.gold = 0;
    grant(free, 0, 1000);
    grant(member, 0, 1000);
    expect(free.gold).toBe(1000);
    expect(member.gold).toBe(1150);
  });
});

describe("VIP-only activities", () => {
  it("are locked for a hero without a membership", () => {
    const hero = newHero("Free", "warrior");
    openVipActivities(hero);
    const states = vipActivityStates(hero);
    expect(states).toHaveLength(2);
    for (const state of states) {
      expect(state.locked).toBe(true);
      expect(state.ready).toBe(false);
    }
    expect(() => claimVipActivity(hero, "vip-hunt")).toThrow(/VIP members only/);
  });

  it("pay out once the daily goal is met, and only once", () => {
    const hero = vipHero();
    openVipActivities(hero);
    hero.vipActivities!.base.wins = 0;
    hero.wins = 5;
    const ready = vipActivityStates(hero).find((s) => s.def.id === "vip-hunt");
    expect(ready?.ready).toBe(true);

    const before = hero.gold;
    const lines = claimVipActivity(hero, "vip-hunt");
    expect(hero.gold).toBeGreaterThan(before);
    expect(hero.chests?.gold ?? 0).toBe(1);
    expect(lines.join(" ")).toContain("chest");
    expect(() => claimVipActivity(hero, "vip-hunt")).toThrow(/Already claimed/);
  });

  it("does not pay before the goal is reached", () => {
    const hero = vipHero(1);
    openVipActivities(hero);
    hero.vipActivities!.base.wins = 0;
    hero.wins = 2;
    expect(() => claimVipActivity(hero, "vip-hunt")).toThrow(/Not finished/);
  });
});
