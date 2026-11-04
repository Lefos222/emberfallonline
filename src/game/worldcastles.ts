import { supabase } from "@/integrations/supabase/client";
import { CASTLE_RAIDS_PER_DAY, WORLD_H, WORLD_W, type WorldSite } from "./worldmap";

/**
 * The player's castle, and everyone else's, on the bounded world map.
 *
 * Every hero may plant one banner anywhere in the realm, so the map has to hold
 * thousands of them: placements live in the `world_castles` table (one row per
 * hero) and are read back through the `world_castles` RPC. The device keeps a
 * copy of the hero's own banner so the map still shows it — and still lets the
 * hero move it — while the registry is unreachable or before the migration that
 * adds the table has been applied.
 */
export interface MyCastle {
  x: number;
  y: number;
  name: string;
  placedAt: string;
}

export interface WorldBanner {
  heroId: string;
  name: string;
  x: number;
  y: number;
  level: number;
}

const castleKey = (heroId: string) => `ef-world-castle:${heroId}`;
const raidsKey = (heroId: string) => `ef-world-castle-raids:${heroId}`;
const today = () => new Date().toISOString().slice(0, 10);

function readJson<T>(key: string): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the map still works, it just forgets the castle */
  }
}

/** Keep a banner inside the painted realm. */
export const inWorld = (x: number, y: number) =>
  Number.isFinite(x) &&
  Number.isFinite(y) &&
  x >= 0 &&
  x <= WORLD_W &&
  y >= 0 &&
  y <= WORLD_H;

export function loadMyCastle(heroId: string | null): MyCastle | null {
  if (!heroId) return null;
  const c = readJson<MyCastle>(castleKey(heroId));
  if (!c || !inWorld(c.x, c.y)) return null;
  return c;
}

function remember(heroId: string, castle: MyCastle) {
  writeJson(castleKey(heroId), castle);
  return castle;
}

/** One row of the realm registry, as the RPC returns it. */
interface BannerRow {
  hero?: unknown;
  x?: unknown;
  y?: unknown;
  name?: unknown;
  level?: unknown;
}

/** Read every banner planted in the realm. */
export async function loadWorldBanners(): Promise<WorldBanner[]> {
  const { data, error } = await supabase.rpc("world_castle_map");
  if (error) throw new Error(error.message);
  const rows = ((data as { castles?: BannerRow[] } | null)?.castles ?? []).filter(
    (r): r is BannerRow => !!r && typeof r === "object",
  );
  return rows.flatMap((r) => {
    const x = Number(r.x);
    const y = Number(r.y);
    if (!inWorld(x, y) || typeof r.hero !== "string") return [];
    const name = typeof r.name === "string" ? r.name.trim() : "";
    return [{ heroId: r.hero, name: name || "A nameless banner", x, y, level: Number(r.level) || 1 }];
  });
}

/**
 * Plant (or move) this hero's banner. The registry is authoritative; the device
 * keeps the banner either way, and `synced` says whether the realm knows of it.
 */
export async function plantBanner(
  heroId: string | null,
  x: number,
  y: number,
  name: string,
): Promise<{ castle: MyCastle; synced: boolean; error?: string }> {
  const castle: MyCastle = {
    x: Math.round(x),
    y: Math.round(y),
    name: name.trim() || "Your castle",
    placedAt: new Date().toISOString(),
  };
  if (!heroId || !inWorld(castle.x, castle.y)) {
    return { castle, synced: false, error: "That ground lies beyond the realm." };
  }
  remember(heroId, castle);
  const { error } = await supabase.rpc("world_castle_place", {
    _hero: heroId,
    _x: castle.x,
    _y: castle.y,
    _name: castle.name,
  });
  return error ? { castle, synced: false, error: error.message } : { castle, synced: true };
}

/** Castle assaults left today (UTC day, the same clock as the world raids). */
export function castleRaidsLeft(heroId: string | null): number {
  if (!heroId) return CASTLE_RAIDS_PER_DAY;
  const rec = readJson<{ day: string; used: number }>(raidsKey(heroId));
  if (!rec || rec.day !== today()) return CASTLE_RAIDS_PER_DAY;
  return Math.max(0, CASTLE_RAIDS_PER_DAY - (Number(rec.used) || 0));
}

/** Spend one castle assault; returns the number left. */
export function spendCastleRaid(heroId: string | null): number {
  const left = castleRaidsLeft(heroId);
  if (!heroId || left <= 0) return left;
  const used = CASTLE_RAIDS_PER_DAY - left + 1;
  writeJson(raidsKey(heroId), { day: today(), used });
  return CASTLE_RAIDS_PER_DAY - used;
}

/**
 * The server node that settles a castle assault. Castles pay their plunder through
 * the gold raid allowance, so the reward is granted by `world_raid_complete` and can
 * never be forged by the client.
 */
export function castleRaidNode(site: WorldSite): string {
  const seed = [...site.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return `gold-${(seed % 7) + 1}`;
}
