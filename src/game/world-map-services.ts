import { supabase } from "@/integrations/supabase/client";
import { object, requestKey } from "./services-contract";
import { getState, withServerHero } from "./store";
import { CASTLE_MOVES_PER_DAY, movesLeftToday, plotOf } from "./world-map";

/**
 * The generated database types are produced from the live schema; the world map is
 * read through a narrow untyped view here until the next type generation pass, so a
 * missing type never blocks the map from loading.
 */
interface Reply { data: unknown; error: { message: string } | null }
const db = supabase as unknown as {
  from: (table: string) => { select: (columns: string) => PromiseLike<Reply> };
  rpc: (name: string, args: Record<string, unknown>) => PromiseLike<Reply>;
};

export interface WorldCastle {
  heroId: string; plot: string; owner: string; cls: string; gender: string;
  level: number; power: number; moveDay: string | null; movesUsed: number; placedAt: string;
}

const CASTLE_COLS = "hero_id,plot,owner_name,hero_class,gender,level,power,move_day,moves_used,placed_at";

/** One row of world_castles, or null when the row is not a castle we can draw. */
function toCastle(value: unknown): WorldCastle | null {
  const r = object(value);
  const heroId = r['hero_id'];
  const plot = r['plot'];
  if (typeof heroId !== "string" || typeof plot !== "string" || !plotOf(plot)) return null;
  return {
    heroId, plot,
    owner: typeof r['owner_name'] === "string" && r['owner_name'] ? r['owner_name'] : "An unknown lord",
    cls: typeof r['hero_class'] === "string" ? r['hero_class'] : "warrior",
    gender: r['gender'] === "female" ? "female" : "male",
    level: Number(r['level']) || 1,
    power: Number(r['power']) || 0,
    moveDay: typeof r['move_day'] === "string" ? r['move_day'] : null,
    movesUsed: Number(r['moves_used']) || 0,
    placedAt: typeof r['placed_at'] === "string" ? r['placed_at'] : "",
  };
}

/** Every castle currently standing on the world map, other players' included. */
export async function loadWorldCastles(): Promise<WorldCastle[]> {
  const { data, error } = await db.from("world_castles").select(CASTLE_COLS);
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error("The world map could not be read. Try again in a moment.");
  return data.map(toCastle).filter((c): c is WorldCastle => c !== null);
}

export interface CastleMove { plot: string; movesUsed: number; remaining: number }

/**
 * Move (or, the first time, place) the player's castle. The server owns the plot list,
 * the daily limit and the clock; the request keeps one id so a retry after a dropped
 * response repeats the same move instead of spending a second one.
 */
export async function moveCastle(plotId: string): Promise<CastleMove> {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  if (!plotOf(plotId)) throw new Error("That is not a castle plot on the world map.");
  const req = requestKey(localStorage, id, "castle-move", () => crypto.randomUUID());
  const reply = await withServerHero(async (heroId) => {
    const { data, error } = await db.rpc("world_castle_move", { _hero: heroId, _plot: plotId, _req: req });
    if (error) throw new Error(error.message);
    return object(data);
  });
  const plot = reply['plot'];
  if (typeof plot !== "string" || !plotOf(plot)) throw new Error("The game server did not confirm the move. Reopen the world map to check your castle.");
  localStorage.removeItem(`ef-pending:${id}:castle-move`);
  return { plot, movesUsed: Number(reply['moves_used']) || 0, remaining: Number(reply['remaining']) || 0 };
}

export const myCastle = (castles: WorldCastle[] | null, heroId: string | null) =>
  (heroId ? castles?.find((c) => c.heroId === heroId) : undefined) ?? null;

/** Moves left today for the player's own castle; every move is free until the limit is spent. */
export const castleMovesLeft = (mine: WorldCastle | null) =>
  mine ? movesLeftToday(mine.moveDay, mine.movesUsed) : CASTLE_MOVES_PER_DAY;
