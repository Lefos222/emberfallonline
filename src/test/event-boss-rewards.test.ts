import { describe, expect, it } from "vitest";
import { EVENT_BOSS_KILLS_REQUIRED, WORLD_EVENTS } from "@/game/events";
import { countEventBossKill, eventBossKills, isBossEvent } from "@/game/event-rewards";

const siege = WORLD_EVENTS.find((e) => e.id === "rift-siege")!;
const hunt = WORLD_EVENTS.find((e) => e.kind === "hunt")!;

describe("event reward gate", () => {
  it("requires three wins for gated events", () => {
    expect(EVENT_BOSS_KILLS_REQUIRED).toBe(3);
  });
  it("covers sieges and the Blood Moon only", () => {
    expect(isBossEvent(siege)).toBe(true);
    expect(isBossEvent(WORLD_EVENTS.find((e) => e.kind === "bloodmoon")!)).toBe(true);
    expect(isBossEvent(hunt)).toBe(false);
  });
  it("pays nothing until the third win", () => {
    const h: { eventBoss?: Record<string, number> } = {};
    for (let kill = 1; kill < EVENT_BOSS_KILLS_REQUIRED; kill++) {
      const result = countEventBossKill(h, siege.id);
      expect(result).toEqual({ kills: kill, rewarded: false });
      expect(eventBossKills(h, siege.id)).toBe(kill);
    }
    expect(countEventBossKill(h, siege.id)).toEqual({ kills: 3, rewarded: true });
  });
  it("starts a fresh tally after a payout", () => {
    const h: { eventBoss?: Record<string, number> } = { eventBoss: { [siege.id]: 2 } };
    expect(countEventBossKill(h, siege.id).rewarded).toBe(true);
    expect(eventBossKills(h, siege.id)).toBe(0);
    expect(countEventBossKill(h, siege.id).kills).toBe(1);
  });
  it("keeps each event's tally separate", () => {
    const h: { eventBoss?: Record<string, number> } = {};
    countEventBossKill(h, siege.id);
    expect(eventBossKills(h, siege.id)).toBe(1);
    expect(eventBossKills(h, hunt.id)).toBe(0);
  });
});
