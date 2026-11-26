import type { Hero } from "./data";
import { type BonusFx, zeroFx, addMats, matCount, type Mat } from "./crafting";
import { scaledGold } from "./gold";
import { addStones } from "./enchant";
import { guildRanks, type GuildRankState } from "./progress";

// ---------- Guild contribution: gold → guild coins ----------
/** 1000 gold = 1000 guild coins (1:1 rate). */
export const GUILD_COIN_RATE = 1;
export const GUILD_CONTRIB_MIN = 1000;

/** The guild ledger keeps the book of what a hero has given and spent at the hall. */
export interface GuildLedger { donated?: number; spent?: number }
export const guildLedger = (h: Pick<Hero, "guildLedger">): Required<GuildLedger> => ({
  donated: h.guildLedger?.donated ?? 0,
  spent: h.guildLedger?.spent ?? 0,
});

/** Every coin a hero spends in the hall is written into the guild ledger. */
export function trackGuildSpend(h: Hero, coins: number) {
  const l = guildLedger(h);
  h.guildLedger = { ...l, spent: l.spent + Math.max(0, Math.round(coins)) };
}

export function contributeGold(h: Hero, gold: number): string | null {
  if (gold < GUILD_CONTRIB_MIN) return `Minimum ${GUILD_CONTRIB_MIN} gold`;
  if (h.gold < gold) return "Not enough gold";
  h.gold -= gold;
  h.guildCoins = (h.guildCoins ?? 0) + Math.floor(gold * GUILD_COIN_RATE);
  const l = guildLedger(h);
  h.guildLedger = { ...l, donated: l.donated + Math.floor(gold) };
  return null;
}

// ---------- Reliquary ----------
/**
 * Relics are the guild's heirlooms: each one wakes once the hero has given the guild enough gold
 * (one rank per GUILD_RANK_GOLD donated, see guildRanks in progress.ts). They cost nothing to
 * claim — the contributions already paid for them.
 */
export interface GuildRelic {
  id: string;
  name: string;
  desc: string;
  /** Guild ranks (gold donated) needed to wake this relic. */
  ranks: number;
  bonus: Partial<BonusFx>;
}

export const GUILD_RELICS: GuildRelic[] = [
  { id: "ember_banner", name: "Ember Banner", desc: "The guild's first standard, still warm from the forge.", ranks: 5, bonus: { atkPct: 2 } },
  { id: "iron_sentinel", name: "Iron Sentinel", desc: "A shield wall cast in guild iron.", ranks: 12, bonus: { defPct: 2 } },
  { id: "everflame", name: "Everflame Brazier", desc: "It never goes out while a guild member stands.", ranks: 24, bonus: { hpPct: 3 } },
  { id: "warden_eye", name: "Warden's Eye", desc: "It finds the seam in any guard.", ranks: 40, bonus: { crit: 1 } },
  { id: "headsman_sigil", name: "Headsman's Sigil", desc: "A token of the guild's executioners.", ranks: 60, bonus: { critDmg: 5 } },
  { id: "titan_coffer", name: "Titan's Coffer", desc: "Banked life, given back in the fight.", ranks: 90, bonus: { hpPct: 5 } },
  { id: "ascendant_crown", name: "Ascendant Crown", desc: "Worn by a guild that outgrew its banner.", ranks: 130, bonus: { atkPct: 4, defPct: 4 } },
];

export const relicUnlocked = (h: GuildRankState, relic: GuildRelic) => guildRanks(h) >= relic.ranks;

/** The relic that wakes next, or null when every one of them has. */
export function nextRelic(h: GuildRankState): GuildRelic | null {
  return GUILD_RELICS.find((r) => !relicUnlocked(h, r)) ?? null;
}

/** A woken relic can be attuned with guild coins; each attunement adds half its base bonus again. */
export const RELIC_MAX_ATTUNE = 5;
export const relicLevel = (h: Pick<Hero, "relicAttune">, id: string) =>
  Math.min(RELIC_MAX_ATTUNE, Math.max(0, Math.floor(h.relicAttune?.[id] ?? 0)));
export const relicPower = (h: Pick<Hero, "relicAttune">, id: string) => 1 + 0.5 * relicLevel(h, id);
/** Guild coins for the next attunement of a relic: deeper shelves and higher levels cost more. */
export function attuneCost(relic: GuildRelic, level: number): number {
  const shelf = GUILD_RELICS.findIndex((r) => r.id === relic.id) + 1;
  return 600 * shelf * (level + 1);
}
export function attuneRelic(h: Hero, id: string): string | null {
  const relic = GUILD_RELICS.find((r) => r.id === id);
  if (!relic) return "Unknown relic";
  if (!relicUnlocked(h, relic)) return "This relic still sleeps";
  const lvl = relicLevel(h, id);
  if (lvl >= RELIC_MAX_ATTUNE) return "Fully attuned";
  const cost = attuneCost(relic, lvl);
  if ((h.guildCoins ?? 0) < cost) return `Need ${cost} guild coins`;
  h.guildCoins = (h.guildCoins ?? 0) - cost;
  h.relicAttune = { ...(h.relicAttune ?? {}), [id]: lvl + 1 };
  return null;
}

export function relicFx(h: GuildRankState & Pick<Hero, "relicAttune">): BonusFx {
  const out = zeroFx();
  for (const r of GUILD_RELICS) {
    if (!relicUnlocked(h, r)) continue;
    const p = relicPower(h, r.id);
    for (const [k, v] of Object.entries(r.bonus) as [keyof BonusFx, number][]) out[k] += v * p;
  }
  return out;
}

// ---------- Guild Shop ----------
export interface GuildShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  /** A crafting material the item pays, or absent for an enchantment-stone good. */
  mat?: Mat;
  /** Enchantment-stone grade the item pays (see enchant.ts). */
  stone?: number;
  qty: number;
}

export const GUILD_SHOP: GuildShopItem[] = [
  { id: "g_ore", name: "Ember Ore ×20", desc: "Common crafting material", cost: 500, mat: "ore", qty: 20 },
  { id: "g_ore100", name: "Ember Ore ×100", desc: "Bulk ore for the forge", cost: 2200, mat: "ore", qty: 100 },
  { id: "g_essence", name: "Soul Essence ×10", desc: "Used in crafting and fusion", cost: 1000, mat: "essence", qty: 10 },
  { id: "g_fragment", name: "Armor Fragment ×10", desc: "For Rare+ armor", cost: 1000, mat: "fragment", qty: 10 },
  { id: "g_hide", name: "Beast Hide ×20", desc: "Refines into Armor Fragments", cost: 400, mat: "hide", qty: 20 },
  { id: "g_hide100", name: "Beast Hide ×100", desc: "Bulk hides for refining", cost: 1800, mat: "hide", qty: 100 },
  { id: "g_bloom", name: "Emberbloom ×20", desc: "Refines into Soul Essence", cost: 450, mat: "bloom", qty: 20 },
  { id: "g_starshard", name: "Starshard ×5", desc: "For Astral summoning & upgrades", cost: 2000, mat: "starshard", qty: 5 },
  { id: "g_starshard20", name: "Starshard ×20", desc: "A deep Astral reserve", cost: 7400, mat: "starshard", qty: 20 },
  { id: "g_sigil", name: "Elite Sigil ×5", desc: "For Epic+ gear", cost: 2500, mat: "sigil", qty: 5 },
  { id: "g_bossCore", name: "Boss Core ×3", desc: "For Legendary+ gear", cost: 3000, mat: "bossCore", qty: 3 },
  { id: "g_crystal", name: "Arcane Crystal ×5", desc: "Refines into Starshards", cost: 2000, mat: "crystal", qty: 5 },
  { id: "g_enchant3", name: "Lv 2 Enchantment Stone ×3", desc: "Enchant gear at the Forge (higher success)", cost: 1500, stone: 2, qty: 3 },
  { id: "g_enchant10", name: "Lv 2 Enchantment Stone ×10", desc: "Bulk enchantment stones", cost: 4000, stone: 2, qty: 10 },
];

export function buyGuildShopItem(h: Hero, id: string, times = 1): string | null {
  const item = GUILD_SHOP.find((i) => i.id === id);
  if (!item) return "Unknown item";
  const count = Math.max(1, Math.floor(times));
  const total = item.cost * count;
  if ((h.guildCoins ?? 0) < total) return `Need ${total} guild coins`;
  h.guildCoins = (h.guildCoins ?? 0) - total;
  if (item.stone) addStones(h, item.stone, item.qty * count);
  else if (item.mat) addMats(h, { [item.mat]: item.qty * count });
  trackGuildSpend(h, total);
  return null;
}

// ---------- Vault: surplus materials → guild coins ----------
export interface VaultLot { mat: Mat; name: string; rate: number }

/** Coins the guild pays per unit of each material — deliberately far under shop prices. */
export const GUILD_VAULT: VaultLot[] = [
  { mat: "ore", name: "Ember Ore", rate: 5 },
  { mat: "hide", name: "Beast Hide", rate: 4 },
  { mat: "bloom", name: "Emberbloom", rate: 6 },
  { mat: "essence", name: "Soul Essence", rate: 20 },
  { mat: "fragment", name: "Armor Fragment", rate: 20 },
  { mat: "crystal", name: "Arcane Crystal", rate: 80 },
  { mat: "starshard", name: "Starshard", rate: 80 },
  { mat: "sigil", name: "Elite Sigil", rate: 100 },
  { mat: "bossCore", name: "Boss Core", rate: 200 },
];

/** Trade materials from the bag for guild coins. */
export function sellToVault(h: Hero, mat: Mat, qty: number): string | null {
  const lot = GUILD_VAULT.find((l) => l.mat === mat);
  if (!lot) return "The vault does not take that";
  const have = matCount(h, mat);
  const count = Math.min(have, Math.max(0, Math.floor(qty)));
  if (count <= 0) return "Nothing to trade";
  h.mats = { ...(h.mats ?? {}), [mat]: have - count };
  h.guildCoins = (h.guildCoins ?? 0) + count * lot.rate;
  return null;
}
