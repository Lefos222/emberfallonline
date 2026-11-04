import { z } from "zod";
import { CLASSES, stageFoe, type Foe, type HeroClass } from "./data";
import { dungeonFoe, DUNGEONS, enemySprite, type SpriteRect } from "./world";

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

/* ------------------------------------------------------------------------- *
 * The endless world
 *
 * Past the authored home region the map has no edge: it is generated from the
 * sector's own coordinates, so the same ground and the same keeps are always
 * there when the player comes back. Nothing here is saved — a sector's contents
 * are a pure function of its coordinates. Only the player's own castle (see
 * worldcastles.ts) is remembered.
 * ------------------------------------------------------------------------- */

export type Terrain = "plains" | "forest" | "desert" | "swamp" | "volcanic" | "snow";

export const TERRAIN: Record<Terrain, { name: string; tint: [number, number, number] }> = {
  plains: { name: "The Heartlands", tint: [78, 88, 58] },
  forest: { name: "Thornwood", tint: [48, 70, 45] },
  desert: { name: "Ashen Waste", tint: [112, 96, 62] },
  swamp: { name: "Mire Fen", tint: [52, 70, 64] },
  volcanic: { name: "Bloodmoon Barrens", tint: [86, 47, 41] },
  snow: { name: "Frostspine", tint: [94, 101, 112] },
};

/** World units covered by one pass of the seamless ground texture. */
export const WORLD_TILE = 4096;
/** One generated sector of the endless map, in world units. */
export const SECTOR = 1500;
/** How many times a day another lord's castle may be raided. */
export const CASTLE_RAIDS_PER_DAY = 3;

export type SiteKind = RaidKind | "ruin" | "keep";

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
  /** Danger level, rising with the distance from the home region. */
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

function lattice(i: number, j: number, period: number, seed: number): number {
  const x = ((i % period) + period) % period;
  const y = ((j % period) + period) % period;
  return hash2(x, y, seed);
}

/** Value noise that wraps every `period` lattice cells, so the ground texture tiles seamlessly. */
function smoothNoise(x: number, y: number, period: number, seed: number): number {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = lattice(xi, yi, period, seed),
    b = lattice(xi + 1, yi, period, seed);
  const c = lattice(xi, yi + 1, period, seed),
    d = lattice(xi + 1, yi + 1, period, seed);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

/** The ground at a world point. Periodic, so the painted terrain tiles without seams. */
export function terrainAt(x: number, y: number): Terrain {
  const broad = smoothNoise(x / 512, y / 512, 8, 17);
  const fine = smoothNoise(x / 128, y / 128, 32, 41);
  const n = broad * 0.68 + fine * 0.32;
  if (n < 0.2) return "swamp";
  if (n < 0.38) return "forest";
  if (n < 0.58) return "plains";
  if (n < 0.72) return "desert";
  if (n < 0.86) return "volcanic";
  return "snow";
}

export const terrainName = (t: Terrain) => TERRAIN[t].name;

/** Danger rises the further the player travels from the home region. */
export function levelAt(x: number, y: number): number {
  return Math.max(1, Math.round(Math.hypot(x, y) / 900));
}

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
];
const LORD_FIRST = [
  "Aldric",
  "Bryn",
  "Cassia",
  "Dorian",
  "Eira",
  "Fenrir",
  "Gwen",
  "Halvard",
  "Ilsa",
  "Jorund",
  "Kael",
  "Lyra",
  "Magnus",
  "Nadia",
  "Osric",
  "Perrin",
  "Quill",
  "Rhea",
  "Soren",
  "Tamsin",
  "Ulric",
  "Vesna",
  "Wren",
  "Yara",
];
const LORD_HOUSE = [
  "of the Ember Watch",
  "the Iron Hand",
  "of Thornwood",
  "the Ashen",
  "of the Grey March",
  "the Bloodsworn",
  "of Frostspine",
  "the Unbowed",
  "of the Broken Crown",
  "the Nightjar",
];

function makeLord(rand: () => number, level: number): CastleLord {
  const cls = pick(rand, ["warrior", "archer", "mage"] as HeroClass[]);
  return {
    name: `${pick(rand, LORD_FIRST)} ${pick(rand, LORD_HOUSE)}`,
    cls,
    gender: rand() < 0.5 ? "male" : "female",
    level,
    power: 40 + level * 18,
    gold: 200 + level * 45,
    look: Math.floor(rand() * 8),
  };
}

const SECTOR_CACHE = new Map<string, WorldSite[]>();

/** Every site standing in one sector. Deterministic: the same sector always yields the same world. */
export function sectorSites(sx: number, sy: number): WorldSite[] {
  const key = `${sx}:${sy}`;
  const cached = SECTOR_CACHE.get(key);
  if (cached) return cached;

  const rand = randomFrom(Math.floor(hash2(sx, sy, 9277) * 4294967296));
  const cx = (sx + 0.5) * SECTOR;
  const cy = (sy + 0.5) * SECTOR;
  const sites: WorldSite[] = [];
  const add = (
    kind: SiteKind,
    name: string,
    desc: string,
    extra: Partial<WorldSite> = {},
  ): WorldSite => {
    const x = cx + (rand() - 0.5) * (SECTOR - 300);
    const y = cy + (rand() - 0.5) * (SECTOR - 300);
    const site: WorldSite = {
      id: `${key}:${sites.length}`,
      kind,
      x,
      y,
      name,
      desc,
      level: levelAt(x, y),
      terrain: terrainAt(x, y),
      ...extra,
    };
    sites.push(site);
    return site;
  };

  for (let i = 0; i < 4; i += 1) {
    if (rand() < 0.55) {
      add("gold", pick(rand, GOLD_NAMES), "A guarded mine shaft glittering with gold.", {
        node: `gold-${1 + Math.floor(rand() * 7)}`,
      });
    } else {
      add("ore", pick(rand, ORE_NAMES), "An ore seam held by something with teeth.", {
        node: `ore-${1 + Math.floor(rand() * 5)}`,
      });
    }
  }
  if (rand() < 0.85) {
    add("boss", pick(rand, BOSS_NAMES), "A tyrant's lair. Boss cores and starshards lie within.", {
      node: `boss-${1 + Math.floor(rand() * 3)}`,
    });
  }

  const keep = add(
    "keep",
    "Rival keep",
    "A rival lord's castle. Raid it for plunder while your daily raids last.",
  );
  keep.lord = makeLord(rand, keep.level);
  keep.name = `${keep.lord.name.split(" ")[0]}'s Hold`;

  add(
    "ruin",
    `${pick(rand, RUIN_NAMES)}`,
    "An abandoned castle. Claim it to move your own castle here.",
  );
  if (rand() < 0.6)
    add(
      "ruin",
      `${pick(rand, RUIN_NAMES)}`,
      "An abandoned castle. Claim it to move your own castle here.",
    );

  SECTOR_CACHE.set(key, sites);
  return sites;
}

/** The authored raid nodes, laid into the world around the home region. */
export const HOME_NODES: WorldSite[] = MAP_NODES.map((n) => {
  const x = (n.x - 50) * 34;
  const y = (n.y - 50) * 26;
  return {
    id: `home-${n.id}`,
    kind: n.kind,
    x,
    y,
    name: n.name,
    desc: n.desc,
    level: levelAt(x, y),
    terrain: terrainAt(x, y),
    node: n.id,
  };
});

/** Every site inside a world-space rectangle, the home nodes included. */
export function sitesInView(
  left: number,
  top: number,
  right: number,
  bottom: number,
  limit = 320,
): WorldSite[] {
  const out: WorldSite[] = [];
  const sx0 = Math.floor(left / SECTOR),
    sx1 = Math.floor(right / SECTOR);
  const sy0 = Math.floor(top / SECTOR),
    sy1 = Math.floor(bottom / SECTOR);
  for (let sy = sy0; sy <= sy1; sy += 1) {
    for (let sx = sx0; sx <= sx1; sx += 1) {
      for (const site of sectorSites(sx, sy)) {
        if (site.x >= left && site.x <= right && site.y >= top && site.y <= bottom) out.push(site);
      }
    }
  }
  for (const site of HOME_NODES) {
    if (site.x >= left && site.x <= right && site.y >= top && site.y <= bottom) out.push(site);
  }
  return out.length > limit ? out.slice(0, limit) : out;
}

/** The closest abandoned castle, used when the player has no castle on the map yet. */
export function nearestRuin(x: number, y: number): WorldSite | null {
  const sx = Math.floor(x / SECTOR),
    sy = Math.floor(y / SECTOR);
  let best: WorldSite | null = null;
  let bestDist = Infinity;
  for (let ring = 0; ring <= 6; ring += 1) {
    for (let dy = -ring; dy <= ring; dy += 1) {
      for (let dx = -ring; dx <= ring; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
        for (const site of sectorSites(sx + dx, sy + dy)) {
          if (site.kind !== "ruin") continue;
          const d = Math.hypot(site.x - x, site.y - y);
          if (d < bestDist) {
            bestDist = d;
            best = site;
          }
        }
      }
    }
    if (best) return best;
  }
  return best;
}

/** The encounter standing at a site, scaled to the hero so far travel stays a fight. */
export function siteFoe(site: WorldSite, heroLevel: number): WorldFoe {
  const level = Math.max(2, site.level, Math.round(heroLevel));
  // stageFoe marks every tenth stage as a boss; a camp should not become one by accident.
  const stage = level % 10 === 0 ? level + 1 : level;

  if (site.kind === "boss") {
    const idx = Math.max(0, Number(site.node?.split("-")[1] ?? 1) - 1);
    return dungeonFoe(DUNGEONS[idx % DUNGEONS.length]!, level);
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
