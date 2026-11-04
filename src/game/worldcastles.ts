import { CASTLE_RAIDS_PER_DAY, type WorldSite } from "./worldmap";

/**
 * The player's castle in the endless world.
 *
 * Where it stands is presentation, not a reward, so it is kept on the device the
 * player is using: claiming an abandoned castle teleports the banner there and the
 * world remembers it. The plunder a raid pays for is not client-owned — every
 * castle assault settles through the existing server raid RPC (see WorldMap).
 */
export interface MyCastle {
  siteId: string;
  x: number;
  y: number;
  name: string;
  placedAt: string;
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

export function loadMyCastle(heroId: string | null): MyCastle | null {
  if (!heroId) return null;
  const c = readJson<MyCastle>(castleKey(heroId));
  if (!c || typeof c.siteId !== "string" || !Number.isFinite(c.x) || !Number.isFinite(c.y))
    return null;
  return c;
}

/** Teleport the player's castle onto an abandoned one. Only a ruin can be claimed. */
export function placeCastle(heroId: string | null, site: WorldSite): MyCastle | null {
  if (!heroId || site.kind !== "ruin") return null;
  const castle: MyCastle = {
    siteId: site.id,
    x: site.x,
    y: site.y,
    name: "Your castle",
    placedAt: new Date().toISOString(),
  };
  writeJson(castleKey(heroId), castle);
  return castle;
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
