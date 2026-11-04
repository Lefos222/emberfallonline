import { supabase } from "@/integrations/supabase/client";
import { flushSave, getState, update } from "./store";
import { CASTLE_RAIDS_PER_DAY, WORLD_H, WORLD_W, type WorldSite } from "./worldmap";

/**
 * The player's castle, and everyone else's, on the bounded world map.
 *
 * Every hero may plant one banner anywhere in the realm. The banner lives in the
 * hero's own save row (`heroes.save->worldCastle`), so the realm registry works on
 * the backend the game already runs on — no extra table or migration — and every
 * signed-in player can read where the public heroes planted theirs. The device
 * keeps a copy too, so the map still shows the hero's own banner while offline.
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
  // The save is the shared truth: another device may have moved this banner.
  const state = getState();
  const live = state.heroId === heroId ? state.hero?.worldCastle : undefined;
  if (live && inWorld(live.x, live.y)) {
    return { x: live.x, y: live.y, name: state.hero?.name ?? "Your castle", placedAt: live.at };
  }
  const c = readJson<MyCastle>(castleKey(heroId));
  if (!c || !inWorld(c.x, c.y)) return null;
  return c;
}

function remember(heroId: string, castle: MyCastle) {
  writeJson(castleKey(heroId), castle);
  return castle;
}

/** One public hero row, carrying only the banner part of its save. */
interface BannerRow {
  id: string;
  name: string;
  level: number;
  castle: unknown;
}

/** Read every banner planted in the realm by another lord. */
export async function loadWorldBanners(): Promise<WorldBanner[]> {
  // Only the banner field of the save is transferred; inventories stay private.
  const { data, error } = await supabase
    .from("heroes")
    .select<string, BannerRow>("id,name,level,castle:save->worldCastle")
    .eq("is_public", true)
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((r) => {
    const banner = (r.castle ?? null) as { x?: unknown; y?: unknown } | null;
    const x = Number(banner?.x);
    const y = Number(banner?.y);
    if (!banner || !inWorld(x, y) || typeof r.id !== "string") return [];
    const name = typeof r.name === "string" ? r.name.trim() : "";
    return [{ heroId: r.id, name: name || "A nameless banner", x, y, level: Number(r.level) || 1 }];
  });
}

/**
 * Plant (or move) this hero's banner. The save is authoritative; the device keeps
 * the banner either way, and `synced` says whether the realm knows of it.
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
  if (getState().heroId !== heroId || !getState().hero) {
    return { castle, synced: false, error: "Select a character first." };
  }
  update((h) => {
    h.worldCastle = { x: castle.x, y: castle.y, at: castle.placedAt };
  });
  const saved = await flushSave();
  return saved
    ? { castle, synced: true }
    : { castle, synced: false, error: "The realm registry did not answer." };
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
