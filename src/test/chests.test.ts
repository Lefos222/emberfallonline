import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import { matCount } from "@/game/crafting";
import {
  REWARD_CHEST_HOURS,
  addChests,
  chestCount,
  claimRewardChest,
  formatChestCountdown,
  goldChestValue,
  openChest,
  rewardChestCountdown,
  rewardChestReady,
  rollBattleChest,
} from "@/game/chests";

const HOUR = 3_600_000;

describe("vault chests", () => {
  it("stores chests as items and redeems a gold chest for gold and materials", () => {
    const h = newHero("Chests", "warrior");
    addChests(h, "gold", 2);
    expect(chestCount(h, "gold")).toBe(2);
    const goldBefore = h.gold;
    const lines = openChest(h, "gold");
    expect(chestCount(h, "gold")).toBe(1);
    expect(h.gold).toBe(goldBefore + goldChestValue(h.level));
    expect(matCount(h, "ore")).toBe(5);
    expect(matCount(h, "fragment")).toBe(2);
    expect(lines.length).toBeGreaterThan(0);
  });

  it("opens a gem chest for real gem stacks", () => {
    const h = newHero("Gems", "mage");
    addChests(h, "gem", 1);
    openChest(h, "gem");
    const gems = Object.values(h.gems ?? {}).reduce((a, b) => a + b, 0);
    expect(gems).toBeGreaterThanOrEqual(2);
    expect(matCount(h, "essence")).toBe(3);
    expect(chestCount(h, "gem")).toBe(0);
  });

  it("refuses to open a chest the hero does not own", () => {
    const h = newHero("Empty", "archer");
    expect(() => openChest(h, "gold")).toThrow(/No Gold Chest/);
  });
});

describe("battle chest drops", () => {
  it("leaves a gem chest on the rarest roll, gold on the common one, nothing otherwise", () => {
    expect(rollBattleChest(() => 0)).toBe("gem");
    expect(rollBattleChest(() => 0.08)).toBe("gold");
    expect(rollBattleChest(() => 0.5)).toBeNull();
  });
});

describe("periodic reward chest", () => {
  it("is ready at once for a new hero and refills after four hours", () => {
    const h = newHero("Timer", "warrior");
    const now = Date.UTC(2026, 0, 1, 12);
    expect(rewardChestReady(h, now)).toBe(true);
    const kind = claimRewardChest(h, now);
    expect(kind).toBe("gold");
    expect(chestCount(h, "gold")).toBe(1);
    expect(rewardChestReady(h, now + 1000)).toBe(false);
    expect(rewardChestCountdown(h, now + 1000)).toBe(REWARD_CHEST_HOURS * HOUR - 1000);
    expect(rewardChestReady(h, now + REWARD_CHEST_HOURS * HOUR)).toBe(true);
  });

  it("hands a gem chest every fourth collection", () => {
    const h = newHero("Streak", "mage");
    const start = Date.UTC(2026, 0, 1, 12);
    const kinds = Array.from({ length: 4 }, (_, i) =>
      claimRewardChest(h, start + i * REWARD_CHEST_HOURS * HOUR),
    );
    expect(kinds).toEqual(["gold", "gold", "gold", "gem"]);
    expect(chestCount(h, "gem")).toBe(1);
  });

  it("formats a short countdown", () => {
    expect(formatChestCountdown(3 * HOUR + 42 * 60_000)).toBe("3h 42m");
    expect(formatChestCountdown(42 * 60_000 + 10_000)).toBe("42m 10s");
    expect(formatChestCountdown(9_000)).toBe("9s");
  });
});
