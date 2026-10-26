import { z } from "zod";
import { stageFoe, type Foe } from "./data";
import { dungeonFoe, DUNGEONS, enemySprite } from "./world";

/** World map raid kinds and their server-enforced daily allowances (UTC day). */
export const RAID_LIMITS = { gold: 10, ore: 8, boss: 4 } as const;
export type RaidKind = keyof typeof RAID_LIMITS;

export interface MapNode {
  id: string;
  kind: RaidKind;
  name: string;
  /** Position on the map image, percent. */
  x: number;
  y: number;
  desc: string;
}

export const MAP_NODES: MapNode[] = [
  // Blue — gold mines (10 raids a day, shared across the mines)
  { id: "gold-1", kind: "gold", name: "Sunken Treasury", x: 18, y: 62, desc: "Flooded vaults glittering with coin." },
  { id: "gold-2", kind: "gold", name: "Gilded Hollow", x: 30, y: 38, desc: "A forest cave veined with gold." },
  { id: "gold-3", kind: "gold", name: "Merchant's Folly", x: 44, y: 70, desc: "A lost caravan's buried fortune." },
  { id: "gold-4", kind: "gold", name: "Azure Claim", x: 58, y: 30, desc: "Blue crystal marks the richest seam." },
  { id: "gold-5", kind: "gold", name: "King's Cache", x: 68, y: 56, desc: "A royal hoard, long forgotten." },
  { id: "gold-6", kind: "gold", name: "Rivergilt Mine", x: 80, y: 40, desc: "Panners still whisper of nuggets." },
  { id: "gold-7", kind: "gold", name: "Embergilt Depths", x: 88, y: 68, desc: "Molten gold pools in the deep rock." },
  // Green — ore dungeons (8 raids a day, shared across the dungeons)
  { id: "ore-1", kind: "ore", name: "Verdant Warrens", x: 14, y: 30, desc: "Goblins hoard ore in the green deeps." },
  { id: "ore-2", kind: "ore", name: "Mossvein Cavern", x: 36, y: 55, desc: "Copper roots thread the stone." },
  { id: "ore-3", kind: "ore", name: "Thornpick Delve", x: 52, y: 48, desc: "Every thorn hides a vein." },
  { id: "ore-4", kind: "ore", name: "Greenfall Excavation", x: 63, y: 74, desc: "The quarry that never empties." },
  { id: "ore-5", kind: "ore", name: "Emerald Maw", x: 76, y: 22, desc: "A beast's jaw of jade and iron." },
  // Red — bosses (4 raids a day, shared across the bosses)
  { id: "boss-1", kind: "boss", name: "Iron Overlord", x: 25, y: 80, desc: "The Aegis Vault's eternal warden." },
  { id: "boss-2", kind: "boss", name: "Gorefiend", x: 55, y: 14, desc: "It remembers every drop of blood." },
  { id: "boss-3", kind: "boss", name: "Ember Titan", x: 90, y: 50, desc: "The mountain that walks." },
];

export const nodeById = (id: string) => MAP_NODES.find((n) => n.id === id);

/** Server response for today's raid usage. */
export const worldMapStateSchema = z.object({
  now: z.string(),
  resetAt: z.string(),
  used: z.object({ gold: z.number(), ore: z.number(), boss: z.number() }),
  nodes: z.array(z.string()),
});
export type WorldMapState = z.infer<typeof worldMapStateSchema>;

export const raidsLeft = (state: WorldMapState, kind: RaidKind) => Math.max(0, RAID_LIMITS[kind] - state.used[kind]);
/** How often a node was raided today: a node can be raided again while its kind's daily allowance lasts. */
export const nodeUses = (state: WorldMapState, id: string) => state.nodes.filter((n) => n === id).length;
export const canRaid = (state: WorldMapState, node: MapNode) => raidsLeft(state, node.kind) > 0;

/** Encounter for a map node, scaled to the hero. Bosses reuse the dungeon wardens. */
export function mapFoe(node: MapNode, heroLevel: number): Foe & { sprite?: ReturnType<typeof enemySprite> } {
  if (node.kind === "boss") {
    const d = DUNGEONS[node.id === "boss-1" ? 0 : node.id === "boss-2" ? 1 : 3]!;
    return dungeonFoe(d, heroLevel);
  }
  const mult = node.kind === "gold" ? 0.9 : 1.0;
  const foe = stageFoe(Math.max(2, heroLevel), mult);
  const idx = MAP_NODES.filter((n) => n.kind === node.kind).findIndex((n) => n.id === node.id);
  return { ...foe, name: node.kind === "gold" ? "Mine Guardian" : "Ore Gnasher", sprite: enemySprite(node.kind === "gold" ? 1 : 0, idx % 4) };
}
