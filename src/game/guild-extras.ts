import { supabase } from "@/integrations/supabase/client";
import { adoptServerSave, getState, update, withServerHero } from "./store";
import { object, requestKey, returnedSave } from "./services-contract";
import type { Hero } from "./data";

/** Guild bank, buffs, contribution shop, daily dice and member ranks — all owned by the server (migration 0031). */
export interface GuildExtrasState {
  funds: number;
  role: string;
  points: number;
  total: number;
  rank: string;
  buffs: { kind: GuildBuffKind; expires_at: string }[];
  dice: number | null;
  roster: { name: string; total: number; rank: string }[];
}

export type GuildBuffKind = "atk" | "hp" | "xp" | "gold";
/** Buff catalogue — costs mirror `_buff_cost` in SQL; every buff lasts 24 hours. */
export const GUILD_BUFFS: { kind: GuildBuffKind; name: string; desc: string; cost: number; fx: Record<string, number> }[] = [
  { kind: "atk", name: "War Banner", desc: "+5% attack for every member", cost: 200000, fx: { atkPct: 5, matkPct: 5 } },
  { kind: "hp", name: "Bulwark Hymn", desc: "+5% health for every member", cost: 200000, fx: { hpPct: 5 } },
  { kind: "xp", name: "Iron Oath", desc: "+5% defence for every member", cost: 300000, fx: { defPct: 5, mdefPct: 5 } },
  { kind: "gold", name: "Hunter's Mark", desc: "+3% critical chance for every member", cost: 300000, fx: { crit: 3 } },
];

/** Ranks earned from lifetime contribution — mirrors `_guild_rank` in SQL. */
export const GUILD_RANKS = [
  { name: "Recruit", at: 0 }, { name: "Sworn", at: 500 }, { name: "Veteran", at: 2000 }, { name: "Champion", at: 6000 }, { name: "Legend", at: 15000 },
];

/** Contribution shop — mirrors `_guild_shop` in SQL. */
export const GUILD_SHOP = [
  { id: "ore", mat: "ore", qty: 40, cost: 60, rank: 0 },
  { id: "essence", mat: "essence", qty: 15, cost: 80, rank: 0 },
  { id: "sigil", mat: "sigil", qty: 4, cost: 150, rank: 1 },
  { id: "starshard", mat: "starshard", qty: 5, cost: 200, rank: 1 },
  { id: "bossCore", mat: "bossCore", qty: 2, cost: 350, rank: 2 },
  { id: "frostCrystal", mat: "frostCrystal", qty: 3, cost: 400, rank: 2 },
  { id: "voidCrystal", mat: "voidCrystal", qty: 2, cost: 700, rank: 3 },
  { id: "sunCrystal", mat: "sunCrystal", qty: 1, cost: 1200, rank: 4 },
] as const;

export const rankIndex = (name: string) => Math.max(0, GUILD_RANKS.findIndex((r) => r.name === name));

/** Active guild buffs as stat bonuses, read from the hero's cached copy of the server state. */
export function guildBuffFx(h: Pick<Hero, "guildBuffs">, now = Date.now()): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of GUILD_BUFFS) {
    if ((h.guildBuffs?.[b.kind] ?? 0) > now) for (const [k, v] of Object.entries(b.fx)) out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await (supabase.rpc as unknown as (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>)(name, args);
  if (error) throw new Error(error.message);
  return data;
}
async function withSave(name: string, args: Record<string, unknown>) {
  return withServerHero(async (heroId) => {
    const data = await rpc(name, { _hero: heroId, ...args });
    adoptServerSave(heroId, returnedSave(data));
    return object(data);
  });
}

export async function loadGuildExtras() {
  const st = (await withServerHero(async (id) => await rpc("guild_extras_state", { _hero: id }))) as GuildExtrasState;
  // Cache the guild's live buffs on the hero so battle stats include them.
  const map = Object.fromEntries(st.buffs.map((b) => [b.kind, new Date(b.expires_at).getTime()]));
  update((h) => { h.guildBuffs = map; });
  return st;
}
export const donateToBank = (gold: number) => withSave("guild_bank_donate", { _gold: gold });
export const rollGuildDice = () => withSave("guild_dice_roll", {});
export const activateBuff = (kind: GuildBuffKind) => withServerHero((id) => rpc("guild_buff_activate", { _hero: id, _kind: kind }));
export async function buyGuildShop(item: string) {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  const op = `guild-shop-${item}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  const out = await withSave("guild_shop_buy", { _item: item, _req: req });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
  return out;
}
