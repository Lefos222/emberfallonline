import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";

/**
 * Guild events, all settled by the server (migration 0030):
 *  - Guild boss raids: a boss wakes every 4 hours (UTC) for 60 minutes; each member gets 3
 *    attacks; damage comes from the hero's level, and when the guild's total beats the boss's
 *    health every member who fought claims the spoils.
 *  - Weekly guild quests: shared goals (battles won, raid attacks, gold donated, bosses slain);
 *    when the guild finishes one, every member claims the reward once per week.
 *  - The weekly guild tournament: guilds score points against each other — Guild War wins 10,
 *    draws 5, raid boss kills 3, completed quests 2 — and last week's ranking pays every member.
 */
export const RAID_ATTACKS = 3;
export type GuildQuestKind = "battles" | "raid" | "gold" | "kills";

export interface GuildEventsState {
  raid: {
    window: string; opens_until: string; next: string; open: boolean;
    hp: number; dealt: number; my_hits: number; claimable: string[];
    board: { name: string; dmg: number }[];
  };
  quests: { kind: GuildQuestKind; target: number; amount: number; claimed: boolean }[];
  week: string; week_ends: string;
  tournament: { id: string; name: string; emblem: string; points: number }[];
  last_week: { rank: number; points: number; claimed: boolean } | null;
  guild: string;
}

export const QUEST_INFO: Record<GuildQuestKind, { name: string; desc: string; reward: string }> = {
  battles: { name: "Blood on the Road", desc: "Win battles as a guild (40 per member a day count)", reward: "Gold, Ember Ore and Beast Hide" },
  raid: { name: "Answer the Horn", desc: "Make raid attacks on the guild boss", reward: "Gold, a Boss Core and Elite Sigils" },
  gold: { name: "Fill the Coffers", desc: "Donate gold to the guild treasury", reward: "Starshards, Frost Crystals and Enchantment Stones" },
  kills: { name: "Slayers of Giants", desc: "Slay the guild boss", reward: "Gold, a Void Crystal and Armor Fragments" },
};

/** Tournament rewards by last week's rank — mirrors guild_tournament_claim. */
export const TOURNAMENT_REWARDS = [
  { rank: "1st", gold: 25000, mats: "Sun Crystal, 2 Void Crystals, 8 Starshards" },
  { rank: "2nd", gold: 15000, mats: "2 Void Crystals, 5 Starshards" },
  { rank: "3rd", gold: 10000, mats: "Void Crystal, 3 Starshards" },
  { rank: "4th–10th", gold: 5000, mats: "2 Frost Crystals, 2 Starshards" },
  { rank: "Others", gold: 2000, mats: "Starshard" },
];

/** Damage one raid attack deals — mirrors guild_raid_hit. */
export const raidDamage = (level: number, won: boolean) => Math.round((900 + level * 140) * (won ? 1 : 0.3));

async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await (supabase.rpc as unknown as (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>)(name, args);
  if (error) throw new Error(error.message);
  return data;
}

export const loadGuildEvents = () =>
  withServerHero(async (id) => (await rpc("guild_events_state", { _hero: id })) as GuildEventsState);

export async function raidHit(won: boolean) {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const op = `guild-raid-hit`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  const out = await withServerHero(async (heroId) => object(await rpc("guild_raid_hit", { _hero: heroId, _won: won, _req: req })));
  localStorage.removeItem(`ef-pending:${id}:${op}`);
  return { damage: Number(out["damage"]) || 0, slain: out["slain"] === true };
}

async function withSave(name: string, args: Record<string, unknown>) {
  return withServerHero(async (heroId) => {
    const data = await rpc(name, { _hero: heroId, ...args });
    adoptServerSave(heroId, returnedSave(data));
    return object(data);
  });
}

export const claimRaid = (window: string) => withSave("guild_raid_claim", { _window: window });
export const claimQuest = (kind: GuildQuestKind) => withSave("guild_quest_claim", { _kind: kind });
export const donateGold = (gold: number) => withSave("guild_quest_donate", { _gold: gold });
export const claimTournament = () => withSave("guild_tournament_claim", {});

/**
 * Count a won battle toward the guild's weekly quest. Silent when the hero has no guild.
 *
 * The server only bumps a shared guild counter here — it reads and writes no hero save — so the
 * report stays outside `withServerHero`. That serialised runner holds the store's mutation lock
 * and flushes the save, and the fight's own counters (record, slain, drops) are written right
 * after this call; locking them out would leave every win quest stuck at zero.
 */
export function reportGuildBattle() {
  const id = getState().heroId;
  if (!id) return;
  void rpc("guild_quest_battle", { _hero: id }).catch(() => {});
}

export const rewardText = (reward: unknown) => {
  const r = object(reward);
  const parts: string[] = [];
  if (Number(r["gold"])) parts.push(`+${Number(r["gold"]).toLocaleString()} gold`);
  for (const [k, v] of Object.entries(object(r["mats"]))) parts.push(`+${v} ${k}`);
  return parts.join(" · ");
};
