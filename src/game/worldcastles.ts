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
  assaultsLeft: number;
  assaultsPerDay: number;
  blocked: "" | "no-assaults" | "already-assaulted";
}

export interface AttackResult {
  won: boolean;
  gold: number;
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

const CLASS_KEYS: HeroClass[] = ["warrior", "mage", "archer"];

/** The world RPCs were added after the last type generation; keep the cast in one place. */
type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
const call = supabase.rpc as unknown as Rpc;

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
  return {
    day: String(r["day"] ?? ""),
    resetAt: String(r["resetAt"]),
    movesPerDay: perDay,
    movesUsed: used,
    movesLeft: Number.isFinite(r["movesLeft"]) ? num(r["movesLeft"]) : Math.max(0, perDay - used),
    assaultsPerDay,
    assaultsLeft: Number.isFinite(r["assaultsLeft"]) ? num(r["assaultsLeft"]) : assaultsPerDay,
    mine,
    castles: list.filter((c) => c.hero_id !== mine.hero_id),
  };
}

function readTarget(value: unknown): AttackTarget {
  const t = object(value);
  const s = object(t["stats"]);
  if (typeof t["hero_id"] !== "string" || typeof t["name"] !== "string" ||
      !CLASS_KEYS.includes(t["cls"] as HeroClass) || !Number.isFinite(t["level"])) {
    throw new Error("That castle's lord could not be read. Open the World Tree again.");
  }
  const blocked = t["blocked"] === "no-assaults" || t["blocked"] === "already-assaulted" ? t["blocked"] : "";
  return {
    hero_id: t["hero_id"],
    name: t["name"],
    cls: t["cls"] as HeroClass,
    gender: t["gender"] === "female" ? "female" : "male",
    level: num(t["level"]),
    power: num(t["power"]),
    coffers: num(t["coffers"]),
    stats: {
      hp: Math.max(1, num(s["hp"])),
      atk: num(s["atk"]),
      def: num(s["def"]),
      crit: num(s["crit"]),
      dodge: num(s["dodge"]),
      critDmg: num(s["critDmg"]) || 200,
      pen: num(s["pen"]),
      acc: num(s["acc"]),
    },
    assaultsLeft: num(t["assaultsLeft"]),
    assaultsPerDay: num(t["assaultsPerDay"]) || CASTLE_ASSAULTS_PER_DAY,
    blocked,
  };
}

function readResult(value: unknown): AttackResult {
  const a = object(object(value)["attack"]);
  if (typeof a["won"] !== "boolean") throw new Error("The assault result could not be read. Reopen the World Tree.");
  return {
    won: a["won"],
    gold: num(a["gold"]),
    defender: String(a["defender"] ?? ""),
    assaultsLeft: num(a["assaultsLeft"]),
    assaultsPerDay: num(a["assaultsPerDay"]) || CASTLE_ASSAULTS_PER_DAY,
    replay: a["replay"] === true,
  };
}

export async function loadWorld(heroId: string): Promise<WorldState> {
  const { data, error } = await call("world_map", { _hero: heroId });
  if (error) throw new Error(error.message);
  return readWorld(data);
}

export async function loadAttackTarget(heroId: string, targetId: string): Promise<AttackTarget> {
  const { data, error } = await call("castle_attack_target", { _hero: heroId, _target: targetId });
  if (error) throw new Error(error.message);
  return readTarget(data);
}

export async function loadWarLog(heroId: string): Promise<WarEvent[]> {
  const { data, error } = await call("castle_war_log", { _hero: heroId });
  if (error) throw new Error(error.message);
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

export function resetLabel(state: WorldState): string {
  return new Date(state.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Move the castle. The request id is kept until the move is accepted, so a retry
 * after a lost connection is recognised by the server instead of costing a second move.
 */
export async function relocateCastle(heroId: string, x: number, y: number): Promise<WorldState> {
  const kind = `world-move:${x}:${y}`;
  const req = requestKey(localStorage, heroId, kind, () => crypto.randomUUID());
  const { data, error } = await call("relocate_castle", { _hero: heroId, _x: x, _y: y, _req: req });
  if (error) throw new Error(error.message);
  const state = readWorld(data);
  localStorage.removeItem(`ef-pending:${heroId}:${kind}`);
  return state;
}

/**
 * Report the outcome of one assault. The server decides the gold that changes
 * hands and returns the attacker's save, which is adopted here so the local
 * character can never disagree with the server about its own coffers.
 */
export async function reportAssault(targetId: string, won: boolean): Promise<AttackResult> {
  return withServerHero(async (id) => {
    const kind = `castle-assault:${targetId}`;
    const req = requestKey(localStorage, id, kind, () => crypto.randomUUID());
    const { data, error } = await call("attack_castle", { _hero: id, _target: targetId, _won: won, _req: req });
    if (error) throw new Error(error.message);
    adoptServerSave(id, returnedSave(data));
    localStorage.removeItem(`ef-pending:${id}:${kind}`);
    return readResult(data);
  });
}