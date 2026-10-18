import { describe, expect, it } from "vitest";
import { MODIFIERS, addWeeklyKill, bossUnlocked, canClaimWeekly, challengeFoe, currentWeekly, weekIndex } from "@/game/endgame";

describe("endgame", () => {
  it("weeks roll over on Monday 00:00 UTC", () => {
    const sun = Date.UTC(2026, 9, 18, 23, 59); // Sunday
    const mon = Date.UTC(2026, 9, 19, 0, 0);
    expect(weekIndex(mon)).toBe(weekIndex(sun) + 1);
  });
  it("weekly reward needs 5 kills, claims once, resets next week", () => {
    const h: Parameters<typeof addWeeklyKill>[0] = { level: 30, paragon: 0 };
    const t = Date.UTC(2026, 9, 20);
    for (let i = 0; i < 4; i++) addWeeklyKill(h, t);
    expect(canClaimWeekly(h, t)).toBe(false);
    addWeeklyKill(h, t);
    expect(canClaimWeekly(h, t)).toBe(true);
    h.weekly = { ...currentWeekly(h, t), claimed: true };
    expect(canClaimWeekly(h, t)).toBe(false);
    expect(currentWeekly(h, t + 7 * 86400000).kills).toBe(0);
  });
  it("next boss unlocks after clearing the previous", () => {
    expect(bossUnlocked({ level: 20, paragon: 0 }, 1)).toBe(false);
    expect(bossUnlocked({ level: 20, paragon: 0, challenges: { aegis: 1 } }, 1)).toBe(true);
  });
  it("higher difficulty is stronger", () => {
    expect(challengeFoe("aegis", 5, MODIFIERS[0]).hp).toBeGreaterThan(challengeFoe("aegis", 1, MODIFIERS[0]).hp);
  });
});
