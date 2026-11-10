import { supabase } from "@/integrations/supabase/client";

/**
 * Guild Wars (drizzle/migrations/0021_guild_wars.sql + 0022_guild_wars_v2.sql). A war is
 * server-owned: the client only reports each attack it fought, the database keeps every score and
 * hands out the spoils through a save-writing RPC, exactly like the rest of the guild tables.
 *
 * v2 shape: a war is declared as a CHALLENGE in a size bracket (5v5 … 100v100). The challenged
 * guild's leader or officer accepts or declines it. Once accepted, both rosters are frozen at the
 * bracket's strongest members; every hero on a roster gets TWO attacks for the whole war, and a won
 * attack scores one point. The higher score when the 24 hours are up takes the larger reward — the
 * losing side is still paid, just less.
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
  "Guild Wars are temporarily unavailable. Please refresh and try again.";

/** Every bracket a war can be fought in. */
export const WAR_SIZES = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
] as const;
export type WarSize = (typeof WAR_SIZES)[number];

/** "5v5", "100v100" — how a size bracket is written everywhere. */
export const warBracket = (size: number) => `${size}v${size}`;

/** Attacks every hero on a war roster gets for the whole war. */
export const WAR_ATTACKS = 2;

/** One enemy hero and how many of my two attacks were spent on them. */
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
  size: number;
  my_score: number;
  their_score: number;
  starts_at: string;
  ends_at: string;
  /** How many of my two attacks are still unused. */
  attacks_left: number;
  opponent: { id: string; name: string; level: number } | null;
  enemies: WarEnemy[];
}

/** A challenge waiting for an answer (or one my guild sent and is waiting on). */
export interface GuildWarChallenge {
  id: string;
  size: number;
  /** True when my guild declared it and the other guild has not answered yet. */
  outgoing: boolean;
  created_at: string;
  expires_at: string;
  guild: { id: string; name: string; level: number } | null;
}

export type WarResult = "win" | "loss" | "draw";

/** One finished war in the hall's ledger. */
export interface GuildWarHistory {
  id: string;
  size: number;
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
  challenges: GuildWarChallenge[];
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

export interface WarResponse {
  status: "open" | "declined";
  ends_at?: string;
  size?: number;
}

type WarRPCs = {
  guild_war_start: { args: { _hero: string; _guild: string; _size: number }; result: string };
  guild_war_state: { args: { _hero: string }; result: GuildWarState };
  guild_war_respond: {
    args: { _hero: string; _war: string; _accept: boolean };
    result: WarResponse;
  };
  guild_war_cancel: { args: { _hero: string; _war: string }; result: null };
  guild_war_attack: {
    args: { _hero: string; _war: string; _target: string; _won: boolean };
    result: WarAttackReport;
  };
  guild_war_claim: { args: { _hero: string; _war: string }; result: WarClaim };
};

function missingFunction(error: RPCError) {
  return error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
}

async function call<K extends keyof WarRPCs>(
  name: K,
  args: WarRPCs[K]["args"],
): Promise<WarRPCs[K]["result"]> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(missingFunction(error) ? GUILD_WARS_SQL_MISSING : error.message);
  return (data ?? null) as WarRPCs[K]["result"];
}

const EMPTY: GuildWarState = { guild: "", war: null, challenges: [], history: [] };

/** My guild's open war, the challenges on either side and its finished wars. */
export async function loadGuildWar(heroId: string): Promise<GuildWarState> {
  const state = await call("guild_war_state", { _hero: heroId });
  const war = state?.war
    ? {
        ...state.war,
        size: state.war.size ?? 5,
        attacks_left: state.war.attacks_left ?? WAR_ATTACKS,
      }
    : null;
  return {
    ...EMPTY,
    ...state,
    war,
    challenges: state?.challenges ?? [],
    history: (state?.history ?? []).map((h) => ({ ...h, size: h.size ?? 5 })),
  };
}

/** Challenge another guild in a bracket (leader or officer only). Returns the challenge id. */
export async function declareGuildWar(
  heroId: string,
  guildId: string,
  size: number,
): Promise<string> {
  return call("guild_war_start", { _hero: heroId, _guild: guildId, _size: size });
}

/** Accept or decline a challenge as the challenged guild (leader or officer only). */
export async function respondGuildWar(
  heroId: string,
  warId: string,
  accept: boolean,
): Promise<WarResponse> {
  return call("guild_war_respond", { _hero: heroId, _war: warId, _accept: accept });
}

/** Withdraw a challenge my guild sent and nobody answered yet. */
export async function cancelGuildWar(heroId: string, warId: string): Promise<void> {
  await call("guild_war_cancel", { _hero: heroId, _war: warId });
}

/** Record one attack I fought; the server spends one of my two attempts for the war. */
export async function reportGuildWarAttack(
  heroId: string,
  warId: string,
  targetId: string,
  won: boolean,
) {
  return call("guild_war_attack", { _hero: heroId, _war: warId, _target: targetId, _won: won });
}

/** Collect the spoils of a settled war. */
export async function claimGuildWarReward(heroId: string, warId: string) {
  return call("guild_war_claim", { _hero: heroId, _war: warId });
}

export interface WarSpoils {
  gold: number;
  mats: Record<string, number>;
}

/** Gold and materials a bracket pays, matching guild_war_claim. */
export function warSpoils(size: number, result: WarResult, level = 1): WarSpoils {
  const mult = 1 + (Math.max(5, size) - 5) * 0.1;
  if (result === "win")
    return {
      gold: Math.round((3000 + level * 40) * mult),
      mats: {
        starshard: Math.max(1, Math.floor(size / 25)),
        bossCore: Math.max(1, Math.floor(size / 50)),
      },
    };
  if (result === "draw")
    return {
      gold: Math.round((2200 + level * 28) * mult),
      mats: { starshard: Math.max(1, Math.floor(size / 50)) },
    };
  return {
    gold: Math.round((1200 + level * 15) * mult),
    mats: size >= 25 ? { starshard: 1 } : {},
  };
}

export function guildWarError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The guild war server could not be reached. Please retry.";
}
