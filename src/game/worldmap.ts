import { z } from "zod";
import { CLASSES, battleRating, stageFoe, type Foe, type HeroClass } from "./data";
import { dungeonFoe, DUNGEONS, enemySprite, type SpriteRect } from "./world";
import { goldGain } from "./gold";

/** World map raid kinds and their server-enforced daily allowances (UTC day). */
export const RAID_LIMITS = { gold: 30, ore: 24, boss: 12 } as const;
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
  // Blue — gold mines (30 raids a day, shared across the mines)
  { id: "gold-1", kind: "gold", name: "Sunken Treasury", x: 18, y: 62, desc: "Flooded vaults glittering with coin." },
  { id: "gold-2", kind: "gold", name: "Gilded Hollow", x: 30, y: 38, desc: "A forest cave veined with gold." },
  { id: "gold-3", kind: "gold", name: "Merchant's Folly", x: 44, y: 70, desc: "A lost caravan's buried fortune." },
  { id: "gold-4", kind: "gold", name: "Azure Claim", x: 58, y: 30, desc: "Blue crystal marks the richest seam." },
  { id: "gold-5", kind: "gold", name: "King's Cache", x: 68, y: 56, desc: "A royal hoard, long forgotten." },
  { id: "gold-6", kind: "gold", name: "Rivergilt Mine", x: 80, y: 40, desc: "Panners still whisper of nuggets." },
  { id: "gold-7", kind: "gold", name: "Embergilt Depths", x: 88, y: 68, desc: "Molten gold pools in the deep rock." },
  // Green — ore dungeons (24 raids a day, shared across the dungeons)
  { id: "ore-1", kind: "ore", name: "Verdant Warrens", x: 14, y: 30, desc: "Goblins hoard ore in the green deeps." },
  { id: "ore-2", kind: "ore", name: "Mossvein Cavern", x: 36, y: 55, desc: "Copper roots thread the stone." },
  { id: "ore-3", kind: "ore", name: "Thornpick Delve", x: 52, y: 48, desc: "Every thorn hides a vein." },
  { id: "ore-4", kind: "ore", name: "Greenfall Excavation", x: 63, y: 74, desc: "The quarry that never empties." },
  { id: "ore-5", kind: "ore", name: "Emerald Maw", x: 76, y: 22, desc: "A beast's jaw of jade and iron." },
  // Red — bosses (12 raids a day, shared across the bosses)
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

/* ------------------------------------------------------------------------- *
 * The realm — one painted, bounded world
 *
 * The map art (1376×768, drawn from above) is the whole world: it has an edge,
 * and nothing exists past it. Every mine, ore dungeon, boss lair, rival keep,
 * ruin and lookout is authored once over the painted biomes below, so the realm
 * is the same for every player. Only the castles are player-made: each hero
 * plants one banner on the map (see worldcastles.ts), and the map holds
 * thousands of them.
 * ------------------------------------------------------------------------- */

/** The world in units; the painted art keeps its 1376×768 aspect. */
export const WORLD_W = 6144;
export const WORLD_H = Math.round((WORLD_W * 768) / 1376);
/** How many times a day another lord's castle may be raided. */
export const CASTLE_RAIDS_PER_DAY = 9;
/** Banners the realm can hold: one per hero, thousands of them. */
export const CASTLE_CAPACITY = 5000;

/** Deepest and closest the camera may go, in world units per pixel. Zoomed in this far
 *  a single banner still fills the stage now that the realm is half again as wide. */
export const MAX_ZOOM = 6;

export type Terrain = "plains" | "forest" | "desert" | "swamp" | "volcanic" | "snow" | "coast" | "astral";

export const TERRAIN: Record<Terrain, { name: string; tint: [number, number, number] }> = {
  plains: { name: "The Heartlands", tint: [78, 88, 58] },
  forest: { name: "Thornwood", tint: [48, 70, 45] },
  desert: { name: "Ashen Waste", tint: [112, 96, 62] },
  swamp: { name: "Mire Fen", tint: [52, 70, 64] },
  volcanic: { name: "Bloodmoon Barrens", tint: [86, 47, 41] },
  snow: { name: "Frostspine", tint: [94, 101, 112] },
  coast: { name: "Shattered Coast", tint: [58, 74, 96] },
  astral: { name: "Starfall Reach", tint: [64, 56, 96] },
};

export const terrainName = (t: Terrain) => TERRAIN[t].name;

export type SiteKind = RaidKind | "ruin" | "keep" | "landmark" | "cache";

export interface CastleLord {
  name: string;
  cls: HeroClass;
  gender: "male" | "female";
  level: number;
  power: number;
  gold: number;
  look: number;
}

export interface WorldSite {
  id: string;
  kind: SiteKind;
  /** World coordinates, not screen or percent. */
  x: number;
  y: number;
  name: string;
  desc: string;
  /** Danger level, rising with the distance from the Citadel at the centre. */
  level: number;
  terrain: Terrain;
  /** The server raid node that pays this site's reward, when it has one. */
  node?: string;
  lord?: CastleLord;
}

export type WorldFoe = Foe & {
  sprite?: SpriteRect;
  cls?: HeroClass;
  gender?: "male" | "female";
  look?: number;
};

export interface WorldRegion {
  id: string;
  name: string;
  terrain: Terrain;
  /** Percent rectangle on the painted map. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The painted biomes of the map art, in reading order. */
export const WORLD_REGIONS: WorldRegion[] = [
  { id: "frozen-crown", name: "The Frozen Crown", terrain: "snow", x: 2, y: 1, w: 54, h: 20 },
  { id: "obsidian-wastes", name: "The Obsidian Wastes", terrain: "volcanic", x: 58, y: 1, w: 22, h: 32 },
  { id: "autumnwood", name: "Autumnwood", terrain: "forest", x: 80, y: 1, w: 18, h: 28 },
  { id: "ashen-waste", name: "The Ashen Waste", terrain: "desert", x: 1, y: 21, w: 26, h: 34 },
  { id: "heartlands", name: "The Heartlands", terrain: "plains", x: 26, y: 19, w: 34, h: 52 },
  { id: "highreach", name: "Highreach Falls", terrain: "forest", x: 60, y: 31, w: 24, h: 28 },
  { id: "starfall", name: "The Starfall Reach", terrain: "astral", x: 84, y: 27, w: 15, h: 30 },
  { id: "sunken-isles", name: "The Sunken Isles", terrain: "coast", x: 1, y: 54, w: 26, h: 44 },
  { id: "mire-fen", name: "Mire Fen", terrain: "swamp", x: 26, y: 70, w: 26, h: 28 },
  { id: "shattered-coast", name: "The Shattered Coast", terrain: "volcanic", x: 52, y: 58, w: 46, h: 40 },
];

/** Points of interest the art itself paints: lookouts, not raid targets. */
const LANDMARKS: { name: string; x: number; y: number; desc: string; terrain: Terrain }[] = [
  { name: "The Great Citadel", x: 48, y: 47, desc: "EmberFall's high seat, ringed by rivers — the heart of the realm.", terrain: "plains" },
  { name: "Pyramids of the Ashen Waste", x: 9, y: 37, desc: "Sun-bleached tombs older than any kingdom.", terrain: "desert" },
  { name: "The Frozen Crown", x: 34, y: 7, desc: "Glaciers and aurora light over the northern peaks.", terrain: "snow" },
  { name: "Obsidian Forge", x: 69, y: 15, desc: "Lava runs like a forge channel through black rock.", terrain: "volcanic" },
  { name: "Whispering Falls", x: 65, y: 44, desc: "A hundred waterfalls comb the eastern mountains.", terrain: "forest" },
  { name: "The Starfall Hollow", x: 90, y: 44, desc: "A dark well of stars burned into the living rock.", terrain: "astral" },
  { name: "Western Outpost", x: 3, y: 55, desc: "The last stone footing before the western sea.", terrain: "coast" },
  { name: "Autumnwood", x: 89, y: 14, desc: "Copper and gold canopies that never fall.", terrain: "forest" },
  { name: "The Great Whirlpool", x: 12, y: 72, desc: "Sailors swear it swallows whole fleets.", terrain: "coast" },
  { name: "Sunken Kingdom", x: 19, y: 88, desc: "Ruined towers in waist-deep archipelago water.", terrain: "swamp" },
  { name: "The Shattered Coast", x: 71, y: 86, desc: "Jagged islands lit by veins of violet glow.", terrain: "volcanic" },
  { name: "Aurora Gate", x: 94, y: 5, desc: "Where the northern lights touch the ice.", terrain: "snow" },
  { name: "The Bell of Autumnwood", x: 85, y: 18, desc: "A copper bell the size of a keep, rung by the wind.", terrain: "forest" },
  { name: "The Drowned Chapel", x: 8, y: 78, desc: "Its spire breaks the water at every low tide.", terrain: "coast" },
  { name: "The Salt Road", x: 46, y: 24, desc: "Old paving stones running arrow-straight across the Heartlands.", terrain: "plains" },
  { name: "The Loom of Stars", x: 88, y: 33, desc: "A ring of pillars that weaves the night sky into thread.", terrain: "astral" },
  { name: "Frostspine Monolith", x: 20, y: 5, desc: "A single black stone that the snow will not settle on.", terrain: "snow" },
  { name: "Cinderfall Bridge", x: 63, y: 25, desc: "An arch of cooled lava over a river of fire.", terrain: "volcanic" },
  { name: "The Quiet Thicket", x: 33, y: 63, desc: "A grove where even the bees fly without a sound.", terrain: "plains" },
  { name: "Graven Stones", x: 12, y: 60, desc: "Nine standing stones cut with the names of dead kings.", terrain: "coast" },
  { name: "Tower of the Ninth Bell", x: 30, y: 84, desc: "A leaning tower half-swallowed by the fen.", terrain: "swamp" },
  { name: "The Emberfall Gate", x: 52, y: 61, desc: "The old southern road out of the Heartlands, still burning.", terrain: "volcanic" },
];

const GOLD_NAMES = [
  "Sunken Treasury",
  "Gilded Hollow",
  "Merchant's Folly",
  "Azure Claim",
  "King's Cache",
  "Rivergilt Mine",
  "Embergilt Depths",
  "Copperfall Mine",
  "The Weeping Vault",
  "Dragonhoard Cellar",
  "Widow's Purse",
  "The Pale Mint",
  "Goldwater Sink",
  "Lantern Vault",
];
const ORE_NAMES = [
  "Verdant Warrens",
  "Mossvein Cavern",
  "Thornpick Delve",
  "Greenfall Excavation",
  "Emerald Maw",
  "Ironspine Quarry",
  "The Deep Seam",
  "Cinderworks",
  "Stonewake Mine",
  "The Long Cut",
  "Greyfall Pit",
  "The Sunken Seam",
  "Ironbell Quarry",
  "Hollowvein Works",
];
const BOSS_NAMES = [
  "Iron Overlord",
  "Gorefiend",
  "Ember Titan",
  "The Ashen Wyrm",
  "Dread Colossus",
  "Marrow King",
  "The Hollow Saint",
  "Warlord Vex",
  "The Pale Matron",
  "Grinder of Skulls",
  "The Iron Choir",
  "Vaultkeeper Ossun",
  "Mother Cinder",
  "The Ninth Bell",
  "Hollowmaw",
];
const RUIN_NAMES = [
  "Ruined Keep",
  "Broken Spire",
  "Fallen Bastion",
  "Sunken Citadel",
  "Mossgrown Hold",
  "Blackstone Ruin",
  "The Silent Court",
  "Ashen Watch",
  "Hollow Hall",
  "Graven Keep",
  "Rookery Fall",
  "The Grey Bastion",
  "Saltstone Hold",
  "The Weeping Court",
  "Nine Bell Ruin",
];
const CACHE_NAMES = [
  "Sealed Vault",
  "The Old Mint",
  "Forgotten Treasury",
  "Vault of the Ninth Bell",
  "The Grey Coffer",
  "Star-locked Crypt",
  "Cinder Vault",
  "The Root Cellar",
  "Tidebound Hoard",
  "The Quiet Cache",
];
const LORD_FIRST = [
  "Aldric", "Bryn", "Cassia", "Dorian", "Eira", "Fenrir", "Gwen", "Halvard", "Ilsa", "Jorund",
  "Kael", "Lyra", "Magnus", "Nadia", "Osric", "Perrin", "Quill", "Rhea", "Soren", "Tamsin",
  "Ulric", "Vesna", "Wren", "Yara",
];
const LORD_HOUSE = [
  "of the Ember Watch", "the Iron Hand", "of Thornwood", "the Ashen", "of the Grey March",
  "the Bloodsworn", "of Frostspine", "the Unbowed", "of the Broken Crown", "the Nightjar",
];

function hash2(x: number, y: number, seed = 0): number {
  let h =
    Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function randomFrom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rand: () => number, items: readonly T[]): T =>
  items[Math.floor(rand() * items.length) % items.length]!;

/** Danger rises the further the player travels from the Citadel at the centre. */
export function levelAt(x: number, y: number): number {
  const dx = (x - WORLD_W / 2) / (WORLD_W / 2);
  const dy = (y - WORLD_H / 2) / (WORLD_H / 2);
  return Math.max(1, Math.round(1 + Math.hypot(dx, dy) * 44));
}

/** The painted biome under a world point. */
export function regionAt(x: number, y: number): WorldRegion {
  const px = (x / WORLD_W) * 100;
  const py = (y / WORLD_H) * 100;
  return (
    WORLD_REGIONS.find((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) ??
    WORLD_REGIONS[4]!
  );
}

export const terrainAt = (x: number, y: number): Terrain => regionAt(x, y).terrain;

function makeLord(rand: () => number, level: number): CastleLord {
  const cls = pick(rand, ["warrior", "archer", "mage"] as HeroClass[]);
  return {
    name: `${pick(rand, LORD_FIRST)} ${pick(rand, LORD_HOUSE)}`,
    cls,
    gender: rand() < 0.5 ? "male" : "female",
    level,
    power: battleRating(40 + level * 18, level),
    gold: 200 + level * 45,
    look: Math.floor(rand() * 8),
  };
}

/** Sites each painted region carries: raid targets, rival keeps, claiming ruins and sealed vaults. */
const REGION_CONTENT = [
  { gold: 5, ore: 5, boss: 2, keep: 6, ruin: 13, cache: 2 },
  { gold: 5, ore: 6, boss: 3, keep: 6, ruin: 11, cache: 2 },
  { gold: 3, ore: 3, boss: 2, keep: 5, ruin: 10, cache: 2 },
  { gold: 6, ore: 5, boss: 2, keep: 5, ruin: 13, cache: 2 },
  { gold: 6, ore: 6, boss: 3, keep: 8, ruin: 14, cache: 2 },
  { gold: 5, ore: 5, boss: 2, keep: 6, ruin: 11, cache: 2 },
  { gold: 3, ore: 3, boss: 2, keep: 5, ruin: 8, cache: 2 },
  { gold: 5, ore: 3, boss: 2, keep: 5, ruin: 14, cache: 2 },
  { gold: 3, ore: 3, boss: 2, keep: 5, ruin: 11, cache: 2 },
  { gold: 6, ore: 5, boss: 3, keep: 8, ruin: 14, cache: 2 },
];

function buildRealm(): WorldSite[] {
  const sites: WorldSite[] = [];
  const add = (site: Omit<WorldSite, "level" | "terrain"> & { terrain: Terrain }) => {
    sites.push({ ...site, level: levelAt(site.x, site.y) });
  };

  WORLD_REGIONS.forEach((region, ri) => {
    const rand = randomFrom(Math.floor(hash2(ri, 7, 331) * 4294967296));
    const content = REGION_CONTENT[ri] ?? REGION_CONTENT[4]!;
    // Keep sites a little inside the painted biome so nothing stands in the sea.
    const mx = region.w * 0.1;
    const my = region.h * 0.14;
    const place = (): { x: number; y: number } => ({
      x: Math.round(((region.x + mx + rand() * (region.w - mx * 2)) / 100) * WORLD_W),
      y: Math.round(((region.y + my + rand() * (region.h - my * 2)) / 100) * WORLD_H),
    });

    for (let i = 0; i < content.gold; i += 1) {
      const { x, y } = place();
      add({
        id: `${region.id}:gold:${i}`,
        kind: "gold",
        x,
        y,
        name: pick(rand, GOLD_NAMES),
        desc: "A guarded mine shaft glittering with gold.",
        terrain: region.terrain,
        node: `gold-${1 + Math.floor(rand() * 7)}`,
      });
    }
    for (let i = 0; i < content.ore; i += 1) {
      const { x, y } = place();
      add({
        id: `${region.id}:ore:${i}`,
        kind: "ore",
        x,
        y,
        name: pick(rand, ORE_NAMES),
        desc: "An ore seam held by something with teeth.",
        terrain: region.terrain,
        node: `ore-${1 + Math.floor(rand() * 5)}`,
      });
    }
    for (let i = 0; i < content.boss; i += 1) {
      const { x, y } = place();
      add({
        id: `${region.id}:boss:${i}`,
        kind: "boss",
        x,
        y,
        name: pick(rand, BOSS_NAMES),
        desc: "A tyrant's lair. Boss cores and starshards lie within.",
        terrain: region.terrain,
        node: `boss-${1 + Math.floor(rand() * 3)}`,
      });
    }
    for (let i = 0; i < content.keep; i += 1) {
      const { x, y } = place();
      const lord = makeLord(rand, levelAt(x, y));
      add({
        id: `${region.id}:keep:${i}`,
        kind: "keep",
        x,
        y,
        name: `${lord.name.split(" ")[0]}'s Hold`,
        desc: "A rival lord's castle. Raid it for plunder while your daily raids last.",
        terrain: region.terrain,
        lord,
      });
    }
    for (let i = 0; i < content.ruin; i += 1) {
      const { x, y } = place();
      add({
        id: `${region.id}:ruin:${i}`,
        kind: "ruin",
        x,
        y,
        name: pick(rand, RUIN_NAMES),
        desc: "An abandoned castle. Plant your banner here, or claim it as a raiding camp.",
        terrain: region.terrain,
      });
    }
    for (let i = 0; i < content.cache; i += 1) {
      const { x, y } = place();
      add({
        id: `${region.id}:cache:${i}`,
        kind: "cache",
        x,
        y,
        name: pick(rand, CACHE_NAMES),
        desc: "A vault sealed by the old realm. Break its warden, and the hoard inside is yours — once.",
        terrain: region.terrain,
      });
    }
  });

  for (const l of LANDMARKS) {
    add({
      id: `landmark:${l.name}`,
      kind: "landmark",
      x: Math.round((l.x / 100) * WORLD_W),
      y: Math.round((l.y / 100) * WORLD_H),
      name: l.name,
      desc: l.desc,
      terrain: l.terrain,
    });
  }

  // The authored raid nodes sit in the Heartlands, where every hero starts.
  for (const n of MAP_NODES) {
    const x = Math.round(WORLD_W / 2 + ((n.x - 50) / 100) * WORLD_W * 0.34);
    const y = Math.round(WORLD_H / 2 + ((n.y - 50) / 100) * WORLD_H * 0.5);
    add({
      id: `home-${n.id}`,
      kind: n.kind,
      x,
      y,
      name: n.name,
      desc: n.desc,
      terrain: terrainAt(x, y),
      node: n.id,
    });
  }

  return sites;
}

/** Every site standing in the realm, authored once from the painted map. */
export const WORLD_SITES: WorldSite[] = buildRealm();

export const sitesOfKind = (kind: SiteKind) => WORLD_SITES.filter((s) => s.kind === kind);

/** Every site inside a world-space rectangle. */
export function sitesInView(left: number, top: number, right: number, bottom: number): WorldSite[] {
  return WORLD_SITES.filter((s) => s.x >= left && s.x <= right && s.y >= top && s.y <= bottom);
}

/** The closest abandoned castle to a point, used to suggest where a banner can fly. */
export function nearestRuin(x: number, y: number): WorldSite | null {
  let best: WorldSite | null = null;
  let bestDist = Infinity;
  for (const site of WORLD_SITES) {
    if (site.kind !== "ruin") continue;
    const d = Math.hypot(site.x - x, site.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = site;
    }
  }
  return best;
}

/* ------------------------------ camera ------------------------------ */

export interface Camera {
  x: number;
  y: number;
  z: number;
}
export interface StageSize {
  w: number;
  h: number;
}

/** The zoom at which the whole painted realm fits inside the stage. */
export const fitZoom = (size: StageSize) =>
  Math.max(0.02, Math.min(size.w / WORLD_W, size.h / WORLD_H));

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Keep the camera over the painted realm: no endless ground past the edge. */
export function clampCamera(cam: Camera, size: StageSize): Camera {
  const z = clamp(cam.z, fitZoom(size), MAX_ZOOM);
  const halfW = size.w / 2 / z;
  const halfH = size.h / 2 / z;
  return {
    z,
    x: halfW * 2 >= WORLD_W ? WORLD_W / 2 : clamp(cam.x, halfW, WORLD_W - halfW),
    y: halfH * 2 >= WORLD_H ? WORLD_H / 2 : clamp(cam.y, halfH, WORLD_H - halfH),
  };
}

/** Zoom about a point on the stage, keeping that point under the cursor. */
export function zoomCamera(cam: Camera, size: StageSize, factor: number, px: number, py: number): Camera {
  const next = clampCamera({ ...cam, z: cam.z * factor }, size);
  const wx = cam.x + (px - size.w / 2) / cam.z;
  const wy = cam.y + (py - size.h / 2) / cam.z;
  return clampCamera({ x: wx - (px - size.w / 2) / next.z, y: wy - (py - size.h / 2) / next.z, z: next.z }, size);
}

/* ------------------------------ clusters ------------------------------ */

export interface MapCluster<T> {
  key: string;
  x: number;
  y: number;
  items: T[];
}

/**
 * Group markers that would land on the same few pixels, so a realm of thousands of
 * banners stays readable. `cell` is the bucket width in screen pixels; 0 disables it.
 */
export function clusterMarkers<T extends { id: string; x: number; y: number }>(
  items: T[],
  toScreen: (x: number, y: number) => { left: number; top: number },
  cell: number,
): MapCluster<T>[] {
  if (cell <= 0) return items.map((i) => ({ key: i.id, x: i.x, y: i.y, items: [i] }));
  const buckets = new Map<string, MapCluster<T>>();
  for (const item of items) {
    const p = toScreen(item.x, item.y);
    const key = `${Math.floor(p.left / cell)}:${Math.floor(p.top / cell)}`;
    const found = buckets.get(key);
    if (found) {
      found.items.push(item);
      found.x = (found.x * (found.items.length - 1) + item.x) / found.items.length;
      found.y = (found.y * (found.items.length - 1) + item.y) / found.items.length;
    } else buckets.set(key, { key, x: item.x, y: item.y, items: [item] });
  }
  return [...buckets.values()];
}

/* ------------------------------ encounters ------------------------------ */

/** The encounter standing at a site, scaled to the hero so far travel stays a fight. */
export function siteFoe(site: WorldSite, heroLevel: number): WorldFoe {
  const level = Math.max(2, site.level, Math.round(heroLevel));
  // stageFoe marks every tenth stage as a boss; a camp should not become one by accident.
  const stage = level % 10 === 0 ? level + 1 : level;

  if (site.kind === "boss") {
    const idx = Math.max(0, Number(site.node?.split("-")[1] ?? 1) - 1);
    return dungeonFoe(DUNGEONS[idx % DUNGEONS.length]!, level);
  }
  if (site.kind === "cache") {
    const idx = Math.max(0, Number(site.id.split(":").pop() ?? 0));
    return {
      ...stageFoe(stage, 1.15, undefined, "Vault Warden"),
      sprite: enemySprite(2, idx % 4),
    };
  }
  if (site.kind === "keep" && site.lord) {
    const lord = site.lord;
    const base = stageFoe(stage, 1.1, undefined, lord.name);
    return {
      ...base,
      img: CLASSES[lord.cls].img,
      cls: lord.cls,
      gender: lord.gender,
      look: lord.look,
      level: Math.max(lord.level, level),
    };
  }
  const gold = site.kind === "gold";
  const idx = Math.max(0, Number(site.node?.split("-")[1] ?? 1) - 1);
  return {
    ...stageFoe(stage, gold ? 0.95 : 1.05, undefined, gold ? "Mine Guardian" : "Ore Gnasher"),
    sprite: enemySprite(gold ? 1 : 0, idx % 4),
  };
}

/** What a broken vault pays: gold and forge stock, richer the deadlier the ground it was sealed on.
 *  It pays once per hero — the seal does not mend. */
export function cacheReward(site: WorldSite, heroLevel: number) {
  const danger = Math.max(site.level, Math.round(heroLevel));
  return {
    gold: goldGain(70 + danger * 16, heroLevel),
    mats: { ore: 4 + Math.floor(danger / 8), essence: danger >= 25 ? 2 : 1 },
  };
}
