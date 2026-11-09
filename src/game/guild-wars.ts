import { supabase } from "@/integrations/supabase/client";

/**
 * Guild Wars (drizzle/migrations/0026_guild_wars.sql). A war is server-owned: the client only
 * reports each attack it fought, the database keeps every score and hands out the spoils through
 * a save-writing RPC, exactly like the rest of the guild tables.
 */

type RPCError = { code?: string; message: string };

const client = supabase as unknown as {
  rpc<K extends keyof WarRPCs>(
    name: K,
    args: WarRPCs[K]["args"],
  ): PromiseLike<{ data: WarRPCs[K]["result"] | null; error: RPCError | null }>;
};

/** Shown when the live database has not had the guild-war SQL applied yet. */
export const GUILD_WARS_SQL_MISSING =
  "Guild wars are not live on the game database yet — apply drizzle/migrations/0026_guild_wars.sql.";

/** One enemy hero and how many of my two attacks on them are spent. */
export interface WarEnemy {
  id: string;
  name: string;
  level: number;
  power: number;
  hero_class: string;
  gender: string;
  attacks: number;
}

export type WarSide = "a" | "b";

/** The war my guild is fighting right now. */
export interface GuildWarInfo {
  id: string;
  side: WarSide;
  my_score: number;
  their_score: number;
  starts_at: string;
  ends_at: string;
  opponent: { id: string; name: string; level: number } | null;
  enemies: WarEnemy[];
}

export type WarResult = "win" | "loss" | "draw";

/** One finished war in the hall's ledger. */
export interface GuildWarHistory {
  id: string;
  ends_at: string;
  result: WarResult;
  my_score: number;
  their_score: number;
  opponent: string | null;
  claimed: boolean;
}

export interface GuildWarState {
  guild: string;
  war: GuildWarInfo | null;
  history: GuildWarHistory[];
}

export interface WarAttackReport {
  my_score: number;
  their_score: number;
  attacks_left: number;
}

/** What the claim RPC hands back: the fresh save plus the spoils it paid. */
export interface WarClaim {
  save: unknown;
  gold: number;
  mats: Record<string, number>;
  won: boolean;
  draw: boolean;
}

type WarRPCs = {
  guild_war_start: { args: { _hero: string; _guild: string }; result: string };
  guild_war_state: { args: { _hero: string }; result: GuildWarState };
  guild_war_attack: { args: { _hero: string; _war: string; _target: string; _won: boolean }; result: WarAttackReport };
  guild_war_claim: { args: { _hero: string; _war: string }; result: WarClaim };
};

function missingFunction(error: RPCError) {
  return error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
}

async function call<K extends keyof WarRPCs>(name: K, args: WarRPCs[K]["args"]): Promise<WarRPCs[K]["result"]> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(missingFunction(error) ? GUILD_WARS_SQL_MISSING : error.message);
  if (data === null || data === undefined) throw new Error("The guild war server returned no data.");
  return data;
}

const EMPTY: GuildWarState = { guild: "", war: null, history: [] };

/** My guild's open war, its enemies and its finished wars. */
export async function loadGuildWar(heroId: string): Promise<GuildWarState> {
  const state = await call("guild_war_state", { _hero: heroId });
  return { ...EMPTY, ...state, history: state.history ?? [], war: state.war ?? null };
}

/** Declare war on another guild (leader or officer only). Returns the new war id. */
export async function declareGuildWar(heroId: string, guildId: string): Promise<string> {
  return call("guild_war_start", { _hero: heroId, _guild: guildId });
}

/** Record one attack I fought; the server spends one of my two attempts on that enemy. */
export async function reportGuildWarAttack(heroId: string, warId: string, targetId: string, won: boolean) {
  return call("guild_war_attack", { _hero: heroId, _war: warId, _target: targetId, _won: won });
}

/** Collect the spoils of a settled war. */
export async function claimGuildWarReward(heroId: string, warId: string) {
  return call("guild_war_claim", { _hero: heroId, _war: warId });
}

export function guildWarError(error: unknown): string {
  return error instanceof Error ? error.message : "The guild war server could not be reached. Please retry.";
}
