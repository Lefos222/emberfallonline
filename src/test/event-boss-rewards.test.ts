import { describe, expect, it } from "vitest";
import { EVENT_BOSS_KILLS_REQUIRED, WORLD_EVENTS } from "@/game/events";
import { countEventBossKill, eventBossKills, isBossEvent } from "@/game/event-rewards";

const boss = WORLD_EVENTS.find((e) => e.id === "world-boss")!;
const dungeon = WORLD_EVENTS.find((e) => e.kind === "dungeon")!;

describe("event boss reward gate", () => {
  it("requires five boss kills", () => {
    expect(EVENT_BOSS_KILLS_REQUIRED).toBe(5);
  });
  it("covers boss and season encounters only", () => {
    expect(isBossEvent(boss)).toBe(true);
    expect(isBossEvent(WORLD_EVENTS.find((e) => e.kind === "season")!)).toBe(true);
    expect(isBossEvent(dungeon)).toBe(false);
  });
  it("pays nothing until the fifth kill", () => {
    const h: { eventBoss?: Record<string, number> } = {};
    for (let kill = 1; kill < EVENT_BOSS_KILLS_REQUIRED; kill++) {
      const result = countEventBossKill(h, boss.id);
      expect(result).toEqual({ kills: kill, rewarded: false });
      expect(eventBossKills(h, boss.id)).toBe(kill);
    }
    expect(countEventBossKill(h, boss.id)).toEqual({ kills: 5, rewarded: true });
  });
  it("starts a fresh tally after a payout", () => {
    const h: { eventBoss?: Record<string, number> } = { eventBoss: { [boss.id]: 4 } };
    expect(countEventBossKill(h, boss.id).rewarded).toBe(true);
    expect(eventBossKills(h, boss.id)).toBe(0);
    expect(countEventBossKill(h, boss.id).kills).toBe(1);
  });
  it("keeps each event's tally separate", () => {
    const h: { eventBoss?: Record<string, number> } = {};
    countEventBossKill(h, boss.id);
    expect(eventBossKills(h, boss.id)).toBe(1);
    expect(eventBossKills(h, dungeon.id)).toBe(0);
  });
});
