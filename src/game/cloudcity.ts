// ============= Cloud City: the floating sky realm above Ember Fall =============
// A second, completely different region: an isometric city of marble and wind where the
// hero walks between buildings and citizens instead of standing still at the castle.
//
// Everything here is data plus pure rules: the map layout, the citizens, the daily
// commissions they hand out and the Aether Ascension tracks. The tracks reach combat
// through the same shared bonus pipeline as drills, gems and Astrals (see data.ts
// computeStats), so no second stat engine is introduced.

import type { Hero } from "./data";
import type { BonusFx } from "./crafting";
import { greekDayStart } from "./events";
import { scaledGold } from "./gold";
import { grant } from "./logic";

export const GRID = 16;
export const SHARD_NAME = "Aether Shard";
export const SHARD_ICON = "◆";

export type CloudStat = "atkPct" | "defPct" | "hpPct" | "crit" | "dodge" | "heal";

export interface CloudState {
  /** Greek calendar day this snapshot belongs to. */
  day: string;
  shards: number;
  /** Aether Ascension ranks by track id (permanent, never reset). */
  ranks: Record<string, number>;
  /** Citizens spoken to today. */
  talks: string[];
  /** City buildings entered today. */
  visits: string[];
  /** Tiles walked through the city today. */
  steps: number;
  /** Daily shard gifts already collected, by citizen id. */
  tithed: string[];
  /** Vault blessing taken today. */
  blessed?: boolean;
  /** Commissions claimed today. */
  claimed: string[];
  /** Lifetime counters captured when the day rolled over. */
  base: { wins: number; ranks: number };
}

export const cloudDay = (now = Date.now()) =>
  new Date(greekDayStart(now)).toISOString().slice(0, 10);
export const cloudResetAt = (now = Date.now()) => greekDayStart(now) + 86400000;

const STARTER_SHARDS = 6;

/** Read-only view of the city state; never writes to the hero. */
export function cloudOf(h: Pick<Hero, "cloud" | "record">, now = Date.now()): CloudState {
  const day = cloudDay(now);
  const c = h.cloud;
  if (c && c.day === day) return c;
  return {
    day,
    shards: c?.shards ?? STARTER_SHARDS,
    ranks: c?.ranks ?? {},
    talks: [],
    visits: [],
    steps: 0,
    tithed: [],
    claimed: [],
    base: { wins: h.record?.wins ?? 0, ranks: ascTotal(c) },
  };
}

/** Bring the saved state up to today: daily counters reset, shards and ranks are kept. */
export function rollCloud(h: Hero, now = Date.now()): CloudState {
  const day = cloudDay(now);
  const cur = h.cloud;
  if (cur && cur.day === day) return cur;
  const fresh: CloudState = {
    day,
    shards: cur?.shards ?? STARTER_SHARDS,
    ranks: cur?.ranks ?? {},
    talks: [],
    visits: [],
    steps: 0,
    tithed: [],
    blessed: false,
    claimed: [],
    base: { wins: h.record?.wins ?? 0, ranks: ascTotal(cur) },
  };
  h.cloud = fresh;
  return fresh;
}

export const shards = (h: Pick<Hero, "cloud">) => Math.max(0, cloudOf(h).shards);

// ---------- Aether Ascension: the city's own upgrade track ----------
export interface Ascension {
  id: string;
  name: string;
  stat: CloudStat;
  /** What one rank grants, in the stat's own unit. */
  per: number;
  max: number;
  /** Shards for the first rank; each further rank costs a quarter more. */
  base: number;
  desc: string;
}

export const ASC_STAT_LABEL: Record<CloudStat, string> = {
  atkPct: "attack",
  defPct: "defense",
  hpPct: "health",
  crit: "crit chance",
  dodge: "dodge",
  heal: "healing power",
};

export const ASCENSIONS: Ascension[] = [
  {
    id: "might",
    name: "Sky Might",
    stat: "atkPct",
    per: 1.5,
    max: 20,
    base: 2,
    desc: "The high wind behind every strike.",
  },
  {
    id: "vigor",
    name: "Cloud Vitality",
    stat: "hpPct",
    per: 2,
    max: 20,
    base: 2,
    desc: "Thin air, wide lungs, a deeper well of life.",
  },
  {
    id: "ward",
    name: "Aether Ward",
    stat: "defPct",
    per: 1.5,
    max: 20,
    base: 2,
    desc: "A shell of hardened light turns blades aside.",
  },
  {
    id: "focus",
    name: "Star Focus",
    stat: "crit",
    per: 0.4,
    max: 15,
    base: 3,
    desc: "Read an opening from a mile above the field.",
  },
  {
    id: "windstep",
    name: "Windstep",
    stat: "dodge",
    per: 0.3,
    max: 15,
    base: 3,
    desc: "Step between gusts and nothing lands on you.",
  },
  {
    id: "grace",
    name: "Dawn Grace",
    stat: "heal",
    per: 0.5,
    max: 12,
    base: 4,
    desc: "The city's first light mends what battle breaks.",
  },
];

export const ascRank = (h: Pick<Hero, "cloud">, id: string) =>
  Math.max(0, h.cloud?.ranks?.[id] ?? 0);
export const ascCost = (a: Ascension, rank: number) => Math.round(a.base * (1 + rank * 0.25));
export const ascText = (a: Ascension, ranks = 1) =>
  `+${+(a.per * ranks).toFixed(1)}% ${ASC_STAT_LABEL[a.stat]}`;

export function ascTotal(c: { ranks?: Record<string, number> } | undefined | null): number {
  const ranks = c?.ranks ?? {};
  return ASCENSIONS.reduce((n, a) => n + Math.max(0, ranks[a.id] ?? 0), 0);
}

/** Every bonus the hero's Ascension ranks grant, in the shared bonus shape. */
export function cloudFx(h: Pick<Hero, "cloud">): Partial<BonusFx> {
  const out: Partial<BonusFx> = {};
  for (const a of ASCENSIONS) {
    const r = ascRank(h, a.id);
    if (r > 0) out[a.stat] = (out[a.stat] ?? 0) + a.per * r;
  }
  return out;
}

/** Why the next rank can't be bought, or null when it can. */
export function ascBlocker(h: Hero, id: string): string | null {
  const a = ASCENSIONS.find((x) => x.id === id);
  if (!a) return "Unknown path";
  if (ascRank(h, id) >= a.max) return "Fully ascended";
  if (cloudOf(h).shards < ascCost(a, ascRank(h, id))) return "Not enough Aether Shards";
  return null;
}

/** Buy one Ascension rank with shards. Returns an error message, or null on success. */
export function buyAscension(h: Hero, id: string): string | null {
  const blocked = ascBlocker(h, id);
  if (blocked) return blocked;
  const a = ASCENSIONS.find((x) => x.id === id)!;
  const rank = ascRank(h, id);
  const st = rollCloud(h);
  st.shards -= ascCost(a, rank);
  st.ranks = { ...st.ranks, [id]: rank + 1 };
  return null;
}

// ---------- Citizens ----------
export type NpcLook = "robe" | "guard" | "merchant" | "mage" | "smith" | "child";

export interface CityNpc {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  look: NpcLook;
  color: string;
  /** Shards handed out the first time you speak to them each day. */
  gift?: number;
  lines: string[];
}

export const NPCS: CityNpc[] = [
  {
    id: "seraphine",
    name: "Seraphine",
    role: "Warden of the Azure Gate",
    x: 8.6,
    y: 12.4,
    look: "robe",
    color: "#6aa6d8",
    gift: 1,
    lines: [
      "You came up the long stair from the castle. Good — the city has been waiting for someone with blood on their boots.",
      "Walk among the people today. Speak with four of them, and I will stamp your commission myself.",
      "The Mistress of Missions keeps the board in the plaza. Everything up here is written down. Nothing is forgotten.",
    ],
  },
  {
    id: "orrin",
    name: "Orrin",
    role: "Sky Smith",
    x: 9.9,
    y: 4.6,
    look: "smith",
    color: "#c9884f",
    gift: 1,
    lines: [
      "Aether is a stubborn metal. It will not bend for a hammer — only for a person who has already bent themselves.",
      "Take a rank in the Ascension and I will forge the pattern of it into your bones. The Nexus is behind me.",
      "Shards for ranks. Ranks for strength. Strength for the next siege. That is how the city counts.",
    ],
  },
  {
    id: "liriel",
    name: "Liriel",
    role: "Star Cartographer",
    x: 5.4,
    y: 8.8,
    look: "mage",
    color: "#8f7ad6",
    lines: [
      "Every star above this island is on one of my maps. Every one of them is wrong by the width of a feather.",
      "Below you the castle looks like a toy. From the right height, everything looks like a toy.",
      "If you find a shard of sky glass in the market, bring it to me. I pay in gossip.",
    ],
  },
  {
    id: "bram",
    name: "Bram",
    role: "Market Crier",
    x: 10.9,
    y: 9.4,
    look: "merchant",
    color: "#d8a13c",
    gift: 1,
    lines: [
      "Silk from the lower clouds! Ink that dries in the sunlight! A bell that rings in a colour!",
      "You look like a hero with an empty purse and a full schedule. Talk to the board — commissions pay in shards.",
      "Shards buy ascension. Ascension buys the kind of strength that keeps the city afloat. Take a tip from a crier.",
    ],
  },
  {
    id: "yuki",
    name: "Yuki",
    role: "Cloud Shepherd",
    x: 3.2,
    y: 11.4,
    look: "robe",
    color: "#8fd3c1",
    lines: [
      "The herds drift low on windy days. I walk the west edge and whistle them back over the rail.",
      "A cloud that strays too far becomes rain. Which is to say: it becomes someone else's problem, far below.",
      "Mind the rail, traveller. The city's edge is soft, but the fall is not.",
    ],
  },
  {
    id: "fen",
    name: "Fen",
    role: "Watch Captain",
    x: 12.2,
    y: 11.2,
    look: "guard",
    color: "#5d7fa3",
    lines: [
      "Two patrols a day keeps a tower from falling out of the sky. That is not a proverb. We lost one last winter.",
      "Walk the city end to end and I will count you as one of the watch. Steps are a currency up here.",
      "You may cross anywhere except the north rail. That rail is not a rail anymore.",
    ],
  },
  {
    id: "mira",
    name: "Mira",
    role: "Teahouse Keeper",
    x: 6.4,
    y: 10.4,
    look: "robe",
    color: "#d67f9b",
    gift: 1,
    lines: [
      "Sit. The tea is brewed from high springs and it tastes like the weather does before a storm breaks.",
      "Every hero who comes up here is chasing something. Take a breath first — the sky is not going anywhere.",
      "My house pays a shard to travellers who stop and speak. Consider it an investment in a quieter city.",
    ],
  },
  {
    id: "tobin",
    name: "Tobin",
    role: "Lamplighter's Apprentice",
    x: 9.2,
    y: 6.4,
    look: "child",
    color: "#e2b65a",
    lines: [
      "I light the lamps. Well — I carry the ladder. My master lights the lamps.",
      "When the lamps are lit the city looks like a crown dropped in a pond. He says that, not me.",
      "Are you going into the Ascension Nexus? It smells like hot pennies in there.",
    ],
  },
  {
    id: "asha",
    name: "Asha",
    role: "Aether Scholar",
    x: 12.9,
    y: 7.0,
    look: "mage",
    color: "#5f9bd6",
    lines: [
      "The Vault keeps the sky's bookkeeping. Three doors, three keys, and a keeper who has never once smiled.",
      "Visit the Nexus, the Board and the Vault, and you will have seen everything the city considers necessary.",
      "Aether Shards are not money. Money is a promise; shards are a fact.",
    ],
  },
  {
    id: "grum",
    name: "Grum",
    role: "Vault Keeper",
    x: 9.4,
    y: 8.8,
    look: "guard",
    color: "#7a8a99",
    lines: [
      "The blessing is once a day. Do not ask me twice; I have a very small number of afternoons.",
      "Gold buys shards here, if you have gold to spare. Most heroes find they do not.",
      "Win a fight worth telling and the city remembers. Prove your worth and the Vault opens wider.",
    ],
  },
  {
    id: "pell",
    name: "Pell",
    role: "Courier",
    x: 8.4,
    y: 11.6,
    look: "merchant",
    color: "#b88c5e",
    lines: [
      "Messages, parcels, very small animals — if it fits in a satchel I will get it across the island before noon.",
      "The gate is that way. Tell me you did not come up here just to look at the view.",
      "I have run every street twice today. My shins have opinions about it.",
    ],
  },
  {
    id: "nira",
    name: "Nira",
    role: "Skyweaver",
    x: 3.4,
    y: 5.4,
    look: "mage",
    color: "#7fc7d6",
    lines: [
      "I weave the wind into a cloth the towers use for sails. It is the only fabric that must be let out when it cools.",
      "Bring me silence and I will make you a rope of it.",
      "Everything here is held up by work someone else does while you fight. Be gentle with the city.",
    ],
  },
];

export const npcById = (id: string) => NPCS.find((n) => n.id === id);

// ---------- Daily commissions ----------
export interface CloudMission {
  id: string;
  name: string;
  desc: string;
  /** The citizen who hands it out. */
  giver: string;
  target: number;
  shards: number;
  gold: number;
  xp: number;
  count: (h: Hero) => number;
}

export const CLOUD_MISSIONS: CloudMission[] = [
  {
    id: "citizens",
    name: "Hear the City",
    giver: "seraphine",
    target: 4,
    shards: 2,
    gold: 600,
    xp: 400,
    desc: "Speak with 4 citizens of Cloud City",
    count: (h) => cloudOf(h).talks.length,
  },
  {
    id: "patrol",
    name: "Skyward Patrol",
    giver: "fen",
    target: 60,
    shards: 2,
    gold: 600,
    xp: 400,
    desc: "Walk 60 steps through the city",
    count: (h) => Math.floor(cloudOf(h).steps),
  },
  {
    id: "buildings",
    name: "Open the Gates",
    giver: "asha",
    target: 3,
    shards: 2,
    gold: 500,
    xp: 350,
    desc: "Enter 3 different buildings",
    count: (h) => cloudOf(h).visits.length,
  },
  {
    id: "ascend",
    name: "Touch the Aether",
    giver: "orrin",
    target: 1,
    shards: 3,
    gold: 800,
    xp: 500,
    desc: "Unlock 1 Aether Ascension rank",
    count: (h) => Math.max(0, ascTotal(h.cloud) - cloudOf(h).base.ranks),
  },
  {
    id: "battle",
    name: "Prove Your Worth",
    giver: "grum",
    target: 2,
    shards: 3,
    gold: 900,
    xp: 600,
    desc: "Win 2 battles anywhere in Ember Fall",
    count: (h) => Math.max(0, (h.record?.wins ?? 0) - cloudOf(h).base.wins),
  },
];

export interface MissionRow {
  mission: CloudMission;
  progress: number;
  claimed: boolean;
  done: boolean;
}

export function missionRows(h: Hero, now = Date.now()): MissionRow[] {
  const st = cloudOf(h, now);
  return CLOUD_MISSIONS.map((mission) => {
    const progress = Math.min(mission.target, Math.max(0, mission.count(h)));
    return {
      mission,
      progress,
      claimed: st.claimed.includes(mission.id),
      done: progress >= mission.target,
    };
  });
}

/** Commissions a given citizen is responsible for. */
export const missionsOf = (npcId: string) => CLOUD_MISSIONS.filter((m) => m.giver === npcId);

/** Claim one finished commission. Returns what was paid, or null when it cannot be claimed. */
export function claimMission(
  h: Hero,
  id: string,
  now = Date.now(),
): { shards: number; gold: number; xp: number } | null {
  const st = rollCloud(h, now);
  const row = missionRows(h, now).find((r) => r.mission.id === id);
  if (!row || row.claimed || !row.done) return null;
  st.claimed.push(id);
  st.shards += row.mission.shards;
  grant(h, row.mission.xp, row.mission.gold);
  return { shards: row.mission.shards, gold: row.mission.gold, xp: row.mission.xp };
}

// ---------- City bookkeeping (called by the region as the hero moves) ----------
/** Speaking to a citizen: records the visit and pays their daily gift once. Returns shards paid. */
export function noteTalk(h: Hero, npcId: string, now = Date.now()): number {
  const st = rollCloud(h, now);
  if (!st.talks.includes(npcId)) st.talks.push(npcId);
  const gift = npcById(npcId)?.gift ?? 0;
  if (gift > 0 && !st.tithed.includes(npcId)) {
    st.tithed.push(npcId);
    st.shards += gift;
    return gift;
  }
  return 0;
}

export function noteVisit(h: Hero, buildingId: string, now = Date.now()): void {
  const st = rollCloud(h, now);
  if (!st.visits.includes(buildingId)) st.visits.push(buildingId);
}

export function noteSteps(h: Hero, tiles: number, now = Date.now()): void {
  if (tiles <= 0) return;
  rollCloud(h, now).steps += tiles;
}

// ---------- Sky Vault ----------
export const BLESSING_GOLD = 2500;
export const SHARD_PRICE = 3000;

export const blessingGold = (h: Hero) => scaledGold(BLESSING_GOLD, h.level);
export const blessingShards = (h: Hero) => 3 + Math.floor(h.level / 10);
export const shardPrice = (h: Hero) => scaledGold(SHARD_PRICE, h.level);

/** Free daily blessing: gold plus shards, once per Greek day. */
export function claimBlessing(h: Hero, now = Date.now()): { shards: number; gold: number } | null {
  const st = rollCloud(h, now);
  if (st.blessed) return null;
  st.blessed = true;
  const gold = blessingGold(h);
  const pay = blessingShards(h);
  st.shards += pay;
  h.gold += gold;
  return { shards: pay, gold };
}

/** Trade gold for Aether Shards. Returns an error message, or null on success. */
export function buyShards(h: Hero, count = 1): string | null {
  if (count <= 0) return "Nothing to buy";
  const price = shardPrice(h) * count;
  if (h.gold < price) return "Not enough gold";
  rollCloud(h).shards += count;
  h.gold -= price;
  return null;
}

// ---------- Map: palettes, buildings and props ----------
export interface Palette {
  top: string;
  left: string;
  right: string;
  trim: string;
}

export const PALETTES = {
  marble: { top: "#fdfaf1", left: "#e9e0cd", right: "#cfc3a8", trim: "#c9a24a" },
  sand: { top: "#f7e9cb", left: "#e2cda3", right: "#c4ab7e", trim: "#b8843c" },
  sky: { top: "#eef8ff", left: "#d2e9f8", right: "#a9cce5", trim: "#5f9fc9" },
  teal: { top: "#ddf5f1", left: "#b9e2dc", right: "#8fc4bd", trim: "#3f8f86" },
  rose: { top: "#fce8ec", left: "#f1cdd5", right: "#daa9b5", trim: "#b05e74" },
  gold: { top: "#fdf2d2", left: "#f3dea9", right: "#dabf7e", trim: "#c08a2a" },
} as const satisfies Record<string, Palette>;

export type RoofKind = "flat" | "pyramid" | "dome" | "spire";
export type CityOpen = "nexus" | "board" | "vault" | "exit";

export interface CityBuilding {
  id: string;
  name: string;
  /** Footprint origin in grid units. */
  x: number;
  y: number;
  /** Footprint size in grid units. */
  w: number;
  d: number;
  /** Wall height in px. */
  h: number;
  roof: RoofKind;
  pal: Palette;
  /** Interactive buildings open a screen; the rest are scenery you can inspect. */
  open?: CityOpen;
  desc?: string;
}

export const CITY_BUILDINGS: CityBuilding[] = [
  {
    id: "nexus",
    name: "Ascension Nexus",
    x: 6.6,
    y: 2.2,
    w: 2.6,
    d: 2.6,
    h: 132,
    roof: "spire",
    pal: PALETTES.sky,
    open: "nexus",
    desc: "Spend Aether Shards on permanent Ascension ranks.",
  },
  {
    id: "board",
    name: "Mission Board",
    x: 4.2,
    y: 6.2,
    w: 1.4,
    d: 1.4,
    h: 58,
    roof: "flat",
    pal: PALETTES.sand,
    open: "board",
    desc: "The city's daily commissions.",
  },
  {
    id: "vault",
    name: "Sky Vault",
    x: 9.6,
    y: 5.4,
    w: 2.4,
    d: 2.4,
    h: 104,
    roof: "dome",
    pal: PALETTES.gold,
    open: "vault",
    desc: "Daily blessing and gold for shards.",
  },
  {
    id: "gate",
    name: "Azure Gate",
    x: 7.4,
    y: 14.0,
    w: 2.2,
    d: 0.9,
    h: 96,
    roof: "flat",
    pal: PALETTES.marble,
    open: "exit",
    desc: "The stair back down to Ember Fall.",
  },
  {
    id: "tower-a",
    name: "Tower of Dawn",
    x: 2.4,
    y: 2.4,
    w: 1.8,
    d: 1.8,
    h: 188,
    roof: "spire",
    pal: PALETTES.marble,
    desc: "It rings at an hour nobody agrees on.",
  },
  {
    id: "tower-b",
    name: "Westwind Tower",
    x: 12.2,
    y: 2.6,
    w: 1.6,
    d: 1.6,
    h: 168,
    roof: "spire",
    pal: PALETTES.sky,
    desc: "Sails for the cloud herds are woven here.",
  },
  {
    id: "tower-c",
    name: "Lantern Tower",
    x: 13.0,
    y: 10.2,
    w: 1.8,
    d: 1.8,
    h: 152,
    roof: "pyramid",
    pal: PALETTES.rose,
    desc: "The last light the city keeps lit.",
  },
  {
    id: "house-f",
    name: "Star Lodge",
    x: 0.6,
    y: 5.4,
    w: 1.6,
    d: 1.6,
    h: 62,
    roof: "pyramid",
    pal: PALETTES.teal,
    desc: "Charts, compasses and cold tea.",
  },
  {
    id: "house-a",
    name: "Weavers' Row",
    x: 2.0,
    y: 8.8,
    w: 2.0,
    d: 1.8,
    h: 70,
    roof: "pyramid",
    pal: PALETTES.rose,
    desc: "Cloth that must be let out when the air cools.",
  },
  {
    id: "house-e",
    name: "The High Bunk",
    x: 12.6,
    y: 8.0,
    w: 1.6,
    d: 1.8,
    h: 66,
    roof: "flat",
    pal: PALETTES.sand,
    desc: "Beds for couriers who missed the last stair.",
  },
  {
    id: "house-b",
    name: "Shepherd's Rest",
    x: 2.2,
    y: 12.0,
    w: 1.8,
    d: 1.6,
    h: 62,
    roof: "pyramid",
    pal: PALETTES.teal,
    desc: "Whistles for the cloud herds hang by the door.",
  },
  {
    id: "house-c",
    name: "Gatehouse",
    x: 5.4,
    y: 13.2,
    w: 1.8,
    d: 1.6,
    h: 72,
    roof: "pyramid",
    pal: PALETTES.marble,
    desc: "Every traveller is written down here.",
  },
  {
    id: "house-d",
    name: "Chandlery",
    x: 10.6,
    y: 12.8,
    w: 2.0,
    d: 1.6,
    h: 70,
    roof: "pyramid",
    pal: PALETTES.gold,
    desc: "Wax, wicks and a very patient apprentice.",
  },
];

export type PropKind = "tree" | "crystal" | "lamp" | "fountain" | "rock" | "bush" | "banner";

export interface CityProp {
  kind: PropKind;
  x: number;
  y: number;
  s?: number;
  color?: string;
}

export const CITY_PROPS: CityProp[] = [
  { kind: "fountain", x: 8.2, y: 8.4, s: 1 },
  { kind: "lamp", x: 6.8, y: 7.2 },
  { kind: "lamp", x: 9.8, y: 7.4 },
  { kind: "lamp", x: 6.6, y: 9.8 },
  { kind: "lamp", x: 10.0, y: 9.8 },
  { kind: "banner", x: 7.6, y: 13.6 },
  { kind: "banner", x: 9.4, y: 13.6 },
  { kind: "tree", x: 2.6, y: 6.4 },
  { kind: "tree", x: 1.4, y: 10.6 },
  { kind: "tree", x: 4.2, y: 11.6 },
  { kind: "tree", x: 6.2, y: 3.2 },
  { kind: "tree", x: 11.4, y: 3.6 },
  { kind: "tree", x: 13.8, y: 5.2 },
  { kind: "tree", x: 9.2, y: 13.4 },
  { kind: "tree", x: 2.6, y: 14.2 },
  { kind: "tree", x: 0.8, y: 3.2 },
  { kind: "tree", x: 15.0, y: 7.4 },
  { kind: "tree", x: 11.6, y: 10.4 },
  { kind: "tree", x: 4.6, y: 4.6 },
  { kind: "crystal", x: 5.4, y: 5.0 },
  { kind: "crystal", x: 10.4, y: 10.8 },
  { kind: "crystal", x: 7.8, y: 4.4 },
  { kind: "crystal", x: 12.4, y: 6.2 },
  { kind: "rock", x: 3.6, y: 7.6 },
  { kind: "rock", x: 11.8, y: 12.0 },
  { kind: "rock", x: 6.0, y: 12.2 },
  { kind: "rock", x: 14.4, y: 9.0 },
  { kind: "bush", x: 5.2, y: 9.6 },
  { kind: "bush", x: 9.6, y: 11.2 },
  { kind: "bush", x: 7.2, y: 5.6 },
  { kind: "bush", x: 12.0, y: 8.6 },
];

/** Where the hero stands after arriving (south of the gate, on the plaza). */
export const SPAWN = { x: 8.2, y: 10.6 };

/** The spot a hero walks to when they want to use a building: just south of its doorway. */
export const standPoint = (b: CityBuilding) => ({ x: b.x + b.w / 2, y: b.y + b.d + 0.45 });
