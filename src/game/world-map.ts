import { BESTIARY, TIER_BOSSES, enemySprite, type SpriteRect } from "./world";

/**
 * The EMBER FALL world map — the country around every player's castle.
 *
 * World space is a 100 x 100 grid of percent coordinates (x east, y south) that the
 * player pans. Everything here is authored world content, except castles: a castle
 * belongs to a real player and another player can see it, so it lives on the game
 * server in `world_castles`.
 *
 * CASTLE_PLOTS is authoritative on the server (see world_castle_move in
 * drizzle/migrations/0011_world_map.sql): the client draws the plots, the server
 * decides that a move lands on one of them. The two lists must stay identical, the
 * same rule as the Lucky Shot odds in crafting.ts and lucky_shot() SQL.
 */
export const CASTLE_MOVES_PER_DAY = 3;
export const WORLD_EXTENT = 100;

export type Terrain = "plains" | "forest" | "desert" | "swamp" | "volcanic" | "snow";

export interface WorldZone {
  id: string; name: string; terrain: Terrain; x: number; y: number; w: number; h: number;
  level: [number, number]; blurb: string;
}

/** Six regions, laid out so no two overlap; levels rise the further you travel from the castle. */
export const WORLD_ZONES: WorldZone[] = [
  { id: "emberreach", name: "Ember Reach", terrain: "plains", x: 38, y: 5, w: 24, h: 42, level: [1, 12], blurb: "The heartlands below the castle gate, where every traveller starts." },
  { id: "thornwood", name: "Thornwood", terrain: "forest", x: 4, y: 5, w: 30, h: 42, level: [5, 15], blurb: "Old growth that never stopped burning." },
  { id: "ashenwaste", name: "Ashen Waste", terrain: "desert", x: 66, y: 5, w: 30, h: 42, level: [14, 26], blurb: "A dead plain of glass and grey dust." },
  { id: "mirefen", name: "Mire Fen", terrain: "swamp", x: 4, y: 54, w: 26, h: 40, level: [22, 32], blurb: "Drowned ruins and slow, hungry water." },
  { id: "bloodmoon", name: "Bloodmoon Barrens", terrain: "volcanic", x: 34, y: 54, w: 26, h: 40, level: [30, 42], blurb: "The wound the blood moon left behind." },
  { id: "frostspine", name: "Frostspine Peaks", terrain: "snow", x: 64, y: 54, w: 32, h: 40, level: [40, 56], blurb: "Where the air itself cuts." },
];

const zoneById = new Map(WORLD_ZONES.map((z) => [z.id, z]));
export const zoneOf = (id: string) => zoneById.get(id);
export const zoneName = (id: string) => zoneById.get(id)?.name ?? "The wilds";

/** The ground a player's castle can stand on. A plot takes any number of castles, so every player always has a home. */
export interface CastlePlot { id: string; zone: string; x: number; y: number }
export const CASTLE_PLOTS: CastlePlot[] = [
  { id: "emberreach-1", zone: "emberreach", x: 43, y: 14 },
  { id: "emberreach-2", zone: "emberreach", x: 57, y: 14 },
  { id: "emberreach-3", zone: "emberreach", x: 43, y: 34 },
  { id: "emberreach-4", zone: "emberreach", x: 57, y: 34 },
  { id: "thornwood-1", zone: "thornwood", x: 10, y: 14 },
  { id: "thornwood-2", zone: "thornwood", x: 28, y: 14 },
  { id: "thornwood-3", zone: "thornwood", x: 10, y: 38 },
  { id: "thornwood-4", zone: "thornwood", x: 28, y: 38 },
  { id: "ashenwaste-1", zone: "ashenwaste", x: 72, y: 14 },
  { id: "ashenwaste-2", zone: "ashenwaste", x: 90, y: 14 },
  { id: "ashenwaste-3", zone: "ashenwaste", x: 72, y: 38 },
  { id: "ashenwaste-4", zone: "ashenwaste", x: 90, y: 38 },
  { id: "mirefen-1", zone: "mirefen", x: 10, y: 62 },
  { id: "mirefen-2", zone: "mirefen", x: 24, y: 62 },
  { id: "mirefen-3", zone: "mirefen", x: 10, y: 86 },
  { id: "mirefen-4", zone: "mirefen", x: 24, y: 86 },
  { id: "bloodmoon-1", zone: "bloodmoon", x: 40, y: 62 },
  { id: "bloodmoon-2", zone: "bloodmoon", x: 54, y: 62 },
  { id: "bloodmoon-3", zone: "bloodmoon", x: 40, y: 86 },
  { id: "bloodmoon-4", zone: "bloodmoon", x: 54, y: 86 },
  { id: "frostspine-1", zone: "frostspine", x: 70, y: 62 },
  { id: "frostspine-2", zone: "frostspine", x: 90, y: 62 },
  { id: "frostspine-3", zone: "frostspine", x: 70, y: 86 },
  { id: "frostspine-4", zone: "frostspine", x: 90, y: 86 },
];
const plotById = new Map(CASTLE_PLOTS.map((p) => [p.id, p]));
export const plotOf = (id: string) => plotById.get(id);

export type FoeKind = "beast" | "undead" | "demon" | "elite" | "boss";

export interface WorldMonster {
  id: string; name: string; zone: string; x: number; y: number; level: number; kind: FoeKind; sprite: SpriteRect;
}

/** Monsters stand in the world, not on a list: the painted enemy sheet is cropped in place. */
const monster = (zone: string, n: number, row: number, col: number, level: number, kind: FoeKind, x: number, y: number): WorldMonster => ({
  id: `${zone}-${n}`, zone, x, y, level, kind, sprite: enemySprite(row, col), name: BESTIARY[row]![col]!,
});

export const WORLD_MONSTERS: WorldMonster[] = [
  // Ember Reach — where a new castle stands
  monster("emberreach", 1, 0, 2, 4, "beast", 46, 18),
  monster("emberreach", 2, 0, 4, 6, "beast", 56, 24),
  monster("emberreach", 3, 0, 7, 3, "beast", 44, 32),
  monster("emberreach", 4, 1, 0, 8, "undead", 52, 40),
  monster("emberreach", 5, 0, 6, 11, "elite", 48, 12),
  // Thornwood
  monster("thornwood", 1, 0, 3, 7, "beast", 12, 16),
  monster("thornwood", 2, 0, 9, 10, "beast", 26, 22),
  monster("thornwood", 3, 1, 2, 12, "undead", 14, 34),
  monster("thornwood", 4, 2, 3, 13, "beast", 24, 38),
  monster("thornwood", 5, 1, 6, 15, "elite", 18, 10),
  // Ashen Waste
  monster("ashenwaste", 1, 2, 4, 16, "beast", 74, 16),
  monster("ashenwaste", 2, 2, 6, 19, "beast", 88, 20),
  monster("ashenwaste", 3, 2, 9, 22, "beast", 68, 34),
  monster("ashenwaste", 4, 1, 8, 24, "undead", 86, 38),
  monster("ashenwaste", 5, 2, 5, 26, "elite", 80, 10),
  // Mire Fen
  monster("mirefen", 1, 1, 9, 23, "undead", 12, 62),
  monster("mirefen", 2, 1, 10, 26, "undead", 24, 70),
  monster("mirefen", 3, 2, 1, 28, "beast", 10, 78),
  monster("mirefen", 4, 3, 0, 30, "demon", 18, 88),
  monster("mirefen", 5, 1, 11, 32, "elite", 16, 64),
  // Bloodmoon Barrens
  monster("bloodmoon", 1, 3, 1, 33, "demon", 44, 66),
  monster("bloodmoon", 2, 3, 7, 35, "demon", 58, 68),
  monster("bloodmoon", 3, 3, 8, 37, "demon", 40, 78),
  monster("bloodmoon", 4, 4, 2, 40, "demon", 54, 86),
  monster("bloodmoon", 5, 3, 9, 42, "elite", 48, 60),
  // Frostspine Peaks
  monster("frostspine", 1, 2, 10, 44, "beast", 74, 58),
  monster("frostspine", 2, 2, 11, 47, "beast", 88, 68),
  monster("frostspine", 3, 2, 7, 49, "beast", 70, 80),
  monster("frostspine", 4, 4, 5, 52, "demon", 86, 84),
  monster("frostspine", 5, 3, 10, 56, "elite", 78, 88),
];

export interface WorldBoss { id: string; name: string; zone: string; x: number; y: number; level: number; sprite: SpriteRect }
/** The four tier bosses hold the far corners of the world. */
export const WORLD_BOSSES: WorldBoss[] = [
  { id: "boss-gorefiend", name: TIER_BOSSES.gorefiend.name, zone: "mirefen", x: 20, y: 58, level: 32, sprite: TIER_BOSSES.gorefiend.sprite },
  { id: "boss-aegis", name: TIER_BOSSES.aegis.name, zone: "ashenwaste", x: 90, y: 26, level: 26, sprite: TIER_BOSSES.aegis.sprite },
  { id: "boss-vulkan", name: TIER_BOSSES.vulkan.name, zone: "bloodmoon", x: 52, y: 90, level: 42, sprite: TIER_BOSSES.vulkan.sprite },
  { id: "boss-tenebris", name: TIER_BOSSES.tenebris.name, zone: "frostspine", x: 78, y: 58, level: 56, sprite: TIER_BOSSES.tenebris.sprite },
];

export interface WorldNode { id: string; name: string; zone: string; x: number; y: number; kind: "resource" | "poi"; note: string }
/** Fixed places worth travelling to: gathering grounds and the landmarks between them. */
export const WORLD_NODES: WorldNode[] = [
  { id: "res-thornwood", name: "Thornwood Timber", zone: "thornwood", x: 18, y: 28, kind: "resource", note: "Logging ground · tier 1–3 wood" },
  { id: "res-emberreach", name: "Ember Ore Vein", zone: "emberreach", x: 50, y: 26, kind: "resource", note: "Mining ground · iron and starshard" },
  { id: "res-ashenwaste", name: "Glasswind Dig", zone: "ashenwaste", x: 78, y: 30, kind: "resource", note: "Archaeology ground · buried relics" },
  { id: "res-mirefen", name: "Fenwater Catch", zone: "mirefen", x: 14, y: 72, kind: "resource", note: "Fishing ground · fen catch" },
  { id: "res-bloodmoon", name: "Cinder Herbs", zone: "bloodmoon", x: 46, y: 72, kind: "resource", note: "Herbalism ground · ember bloom" },
  { id: "res-frostspine", name: "Frostline Cache", zone: "frostspine", x: 86, y: 74, kind: "resource", note: "Treasure ground · frozen hoard" },
  { id: "poi-homecamp", name: "Castle Gate Road", zone: "emberreach", x: 50, y: 44, kind: "poi", note: "The road your castle watches over." },
  { id: "poi-wanderers", name: "Wanderer's Camp", zone: "emberreach", x: 42, y: 42, kind: "poi", note: "Travellers trade rumours here." },
  { id: "poi-burntshrine", name: "Burnt Shrine", zone: "thornwood", x: 10, y: 24, kind: "poi", note: "Ash still warm after a hundred years." },
  { id: "poi-caravan", name: "Caravan Wreck", zone: "ashenwaste", x: 70, y: 12, kind: "poi", note: "Picked clean — almost." },
  { id: "poi-sunken", name: "Sunken Altar", zone: "mirefen", x: 20, y: 82, kind: "poi", note: "Steps lead down into black water." },
  { id: "poi-obelisk", name: "Obsidian Obelisk", zone: "bloodmoon", x: 36, y: 58, kind: "poi", note: "It hums when the moon is full." },
  { id: "poi-watchtower", name: "Frozen Watchtower", zone: "frostspine", x: 90, y: 60, kind: "poi", note: "Abandoned, but the lamp still burns." },
  { id: "poi-aurora", name: "Aurora Ridge", zone: "frostspine", x: 68, y: 92, kind: "poi", note: "The only warm ground in the peaks." },
];

/** The UTC day the server counts castle moves against. */
export const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);

/** Moves left today. The server owns the real limit; this only draws it. */
export const movesLeftToday = (moveDay: string | null, movesUsed: number) =>
  moveDay === utcDay() ? Math.max(0, CASTLE_MOVES_PER_DAY - movesUsed) : CASTLE_MOVES_PER_DAY;
