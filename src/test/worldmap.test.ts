import { describe, expect, it } from "vitest";
import { MAP_NODES, RAID_LIMITS, canRaid, nodeUses, raidsLeft, type WorldMapState } from "@/game/worldmap";

const state = (used: Partial<Record<"gold" | "ore" | "boss", number>>, nodes: string[] = []): WorldMapState => ({
  now: new Date(0).toISOString(), resetAt: new Date(0).toISOString(),
  used: { gold: 0, ore: 0, boss: 0, ...used }, nodes,
});

const node = (id: string) => MAP_NODES.find((n) => n.id === id)!;

describe("world tree raid allowances", () => {
  it("pays 10 gold, 8 ore and 4 boss raids a day", () => {
    expect(RAID_LIMITS).toEqual({ gold: 10, ore: 8, boss: 4 });
  });

  it("counts how often a node was raided today", () => {
    expect(nodeUses(state({}, ["gold-1", "gold-1", "ore-2"]), "gold-1")).toBe(2);
    expect(nodeUses(state({}, ["gold-1"]), "gold-2")).toBe(0);
  });

  it("keeps a node raidable again while its kind's allowance lasts", () => {
    expect(canRaid(state({ gold: 3 }, ["gold-1", "gold-1", "gold-1"]), node("gold-1"))).toBe(true);
  });

  it("closes a node only once the allowance is spent", () => {
    expect(canRaid(state({ gold: 10 }, ["gold-1"]), node("gold-1"))).toBe(false);
    expect(raidsLeft(state({ ore: 3 }), "ore")).toBe(5);
    expect(raidsLeft(state({ boss: 9 }), "boss")).toBe(0);
  });
});
