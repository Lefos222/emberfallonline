import { supabase } from "@/integrations/supabase/client";
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
  mine: WorldCastle;
  castles: WorldCastle[];
}

const CLASS_KEYS: HeroClass[] = ["warrior", "mage", "archer"];

/** The world RPCs were added after the last type generation; keep the cast in one place. */
type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
const call = supabase.rpc as unknown as Rpc;

function readCastle(value: unknown): WorldCastle {
  const c = (value ?? {}) as Record<string, unknown>;
  if (typeof c["hero_id"] !== "string" || typeof c["name"] !== "string" || !CLASS_KEYS.includes(c["cls"] as HeroClass) ||
      !Number.isFinite(c["level"]) || !Number.isFinite(c["x"]) || !Number.isFinite(c["y"])) {
    throw new Error("The world map returned a castle that could not be read. Open the World Tree again.");
  }
  return {
    hero_id: c["hero_id"],
    name: c["name"],
    cls: c["cls"] as HeroClass,
    gender: c["gender"] === "female" ? "female" : "male",
    level: Number(c["level"]),
    power: Number(c["power"] ?? 0),
    x: Number(c["x"]),
    y: Number(c["y"]),
  };
}

/** A payload without its own castle is an error, never an empty world. */
export function readWorld(value: unknown): WorldState {
  const r = (value ?? {}) as Record<string, unknown>;
  const list = Array.isArray(r["castles"]) ? r["castles"].map(readCastle) : null;
  if (!list || !r["mine"] || typeof r["resetAt"] !== "string") throw new Error("The world map is unavailable right now. Please retry.");
  const mine = readCastle(r["mine"]);
  const perDay = Number(r["movesPerDay"] ?? WORLD_MOVES_PER_DAY);
  const used = Number(r["movesUsed"] ?? 0);
  return {
    day: String(r["day"] ?? ""),
    resetAt: String(r["resetAt"]),
    movesPerDay: perDay,
    movesUsed: used,
    movesLeft: Number.isFinite(r["movesLeft"]) ? Number(r["movesLeft"]) : Math.max(0, perDay - used),
    mine,
    castles: list.filter((c) => c.hero_id !== mine.hero_id),
  };
}

export async function loadWorld(heroId: string): Promise<WorldState> {
  const { data, error } = await call("world_map", { _hero: heroId });
  if (error) throw new Error(error.message);
  return readWorld(data);
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
  const key = `ef-pending:${heroId}:world-move:${x}:${y}`;
  const req = localStorage.getItem(key) ?? crypto.randomUUID();
  localStorage.setItem(key, req);
  const { data, error } = await call("relocate_castle", { _hero: heroId, _x: Math.round(x), _y: Math.round(y), _req: req });
  if (error) throw new Error(error.message);
  const state = readWorld(data);
  localStorage.removeItem(key);
  return state;
}