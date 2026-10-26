import { REGIONS, BESTIARY, enemySprite, type SpriteRect } from "./world";
import { WORLD_UNITS, type MonsterKind, type NodeKind } from "./worldcastles";

export type { MonsterKind, NodeKind };

/**
 * The 2.5D world the World Tree opens. Everything here is the *shape* of that
 * world — where the ground rises, which monsters live where, which nodes grow
 * and how a character walks over it — derived deterministically from the same
 * five areas the rest of the game already has (REGIONS in world.ts), so the map
 * is the same world every time it is opened. The server stays authoritative over
 * castles, encounters and rewards (see drizzle/migrations/0013_world_pve.sql);
 * this file decides only what is drawn and where a character may step.
 */

/** Pixels per world unit on the ground plane, and its 2.5D tilt. */
export const SCENE = { px: 5, tilt: 0.62, actor: 54 } as const;
/** Walking and running speed, in world units per second. */
export const MOVE = { walk: 40, run: 92 } as const;
/** How close a character must stand to touch a monster, node or castle. */
export const REACH = 30;
/** How far a monster notices a character and gives chase. */
export const AGGRO = 46;
export const AREA_IDS = ["wilds", "barrows", "peaks", "wastes", "throne"] as const;
export type AreaId = (typeof AREA_IDS)[number];
export type DecoKind = "pine" | "oak" | "rock" | "pillar" | "banner" | "crystal" | "lava" | "bones";

export interface Area {
  id: AreaId; name: string; index: number; row: number;
  /** Character level at which the area may be entered (its map label). */
  openLevel: number;
  /** The highest monster that lives there. Mirrors _world_area_open/_world_area_top in SQL. */
  topLevel: number;
  cx: number; cy: number; rx: number; ry: number;
  /** Ground palette: base, patch, path. */
  ground: [string, string, string];
  accent: string;
  deco: DecoKind[];
  /** Relative weight of each monster kind in this area. Mirrors _world_area_allows. */
  kinds: { kind: MonsterKind; weight: number }[];
}

const PALETTE: Record<AreaId, { ground: [string, string, string]; accent: string; deco: DecoKind[] }> = {
  wilds: { ground: ["#2f4a2b", "#3b5c33", "#6b5a3a"], accent: "#7fc45f", deco: ["pine", "oak", "rock", "banner"] },
  barrows: { ground: ["#3a3540", "#484250", "#6a6070"], accent: "#a08fd0", deco: ["bones", "pillar", "rock", "oak"] },
  peaks: { ground: ["#4a2c26", "#5c352c", "#7a4536"], accent: "#f07a3c", deco: ["lava", "rock", "crystal", "pillar"] },
  wastes: { ground: ["#3c2a34", "#4a3140", "#6b4152"], accent: "#dc4f7a", deco: ["bones", "crystal", "pillar", "lava"] },
  throne: { ground: ["#2a2438", "#362c4a", "#4b3a63"], accent: "#8f7bff", deco: ["crystal", "pillar", "banner", "bones"] },
};

/** Kinds that may appear, by area depth. Rare beasts need the deeper world; area bosses deeper still. */
function kindsFor(index: number): { kind: MonsterKind; weight: number }[] {
  const base = [{ kind: "normal" as MonsterKind, weight: 68 }, { kind: "elite" as MonsterKind, weight: 32 }];
  if (index === 0) return base;
  const rare = [{ kind: "rare" as MonsterKind, weight: 14 }];
  if (index < 3) return [...base, ...rare];
  return [...base.map((k) => ({ ...k, weight: 58 })), { kind: "rare" as MonsterKind, weight: 22 }, { kind: "boss" as MonsterKind, weight: 20 }];
}

/** The five areas, laid over the world grid exactly where the map art shows them. */
export const AREAS: Area[] = (["wilds", "barrows", "peaks", "wastes", "throne"] as AreaId[]).map((id, i) => {
  const r = REGIONS[i]!;
  const n = r.path.length;
  const cx = (r.path.reduce((a, p) => a + p[0], 0) / n) * 10;
  const cy = (r.path.reduce((a, p) => a + p[1], 0) / n) * 10;
  return {
    id, name: r.name, index: i, row: r.row, openLevel: r.level, topLevel: r.level + 9,
    cx, cy, rx: 150, ry: 130, ...PALETTE[id], kinds: kindsFor(i),
  };
});

export const areaById = (id: string | null | undefined): Area | null => AREAS.find((a) => a.id === id) ?? null;

/** Deterministic hash in [0,1) — every client draws the same ground. */
export function hash2(x: number, y: number, seed = 0): number {
  let h = Math.imul(Math.round(x) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.round(y) ^ 0xc2b2ae35, 0x27d4eb2f) ^ Math.imul(seed + 1, 0x165667b1);
  h ^= h >>> 15; h = Math.imul(h, 0x2545f491); h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/** A small reproducible generator so a seed always yields the same layout. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const areaSeed = (a: Area, salt: number) => Math.round(a.cx * 7919 + a.cy * 104729 + a.index * 15485863 + salt * 32452843);

/** Which area a point belongs to: the area it stands in, else the nearest one. */
export function areaAt(x: number, y: number): Area {
  for (const a of AREAS) {
    const dx = (x - a.cx) / a.rx, dy = (y - a.cy) / a.ry;
    if (dx * dx + dy * dy <= 1) return a;
  }
  let best = AREAS[0]!, bestD = Infinity;
  for (const a of AREAS) {
    const d = (x - a.cx) ** 2 + (y - a.cy) ** 2;
    if (d < bestD) { bestD = d; best = a; }
  }
  return best;
}

export interface Deco { kind: DecoKind; x: number; y: number; size: number; solid: boolean }
export interface Node { id: string; kind: NodeKind; area: AreaId; x: number; y: number }
export interface Poi { id: string; area: AreaId; name: string; x: number; y: number; kind: "lair" | "shrine" | "gate" | "ruins" | "camp" }

const decoCache = new Map<AreaId, Deco[]>();
/** Scenery: trees, rocks, ruins and lava vents, spread deterministically over the area. */
export function decoFor(area: Area): Deco[] {
  const cached = decoCache.get(area.id);
  if (cached) return cached;
  const r = rng(areaSeed(area, 11));
  const out: Deco[] = [];
  const count = 46 + Math.round(r() * 18);
  for (let i = 0; i < count; i++) {
    const angle = r() * Math.PI * 2, radius = Math.sqrt(r());
    const x = area.cx + Math.cos(angle) * area.rx * radius * 0.94;
    const y = area.cy + Math.sin(angle) * area.ry * radius * 0.94;
    const kind = area.deco[Math.floor(r() * area.deco.length)]!;
    out.push({ kind, x, y, size: 0.75 + r() * 0.7, solid: kind !== "lava" && kind !== "banner" && kind !== "bones" });
  }
  decoCache.set(area.id, out);
  return out;
}

const nodeCache = new Map<AreaId, Node[]>();
const NODE_BY_AREA: Record<AreaId, NodeKind[]> = {
  wilds: ["ore", "essence"], barrows: ["ore", "essence", "fragment"],
  peaks: ["essence", "fragment", "sigil"], wastes: ["fragment", "sigil", "starshard"],
  throne: ["sigil", "starshard", "fragment"],
};
/** Resource nodes: what really grows there, exactly as the server allows it. */
export function nodesFor(area: Area): Node[] {
  const cached = nodeCache.get(area.id);
  if (cached) return cached;
  const r = rng(areaSeed(area, 29));
  const kinds = NODE_BY_AREA[area.id];
  const out: Node[] = [];
  for (let i = 0; i < 14; i++) {
    const angle = r() * Math.PI * 2, radius = 0.25 + Math.sqrt(r()) * 0.68;
    const x = area.cx + Math.cos(angle) * area.rx * radius;
    const y = area.cy + Math.sin(angle) * area.ry * radius;
    const kind = kinds[Math.floor(r() * kinds.length)]!;
    out.push({ id: `${area.id}-node-${i}`, kind, area: area.id, x, y });
  }
  nodeCache.set(area.id, out);
  return out;
}

const poiCache = new Map<AreaId, Poi[]>();
/** Points of interest: the area's lair, a shrine, a gate and a warcamp. */
export function poisFor(area: Area): Poi[] {
  const cached = poiCache.get(area.id);
  if (cached) return cached;
  const boss = REGIONS[area.row]!.boss;
  const bossName = boss.name.replace(/^.*?,\s*/, "");
  const out: Poi[] = [
    { id: `${area.id}-lair`, area: area.id, name: `${bossName}'s Lair`, x: area.cx + area.rx * 0.45, y: area.cy - area.ry * 0.5, kind: "lair" },
    { id: `${area.id}-shrine`, area: area.id, name: "Forgotten Shrine", x: area.cx - area.rx * 0.52, y: area.cy + area.ry * 0.42, kind: "shrine" },
    { id: `${area.id}-gate`, area: area.id, name: "World Tree Gate", x: area.cx, y: area.cy + area.ry * 0.78, kind: "gate" },
    ...(area.index > 0 ? [{ id: `${area.id}-camp`, area: area.id, name: "Raiders' Camp", x: area.cx + area.rx * 0.2, y: area.cy + area.ry * 0.55, kind: "camp" as const }] : []),
  ];
  poiCache.set(area.id, out);
  return out;
}

export interface Monster {
  id: string; area: AreaId; kind: MonsterKind; name: string; level: number;
  x: number; y: number; hx: number; hy: number; facing: "l" | "r";
  sprite: SpriteRect; radius: number; /** wander target */ tx: number; ty: number; wait: number;
}

/** The kind a monster index rolls in this area — the same split the server allows. */
export function kindFor(area: Area, roll: number, heroLevel: number): MonsterKind {
  if (heroLevel < area.openLevel) return "normal";
  const allowed = area.kinds.filter((k) => {
    if (k.kind === "rare") return area.index > 0;
    if (k.kind === "boss") return area.index >= 3 && heroLevel >= area.openLevel + 9;
    return true;
  });
  const total = allowed.reduce((a, k) => a + k.weight, 0);
  let acc = roll * total;
  for (const k of allowed) { acc -= k.weight; if (acc <= 0) return k.kind; }
  return "normal";
}

const monsterCache = new Map<string, Monster[]>();
/**
 * The monsters that really stand in an area: normal beasts, elites in their own
 * colours, rare encounters and the area's boss at its lair. Deterministic per
 * area and character level, so the world does not reshuffle under the player.
 */
export function monstersFor(area: Area, heroLevel: number): Monster[] {
  const band = heroLevel < area.openLevel ? area.openLevel : Math.min(area.openLevel + 9, Math.max(area.openLevel, heroLevel));
  const key = `${area.id}:${band}`;
  const cached = monsterCache.get(key);
  if (cached) return cached;
  const r = rng(areaSeed(area, 47));
  const row = BESTIARY[area.row]!;
  const out: Monster[] = [];
  for (let i = 0; i < 18; i++) {
    const angle = r() * Math.PI * 2, radius = 0.2 + Math.sqrt(r()) * 0.72;
    const x = area.cx + Math.cos(angle) * area.rx * radius;
    const y = area.cy + Math.sin(angle) * area.ry * radius;
    const kind = kindFor(area, r(), heroLevel);
    const col = Math.floor(r() * row.length);
    const boss = REGIONS[area.row]!.boss;
    const level = kind === "boss" ? band + 6 : kind === "rare" ? band + 3 : kind === "elite" ? band + 1 : band;
    out.push({
      id: `${area.id}-${i}`, area: area.id, kind,
      name: kind === "boss" ? boss.name : kind === "elite" ? `Elite ${row[col]!}` : kind === "rare" ? `Ancient ${row[col]!}` : row[col]!,
      level: Math.min(area.topLevel + 6, level),
      x, y, hx: x, hy: y, facing: r() < 0.5 ? "l" : "r",
      sprite: kind === "boss" ? boss.sprite : enemySprite(area.row, col),
      radius: kind === "boss" ? 4 : kind === "elite" ? 3.4 : 2.8,
      tx: x, ty: y, wait: r() * 2,
    });
  }
  const lair = poisFor(area)[0]!;
  const bossMonster = out.find((m) => m.kind === "boss");
  if (bossMonster) { bossMonster.x = lair.x; bossMonster.y = lair.y; bossMonster.hx = lair.x; bossMonster.hy = lair.y; bossMonster.tx = lair.x; bossMonster.ty = lair.y; }
  monsterCache.set(key, out);
  return out;
}

/** Everything the world shows at once, for the current character level. */
export function worldContent(heroLevel: number) {
  return AREAS.map((area) => ({
    area,
    deco: decoFor(area),
    nodes: nodesFor(area),
    pois: poisFor(area),
    monsters: monstersFor(area, heroLevel),
  }));
}

/** Solid ground: scenery the character walks around, plus the world's own edge. */
export function blockedAt(x: number, y: number, extra: { x: number; y: number; r: number }[] = []): boolean {
  if (x < 12 || x > WORLD_UNITS - 12 || y < 12 || y > WORLD_UNITS - 12) return true;
  for (const e of extra) if ((e.x - x) ** 2 + (e.y - y) ** 2 < e.r * e.r) return true;
  for (const d of decoFor(areaAt(x, y))) {
    if (!d.solid) continue;
    const r = (d.kind === "pillar" ? 3.2 : d.kind === "rock" ? 2.6 : 2) * d.size;
    if ((d.x - x) ** 2 + (d.y - y) ** 2 < r * r) return true;
  }
  return false;
}

export type Anim = "idle" | "walk" | "run" | "attack" | "cast" | "hurt";
export interface SceneActor { x: number; y: number; facing: "l" | "r"; anim: Anim; animT: number; speed: number }
/** How long a one-shot action holds the character before it returns to walking. */
export const ACTION_MS: Record<Exclude<Anim, "idle" | "walk" | "run">, number> = { attack: 460, cast: 620, hurt: 320 };

export const newActor = (x: number, y: number): SceneActor => ({ x, y, facing: "r", anim: "idle", animT: 0, speed: 0 });

/**
 * Move the character one frame. Diagonal movement is normalised, the step is
 * split so a wall stops one axis instead of both, and the animation follows what
 * the character is actually doing.
 */
export function stepActor(a: SceneActor, input: { dx: number; dy: number; run: boolean }, seconds: number, blocked: (x: number, y: number) => boolean): SceneActor {
  const next: SceneActor = { ...a, animT: a.animT + seconds * 1000 };
  if (next.animT >= 0 && (next.anim === "attack" || next.anim === "cast" || next.anim === "hurt") && next.animT >= ACTION_MS[next.anim]) {
    next.anim = "idle"; next.animT = 0;
  }
  const acting = next.anim === "attack" || next.anim === "cast" || next.anim === "hurt";
  const len = Math.hypot(input.dx, input.dy);
  const wanted = acting || len === 0 ? 0 : input.run ? MOVE.run : MOVE.walk;
  next.speed = wanted;
  if (wanted > 0) {
    const nx = input.dx / len, ny = input.dy / len;
    const stepX = nx * wanted * seconds, stepY = ny * wanted * seconds;
    // A character caught inside scenery must always be able to walk out of it.
    if (blocked(next.x, next.y)) { next.x += stepX; next.y += stepY; }
    else {
      if (!blocked(next.x + stepX, next.y)) next.x += stepX;
      if (!blocked(next.x, next.y + stepY)) next.y += stepY;
    }
    if (Math.abs(nx) > 0.05) next.facing = nx < 0 ? "l" : "r";
    next.anim = input.run ? "run" : "walk";
  } else if (!acting) {
    next.anim = "idle";
  }
  return next;
}

/** Send the character into a one-shot action (attack or cast). */
export function act(a: SceneActor, anim: "attack" | "cast" | "hurt"): SceneActor {
  return { ...a, anim, animT: 0 };
}

/** A monster patrols its ground, notices a nearby character and closes in. */
export function stepMonster(m: Monster, player: { x: number; y: number }, seconds: number, blocked: (x: number, y: number) => boolean): Monster {
  const next = { ...m };
  const dx = player.x - next.x, dy = player.y - next.y;
  const far = Math.hypot(dx, dy);
  const speed = next.kind === "boss" ? 12 : next.kind === "rare" ? 20 : next.kind === "elite" ? 18 : 16;
  if (far < AGGRO && far > next.radius + 6) {
    if (Math.abs(dx) > 0.4) next.facing = dx < 0 ? "l" : "r";
    const stepX = (dx / far) * speed * seconds, stepY = (dy / far) * speed * seconds;
    if (!blocked(next.x + stepX, next.y)) next.x += stepX;
    if (!blocked(next.x, next.y + stepY)) next.y += stepY;
    next.wait = 0.6;
    return next;
  }
  // Otherwise wander around the ground it belongs to, pausing as it goes.
  if (next.wait > 0) { next.wait -= seconds; return next; }
  const home = Math.hypot(next.tx - next.hx, next.ty - next.hy);
  const arrive = Math.hypot(next.tx - next.x, next.ty - next.y);
  if (arrive < 3 || home > 60) { next.tx = next.hx + (hash2(next.hx, next.hy, next.x) - 0.5) * 60; next.ty = next.hy + (hash2(next.hy, next.hx, next.y) - 0.5) * 60; next.wait = 1 + hash2(next.x, next.y, next.level) * 2.5; return next; }
  const nx = (next.tx - next.x) / arrive, ny = (next.ty - next.y) / arrive;
  if (Math.abs(nx) > 0.4) next.facing = nx < 0 ? "l" : "r";
  const stepX = nx * speed * 0.5 * seconds, stepY = ny * speed * 0.5 * seconds;
  if (!blocked(next.x + stepX, next.y)) next.x += stepX;
  if (!blocked(next.x, next.y + stepY)) next.y += stepY;
  return next;
}

export interface Camera { x: number; y: number }
/** Keep the camera on the character, never showing past the edge of the world. */
export function cameraFor(cam: Camera, target: { x: number; y: number }, view: { w: number; h: number }): Camera {
  const halfW = view.w / 2 / SCENE.px, halfH = view.h / 2 / (SCENE.px * SCENE.tilt);
  const follow = (current: number, want: number, half: number) => {
    const clamped = Math.max(half, Math.min(WORLD_UNITS - half, want));
    return current + (clamped - current) * 0.25;
  };
  return { x: follow(cam.x, target.x, halfW), y: follow(cam.y, target.y, halfH) };
}

/** Screen position (CSS pixels inside the canvas) and depth for one world point. */
export function project(x: number, y: number, cam: Camera, view: { w: number; h: number }) {
  const sx = (x - cam.x) * SCENE.px + view.w / 2;
  const sy = (y - cam.y) * SCENE.px * SCENE.tilt + view.h / 2;
  return { sx, sy, depth: y, /** how much bigger things in the front are drawn */ scale: 1 + (y - cam.y) / 1400 };
}

/** The closest interactable to the character, or null when none is in reach. */
export function nearest<T extends { x: number; y: number }>(list: T[], from: { x: number; y: number }, reach = REACH): T | null {
  let best: T | null = null, bestD = reach;
  for (const item of list) {
    const d = Math.hypot(item.x - from.x, item.y - from.y);
    if (d <= bestD) { bestD = d; best = item; }
  }
  return best;
}

/** Where a character starting in the world stands: at their castle, or the world's heart. */
export function spawnPoint(castle: { x: number; y: number } | null): { x: number; y: number } {
  return castle ? { x: castle.x, y: castle.y + 18 } : { x: WORLD_UNITS / 2, y: WORLD_UNITS / 2 };
}

export const nodeLabel: Record<NodeKind, string> = {
  ore: "Ember Ore", essence: "Soul Essence", fragment: "Armor Fragment", sigil: "Elite Sigil", starshard: "Starshard",
};
export const kindLabel: Record<MonsterKind, string> = { normal: "Beast", elite: "Elite", rare: "Rare encounter", boss: "World boss" };
