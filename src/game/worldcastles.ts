import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";
import type { HeroClass } from "./data";

/**
 * The world grid: 1000 units across the map, so 10 units = 1%.
 * Keep identical to drizzle/migrations/0011_world_castles.sql.
 */
export const WORLD_UNITS = 1000;
export const WORLD_MOVES_PER_DAY = 3;
/** How much room the server keeps between two castles, in world units. */
export const WORLD_GAP = 40;
/** Castles stay this far from the edge of the world. */
export const WORLD_MARGIN = 60;
/** How many castles a lord may assault per day. Keep identical to migration 0012. */
export const CASTLE_ASSAULTS_PER_DAY = 5;
/**
 * Assault protection, keep identical to drizzle/migrations/0014_castle_protection.sql.
 * A weaker lord must not be farmed by a stronger one: level 5 newcomers are
 * sheltered, a ten-level gap is out of reach, a castle is shielded for half an
 * hour after an assault, and a warband opens at level 3.
 */
export const CASTLE_LEVEL_GAP = 10;
export const CASTLE_SHIELD_MINUTES = 30;
export const NEW_LORD_LEVEL = 5;
export const CASTLE_ATTACK_MIN_LEVEL = 3;
/** How much of the defender's own power the castle guard fights with. Mirrors the SQL share. */
export const CASTLE_GUARD_SHARE = 0.7;
/**
 * World PvE budget per world day, keep identical to
 * drizzle/migrations/0013_world_pve.sql.
 */
export const WORLD_ENCOUNTERS_PER_DAY = 40;
export const WORLD_HARVESTS_PER_DAY = 25;

export interface WorldCastle {
  hero_id: string;
  name: string;
  cls: HeroClass;
  gender: "male" | "female";
  level: number;
  power: number;
  x: number;
  y: number;
}

export interface WorldState {
  day: string;
  resetAt: string;
  movesPerDay: number;
  movesUsed: number;
  movesLeft: number;
  assaultsPerDay: number;
  assaultsLeft: number;
  /** Renown earned in the world: PvE kills and won castle assaults. */
  fame: number;
  encountersPerDay: number;
  encountersLeft: number;
  harvestsPerDay: number;
  harvestsLeft: number;
  mine: WorldCastle;
  castles: WorldCastle[];
}

export interface AttackStats {
  hp: number;
  atk: number;
  def: number;
  crit: number;
  dodge: number;
  critDmg: number;
  pen: number;
  acc: number;
}

export type BlockReason =
  | "" | "no-assaults" | "already-assaulted" | "attacker-too-weak"
  | "protected-lord" | "level-gap" | "shield" | "own-account";

/** The castle guard that stands between a warband and the lord. */
export interface CastleGuard extends AttackStats {
  name: string;
  level: number;
}

/** Another lord's castle, as the server sees it, with the reason an assault is refused. */
export interface AttackTarget {
  hero_id: string;
  name: string;
  cls: HeroClass;
  gender: "male" | "female";
  level: number;
  power: number;
  coffers: number;
  stats: AttackStats;
  guard: CastleGuard;
  /** Fame a victory here is worth. */
  fameReward: number;
  /** How far below the attacker the defender stands, and the limit the server enforces. */
  levelGap: number;
  maxLevelGap: number;
  shieldMinutes: number;
  shieldUntil: string | null;
  assaultsLeft: number;
  assaultsPerDay: number;
  blocked: BlockReason;
}

export interface AttackResult {
  won: boolean;
  gold: number;
  fame: number;
  fameTotal: number;
  defender: string;
  assaultsLeft: number;
  assaultsPerDay: number;
  replay: boolean;
}

export interface WarEvent {
  id: string;
  attacker_id: string;
  defender_id: string;
  attacker: string;
  defender: string;
  defender_won: boolean;
  gold: number;
  at: string;
}

export type MonsterKind = "normal" | "elite" | "rare" | "boss";
export type NodeKind = "ore" | "essence" | "fragment" | "sigil" | "starshard";

/** An encounter the server has opened and priced. The client never pays itself. */
export interface Encounter {
  req: string;
  area: string;
  monster: string;
  kind: MonsterKind;
  level: number;
  xp: number;
  gold: number;
  fame: number;
  encountersPerDay: number;
  encountersLeft: number;
  replay: boolean;
}

export interface EncounterResult {
  won: boolean;
  xp: number;
  gold: number;
  fame: number;
  fameTotal: number;
  loot: { mats?: Record<string, number>; gems?: Record<string, number> };
  level: number;
  monster: string;
  kind: MonsterKind;
  encountersPerDay: number;
  encountersLeft: number;
  replay: boolean;
}

export interface HarvestResult {
  node: NodeKind;
  area: string;
  mats: Record<string, number>;
  harvestsPerDay: number;
  harvestsLeft: number;
  replay: boolean;
}

const CLASS_KEYS: HeroClass[] = ["warrior", "mage", "archer"];
const KINDS: MonsterKind[] = ["normal", "elite", "rare", "boss"];
const NODES: NodeKind[] = ["ore", "essence", "fragment", "sigil", "starshard"];
const BLOCKS: BlockReason[] = ["no-assaults", "already-assaulted", "attacker-too-weak", "protected-lord", "level-gap", "shield", "own-account"];

/** The world RPCs were added after the last type generation; keep the cast in one place. */
type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
const call = supabase.rpc as unknown as Rpc;

/**
 * The world's tables and functions ship with this branch's migrations (0011-0014).
 * Until they are live on the game's backend the world cannot be opened at all, so
 * say that plainly instead of showing the database's own schema-cache message.
 */
export const WORLD_NOT_LIVE =
  "The world's server functions are not live on this backend yet. They ship with migrations 0011-0014 of this branch and reach the game server when the branch is merged into the main branch.";

/** Call a world RPC and fail with a message the player (or the builder) can act on. */
async function rpc(fn: string, args: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await call(fn, args);
  if (!error) return data;
  const message = String(error.message ?? "");
  if (/Could not find the function|PGRST202|schema cache/i.test(message)) throw new Error(WORLD_NOT_LIVE);
  throw new Error(message);
}

const num = (value: unknown) => (Number.isFinite(value) ? Number(value) : 0);

function readCastle(value: unknown): WorldCastle {
  const c = object(value);
  if (typeof c["hero_id"] !== "string" || typeof c["name"] !== "string" || !CLASS_KEYS.includes(c["cls"] as HeroClass) ||
      !Number.isFinite(c["level"]) || !Number.isFinite(c["x"]) || !Number.isFinite(c["y"])) {
    throw new Error("The world map returned a castle that could not be read. Open the World Tree again.");
  }
  return {
    hero_id: c["hero_id"],
    name: c["name"],
    cls: c["cls"] as HeroClass,
    gender: c["gender"] === "female" ? "female" : "male",
    level: num(c["level"]),
    power: num(c["power"]),
    x: num(c["x"]),
    y: num(c["y"]),
  };
}

/** A payload without its own castle is an error, never an empty world. */
export function readWorld(value: unknown): WorldState {
  const r = object(value);
  const list: WorldCastle[] | null = Array.isArray(r["castles"]) ? (r["castles"] as unknown[]).map(readCastle) : null;
  if (!list || !r["mine"] || typeof r["resetAt"] !== "string") throw new Error("The world map is unavailable right now. Please retry.");
  const mine = readCastle(r["mine"]);
  const perDay = num(r["movesPerDay"]) || WORLD_MOVES_PER_DAY;
  const used = num(r["movesUsed"]);
  const assaultsPerDay = num(r["assaultsPerDay"]) || CASTLE_ASSAULTS_PER_DAY;
  const encountersPerDay = num(r["encountersPerDay"]) || WORLD_ENCOUNTERS_PER_DAY;
  const harvestsPerDay = num(r["harvestsPerDay"]) || WORLD_HARVESTS_PER_DAY;
  return {
    day: String(r["day"] ?? ""),
    resetAt: String(r["resetAt"]),
    movesPerDay: perDay,
    movesUsed: used,
    movesLeft: Number.isFinite(r["movesLeft"]) ? num(r["movesLeft"]) : Math.max(0, perDay - used),
    assaultsPerDay,
    assaultsLeft: Number.isFinite(r["assaultsLeft"]) ? num(r["assaultsLeft"]) : assaultsPerDay,
    fame: num(r["fame"]),
    encountersPerDay,
    encountersLeft: Number.isFinite(r["encountersLeft"]) ? num(r["encountersLeft"]) : encountersPerDay,
    harvestsPerDay,
    harvestsLeft: Number.isFinite(r["harvestsLeft"]) ? num(r["harvestsLeft"]) : harvestsPerDay,
    mine,
    castles: list.filter((c) => c.hero_id !== mine.hero_id),
  };
}

function readStats(value: unknown): AttackStats {
  const s = object(value);
  return {
    hp: Math.max(1, num(s["hp"])),
    atk: num(s["atk"]),
    def: num(s["def"]),
    crit: num(s["crit"]),
    dodge: num(s["dodge"]),
    critDmg: num(s["critDmg"]) || 200,
    pen: num(s["pen"]),
    acc: num(s["acc"]),
  };
}

function readTarget(value: unknown): AttackTarget {
  const t = object(value);
  const g = object(t["guard"]);
  if (typeof t["hero_id"] !== "string" || typeof t["name"] !== "string" ||
      !CLASS_KEYS.includes(t["cls"] as HeroClass) || !Number.isFinite(t["level"])) {
    throw new Error("That castle's lord could not be read. Open the World Tree again.");
  }
  const stats = readStats(t["stats"]);
  const blocked = BLOCKS.includes(t["blocked"] as BlockReason) ? t["blocked"] as BlockReason : "";
  return {
    hero_id: t["hero_id"],
    name: t["name"],
    cls: t["cls"] as HeroClass,
    gender: t["gender"] === "female" ? "female" : "male",
    level: num(t["level"]),
    power: num(t["power"]),
    coffers: num(t["coffers"]),
    stats,
    guard: {
      ...readStats(g),
      name: typeof g["name"] === "string" ? g["name"] : `${t["name"]} Castle Guard`,
      level: num(g["level"]) || num(t["level"]),
    },
    fameReward: num(t["fameReward"]) || 1,
    levelGap: num(t["levelGap"]),
    maxLevelGap: num(t["maxLevelGap"]) || CASTLE_LEVEL_GAP,
    shieldMinutes: num(t["shieldMinutes"]) || CASTLE_SHIELD_MINUTES,
    shieldUntil: typeof t["shieldUntil"] === "string" ? t["shieldUntil"] : null,
    assaultsLeft: num(t["assaultsLeft"]),
    assaultsPerDay: num(t["assaultsPerDay"]) || CASTLE_ASSAULTS_PER_DAY,
    blocked,
  };
}

/** The reason the server gave for refusing an assault, in the player's words. */
export function blockReasonText(target: AttackTarget): string {
  switch (target.blocked) {
    case "no-assaults": return "Your warband has already ridden out five times today.";
    case "already-assaulted": return `You have already assaulted ${target.name}'s castle today.`;
    case "attacker-too-weak": return `Castle assaults open at level ${CASTLE_ATTACK_MIN_LEVEL} — your warband is not ready.`;
    case "protected-lord": return `${target.name} is still sheltered while they find their feet (level ${NEW_LORD_LEVEL}).`;
    case "level-gap": return `${target.name} is ${target.levelGap} levels below you — assaults stop at a gap of ${target.maxLevelGap}. Find a worthier opponent.`;
    case "shield": return `${target.name}'s walls are being repaired — their castle is shielded for ${target.shieldMinutes} minutes after an assault.`;
    case "own-account": return "That castle belongs to your own account.";
    default: return "";
  }
}

function readResult(value: unknown): AttackResult {
  const a = object(object(value)["attack"]);
  if (typeof a["won"] !== "boolean") throw new Error("The assault result could not be read. Reopen the World Tree.");
  return {
    won: a["won"],
    gold: num(a["gold"]),
    fame: num(a["fame"]),
    fameTotal: num(a["fameTotal"]),
    defender: String(a["defender"] ?? ""),
    assaultsLeft: num(a["assaultsLeft"]),
    assaultsPerDay: num(a["assaultsPerDay"]) || CASTLE_ASSAULTS_PER_DAY,
    replay: a["replay"] === true,
  };
}

function readEncounter(value: unknown): Encounter {
  const e = object(object(value)["encounter"]);
  if (typeof e["req"] !== "string" || typeof e["monster"] !== "string" || !KINDS.includes(e["kind"] as MonsterKind) ||
      !Number.isFinite(e["level"])) throw new Error("That encounter could not be opened. Walk back to the monster and try again.");
  return {
    req: e["req"],
    area: String(e["area"] ?? ""),
    monster: e["monster"],
    kind: e["kind"] as MonsterKind,
    level: num(e["level"]),
    xp: num(e["xp"]),
    gold: num(e["gold"]),
    fame: num(e["fame"]),
    encountersPerDay: num(e["encountersPerDay"]) || WORLD_ENCOUNTERS_PER_DAY,
    encountersLeft: num(e["encountersLeft"]),
    replay: e["replay"] === true,
  };
}

function readEncounterResult(value: unknown): EncounterResult {
  const e = object(object(value)["encounter"]);
  const loot = object(e["loot"]);
  if (typeof e["won"] !== "boolean") throw new Error("The fight's outcome could not be read. Reopen the World Tree.");
  return {
    won: e["won"],
    xp: num(e["xp"]),
    gold: num(e["gold"]),
    fame: num(e["fame"]),
    fameTotal: num(e["fameTotal"]),
    loot: {
      mats: object(loot["mats"]) as Record<string, number>,
      gems: object(loot["gems"]) as Record<string, number>,
    },
    level: num(e["level"]),
    monster: String(e["monster"] ?? ""),
    kind: KINDS.includes(e["kind"] as MonsterKind) ? e["kind"] as MonsterKind : "normal",
    encountersPerDay: num(e["encountersPerDay"]) || WORLD_ENCOUNTERS_PER_DAY,
    encountersLeft: num(e["encountersLeft"]),
    replay: e["replay"] === true,
  };
}

function readHarvest(value: unknown): HarvestResult {
  const h = object(object(value)["harvest"]);
  if (!NODES.includes(h["node"] as NodeKind)) throw new Error("That node could not be gathered. Walk back to it and try again.");
  return {
    node: h["node"] as NodeKind,
    area: String(h["area"] ?? ""),
    mats: object(h["mats"]) as Record<string, number>,
    harvestsPerDay: num(h["harvestsPerDay"]) || WORLD_HARVESTS_PER_DAY,
    harvestsLeft: num(h["harvestsLeft"]),
    replay: h["replay"] === true,
  };
}

export async function loadWorld(heroId: string): Promise<WorldState> {
  return readWorld(await rpc("world_map", { _hero: heroId }));
}

export async function loadAttackTarget(heroId: string, targetId: string): Promise<AttackTarget> {
  return readTarget(await rpc("castle_attack_target", { _hero: heroId, _target: targetId }));
}

export async function loadWarLog(heroId: string): Promise<WarEvent[]> {
  const data = await rpc("castle_war_log", { _hero: heroId });
  if (!Array.isArray(data)) return [];
  return (data as unknown[]).map((entry) => {
    const e = object(entry);
    return {
      id: String(e["id"]),
      attacker_id: String(e["attacker_id"]),
      defender_id: String(e["defender_id"]),
      attacker: String(e["attacker"]),
      defender: String(e["defender"]),
      defender_won: e["defender_won"] === true,
      gold: num(e["gold"]),
      at: String(e["at"]),
    };
  });
}

/** True when a spot is inside the world and clear of every castle the map shows. */
export function spotClear(state: WorldState, x: number, y: number): boolean {
  if (x < WORLD_MARGIN || x > WORLD_UNITS - WORLD_MARGIN || y < WORLD_MARGIN || y > WORLD_UNITS - WORLD_MARGIN) return false;
  return !state.castles.some((c) => (c.x - x) * (c.x - x) + (c.y - y) * (c.y - y) < WORLD_GAP * WORLD_GAP);
}

export function resetLabel(state: { resetAt: string }): string {
  return new Date(state.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Move the castle. The request id is kept until the move is accepted, so a retry
 * after a lost connection is recognised by the server instead of costing a second move.
 */
export async function relocateCastle(heroId: string, x: number, y: number): Promise<WorldState> {
  const kind = `world-move:${x}:${y}`;
  const req = requestKey(localStorage, heroId, kind, () => crypto.randomUUID());
  const state = readWorld(await rpc("relocate_castle", { _hero: heroId, _x: x, _y: y, _req: req }));
  localStorage.removeItem(`ef-pending:${heroId}:${kind}`);
  return state;
}

/**
 * Report the outcome of one assault. The server decides the gold that changes
 * hands, the fame it is worth, and returns the attacker's save, which is adopted
 * here so the local character can never disagree with the server about its own coffers.
 */
export async function reportAssault(targetId: string, won: boolean): Promise<AttackResult> {
  return withServerHero(async (id) => {
    const kind = `castle-assault:${targetId}`;
    const req = requestKey(localStorage, id, kind, () => crypto.randomUUID());
    const data = await rpc("attack_castle", { _hero: id, _target: targetId, _won: won, _req: req });
    const result = readResult(data);
    localStorage.removeItem(`ef-pending:${id}:${kind}`);
    adoptServerSave(id, returnedSave(data));
    return result;
  });
}

/**
 * Open a fight with a monster that stands in the world. The server prices the
 * encounter, spends one of the day's encounters and answers with the level and
 * rewards it will pay; nothing here decides a reward.
 */
export async function openEncounter(heroId: string, area: string, monster: string, kind: MonsterKind): Promise<Encounter> {
  const safeKind = KINDS.includes(kind) ? kind : "normal";
  const req = requestKey(localStorage, heroId, `world-fight:${area}:${monster}`, () => crypto.randomUUID());
  return readEncounter(await rpc("world_encounter", { _hero: heroId, _area: area, _monster: monster, _kind: safeKind, _req: req }));
}

/**
 * Settle the encounter the player just fought. The server writes the XP, gold,
 * fame and loot into the protected save and the returned save is adopted as-is —
 * the client never grants world rewards itself.
 */
export async function settleEncounter(encounter: Encounter, won: boolean): Promise<EncounterResult> {
  return withServerHero(async (id) => {
    const data = await rpc("world_settle", { _hero: id, _req: encounter.req, _won: won });
    // Read the whole answer before adopting it: a half-read reward must never reach the save.
    const result = readEncounterResult(data);
    const save = returnedSave(data);
    localStorage.removeItem(`ef-pending:${id}:world-fight:${encounter.area}:${encounter.monster}`);
    adoptServerSave(id, save);
    return result;
  });
}

/** Harvest one node; the server decides what the node yields and when the ground renews. */
export async function harvestNode(area: string, node: NodeKind): Promise<HarvestResult> {
  return withServerHero(async (id) => {
    const req = requestKey(localStorage, id, `world-node:${area}:${node}`, () => crypto.randomUUID());
    const data = await rpc("world_harvest", { _hero: id, _area: area, _node: node, _req: req });
    const result = readHarvest(data);
    const save = returnedSave(data);
    localStorage.removeItem(`ef-pending:${id}:world-node:${area}:${node}`);
    adoptServerSave(id, save);
    return result;
  });
}
