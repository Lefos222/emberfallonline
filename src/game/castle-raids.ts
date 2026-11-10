import { supabase } from "@/integrations/supabase/client";
import type { Hero } from "./data";
import { scaledGold } from "./gold";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";

/**
 * Player castle raids on the World Tree. The fight is client-side like every battle, but the
 * daily limit (3), the 8-hour rebuild per target and the plunder are all settled by the
 * server's `player_castle_raid` RPC, which also keeps the raid log both lords can read.
 * Defenders never lose gold — a raid pays plunder from the realm, scaled by the defender's
 * level and fortification, so a strong wall makes a castle a prize and a harder fight.
 */
export const PLAYER_RAIDS_PER_DAY = 3;
export const RAID_REBUILD_HOURS = 8;
export const FORT_MAX = 10;

export const fortLevel = (h: Pick<Hero, "worldCastle">) =>
  Math.max(0, Math.min(FORT_MAX, Math.floor(Number(h.worldCastle?.fort) || 0)));

/** Gold to raise the walls from `fort` to `fort + 1`. */
export const fortCost = (fort: number, level = 1) => scaledGold(2000 * (fort + 1) ** 2, level);

/** Defender stat multiplier from its walls (+6% a level). */
export const fortStatMult = (fort: number) => 1 + 0.06 * Math.max(0, Math.min(FORT_MAX, fort));

/** Plunder a won raid pays — mirrors player_castle_raid SQL. */
export const raidPlunder = (targetLevel: number, fort: number) =>
  Math.round((300 + targetLevel * 25) * (1 + Math.max(0, Math.min(FORT_MAX, fort)) * 0.1));

export function upgradeFort(h: Hero): string | null {
  if (!h.worldCastle) return "Plant your banner first";
  const f = fortLevel(h);
  if (f >= FORT_MAX) return "Your walls are at their peak";
  const cost = fortCost(f, h.level);
  if (h.gold < cost) return `Not enough gold — ${cost.toLocaleString()} needed`;
  h.gold -= cost;
  h.worldCastle = { ...h.worldCastle, fort: f + 1 };
  return null;
}

export interface CastleRaidLog {
  id: string;
  attacker_id: string;
  defender_id: string;
  attacker_name: string;
  defender_name: string;
  won: boolean;
  gold: number;
  created_at: string;
}

export async function loadCastleLog(heroId: string): Promise<CastleRaidLog[]> {
  const { data, error } = await supabase
    .from("castle_raids")
    .select("id,attacker_id,defender_id,attacker_name,defender_name,won,gold,created_at")
    .or(`attacker_id.eq.${heroId},defender_id.eq.${heroId}`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return (data ?? []) as CastleRaidLog[];
}

const utcDay = (iso: string) => iso.slice(0, 10);

/** Raids this hero launched today (UTC), counted from the log. */
export const raidsUsedToday = (log: CastleRaidLog[], heroId: string, now = new Date()) =>
  log.filter((r) => r.attacker_id === heroId && utcDay(r.created_at) === now.toISOString().slice(0, 10)).length;

/** Ms until `target` can be raided again by this hero; 0 when ready. */
export function rebuildWait(log: CastleRaidLog[], heroId: string, target: string, now = Date.now()) {
  const last = log.find((r) => r.attacker_id === heroId && r.defender_id === target);
  if (!last) return 0;
  return Math.max(0, new Date(last.created_at).getTime() + RAID_REBUILD_HOURS * 3600_000 - now);
}

export interface CastleDefender {
  id: string;
  name: string;
  hero_class: string;
  gender: string;
  level: number;
  fort: number;
  stats: { hp: number; atk: number; def: number; crit: number; dodge?: number; critDmg?: number; pen?: number; acc?: number; paragon?: number };
}

export async function loadDefender(target: string): Promise<CastleDefender | null> {
  const { data, error } = await supabase
    .from("heroes")
    .select("id,name,hero_class,gender,level,stats,fort:save->worldCastle->fort")
    .eq("id", target)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as CastleDefender & { fort: unknown };
  return { ...row, fort: Math.max(0, Math.min(FORT_MAX, Math.floor(Number(row.fort) || 0))) };
}

/** Report a fought raid; the server checks the limits and pays plunder for a win. */
export async function reportCastleRaid(target: string, won: boolean) {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const op = `castle-raid:${target}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  const result = await withServerHero(async (heroId) => {
    const { data, error } = await supabase.rpc("player_castle_raid", {
      _hero: heroId,
      _target: target,
      _won: won,
      _req: req,
    });
    if (error) throw new Error(error.message);
    adoptServerSave(heroId, returnedSave(data));
    return object(data);
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
  return { gold: Number(result["gold"]) || 0 };
}
