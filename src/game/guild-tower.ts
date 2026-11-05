import type { Hero } from "./data";
import { type BonusFx, zeroFx, addMats, matCount, type Mat } from "./crafting";
import { scaledGold } from "./gold";

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

// ---------- Guild Skill Tower ----------
/**
 * The tower has no ceiling: every skill keeps levelling forever. Each rank costs guild coins
 * and, from the first rank on, gold as well — both prices climb by their own multiplier, so
 * the deep ranks stay a real sink instead of free power.
 */
export interface GuildSkill {
  id: string;
  name: string;
  desc: string;
  stat: keyof BonusFx;
  /** What one rank grants, in the stat's own unit. */
  per: number;
  /** Guild coins of the first rank. */
  baseCost: number;
  /** How much each further rank's coin price grows. */
  costMult: number;
  /** Gold of the first rank, paid on top of the coins (scaled by hero level). */
  baseGold: number;
  /** How much each further rank's gold price grows. */
  goldMult: number;
}

export const GUILD_SKILLS: GuildSkill[] = [
  { id: "g_atk", name: "Warlord's Might", desc: "+2% Physical Attack per rank", stat: "atkPct", per: 2, baseCost: 1000, costMult: 1.4, baseGold: 2000, goldMult: 1.4 },
  { id: "g_def", name: "Guardian's Aegis", desc: "+2% Physical Defense per rank", stat: "defPct", per: 2, baseCost: 1000, costMult: 1.4, baseGold: 2000, goldMult: 1.4 },
  { id: "g_hp", name: "Titan's Vigor", desc: "+3% Max HP per rank", stat: "hpPct", per: 3, baseCost: 1000, costMult: 1.4, baseGold: 2000, goldMult: 1.4 },
  { id: "g_matk", name: "Archmage's Focus", desc: "+2% Magic Attack per rank", stat: "matkPct", per: 2, baseCost: 1000, costMult: 1.4, baseGold: 2000, goldMult: 1.4 },
  { id: "g_mdef", name: "Wards of Ember", desc: "+2% Magic Defense per rank", stat: "mdefPct", per: 2, baseCost: 1000, costMult: 1.4, baseGold: 2000, goldMult: 1.4 },
  { id: "g_crit", name: "Executioner's Eye", desc: "+0.5% Crit Chance per rank", stat: "crit", per: 0.5, baseCost: 1500, costMult: 1.5, baseGold: 3000, goldMult: 1.5 },
  { id: "g_critDmg", name: "Devastation", desc: "+3% Crit Damage per rank", stat: "critDmg", per: 3, baseCost: 1500, costMult: 1.5, baseGold: 3000, goldMult: 1.5 },
  { id: "g_pen", name: "Siegebreaker", desc: "+0.5% Armor Pen per rank", stat: "pen", per: 0.5, baseCost: 2000, costMult: 1.6, baseGold: 4000, goldMult: 1.6 },
  { id: "g_dodge", name: "Phantom Step", desc: "+0.3% Dodge per rank", stat: "dodge", per: 0.3, baseCost: 2000, costMult: 1.6, baseGold: 4000, goldMult: 1.6 },
  { id: "g_acc", name: "Trueshot", desc: "+0.5% Accuracy per rank", stat: "acc", per: 0.5, baseCost: 1500, costMult: 1.5, baseGold: 3000, goldMult: 1.5 },
  { id: "g_block", name: "Bulwark Stance", desc: "+0.5% Block per rank", stat: "block", per: 0.5, baseCost: 2000, costMult: 1.6, baseGold: 4000, goldMult: 1.6 },
  { id: "g_heal", name: "Vital Weaving", desc: "+1% Healing Power per rank", stat: "heal", per: 1, baseCost: 1500, costMult: 1.5, baseGold: 3000, goldMult: 1.5 },
];

export const guildSkillRank = (h: Pick<Hero, "guildSkills">, id: string) => Math.max(0, h.guildSkills?.[id] ?? 0);

/** Total ranks a hero owns across the whole tower — the measure the reliquary unlocks on. */
export const guildTotalRanks = (h: Pick<Hero, "guildSkills">) =>
  GUILD_SKILLS.reduce((sum, s) => sum + guildSkillRank(h, s.id), 0);

export interface GuildSkillPrice { coins: number; gold: number }

/** What the next rank of a skill costs: guild coins and gold, both climbing with the rank. */
export function guildSkillPrice(skill: GuildSkill, rank: number, level = 1): GuildSkillPrice {
  return {
    coins: Math.round(skill.baseCost * Math.pow(skill.costMult, rank)),
    gold: scaledGold(Math.round(skill.baseGold * Math.pow(skill.goldMult, rank)), level),
  };
}

/** Coin price only (kept for displays that show a single number). */
export const guildSkillCost = (skill: GuildSkill, rank: number) => guildSkillPrice(skill, rank).coins;

/** Why the next rank can't be bought, or null when it can. */
export function guildSkillBlocker(h: Hero, skill: GuildSkill): string | null {
  const price = guildSkillPrice(skill, guildSkillRank(h, skill.id), h.level);
  if ((h.guildCoins ?? 0) < price.coins) return `Need ${price.coins.toLocaleString()} coins`;
  if (h.gold < price.gold) return "Not enough gold";
  return null;
}

/** How many ranks of a skill the hero can currently afford, capped at `want`. */
export function affordableRanks(h: Hero, skill: GuildSkill, want: number): number {
  let ranks = 0;
  let coins = h.guildCoins ?? 0;
  let gold = h.gold;
  while (ranks < want) {
    const price = guildSkillPrice(skill, guildSkillRank(h, skill.id) + ranks, h.level);
    if (coins < price.coins || gold < price.gold) break;
    coins -= price.coins;
    gold -= price.gold;
    ranks++;
  }
  return ranks;
}

/** Buy up to `count` ranks of one skill with guild coins and gold. */
export function learnGuildSkill(h: Hero, id: string, count = 1): { bought: number; error: string | null } {
  const skill = GUILD_SKILLS.find((s) => s.id === id);
  if (!skill) return { bought: 0, error: "Unknown skill" };
  let bought = 0;
  while (bought < Math.max(1, count)) {
    const rank = guildSkillRank(h, skill.id);
    const price = guildSkillPrice(skill, rank, h.level);
    if ((h.guildCoins ?? 0) < price.coins) break;
    if (h.gold < price.gold) break;
    h.guildCoins = (h.guildCoins ?? 0) - price.coins;
    h.gold -= price.gold;
    h.guildSkills = { ...(h.guildSkills ?? {}), [id]: rank + 1 };
    trackGuildSpend(h, price.coins);
    bought++;
  }
  if (bought === 0) {
    const blocker = guildSkillBlocker(h, skill);
    return { bought, error: blocker ?? "Nothing bought" };
  }
  return { bought, error: null };
}

// ---------- Reliquary ----------
/**
 * Relics are the guild's heirlooms: each one wakes once the hero has climbed far enough up the
 * skill tower. They cost nothing to claim — the ranks already paid for them.
 */
export interface GuildRelic {
  id: string;
  name: string;
  desc: string;
  /** Total tower ranks needed to wake this relic. */
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

export const relicUnlocked = (h: Pick<Hero, "guildSkills">, relic: GuildRelic) => guildTotalRanks(h) >= relic.ranks;

/** The relic that wakes next, or null when every one of them has. */
export function nextRelic(h: Pick<Hero, "guildSkills">): GuildRelic | null {
  return GUILD_RELICS.find((r) => !relicUnlocked(h, r)) ?? null;
}

export function relicFx(h: Pick<Hero, "guildSkills">): BonusFx {
  const out = zeroFx();
  for (const r of GUILD_RELICS) {
    if (!relicUnlocked(h, r)) continue;
    for (const [k, v] of Object.entries(r.bonus) as [keyof BonusFx, number][]) out[k] += v;
  }
  return out;
}

/** Combat bonus from guild skill tower ranks and woken relics — feeds into computeStats. */
export function guildFx(h: Pick<Hero, "guildSkills">): BonusFx {
  const out = zeroFx();
  if (h.guildSkills) {
    for (const skill of GUILD_SKILLS) {
      const rank = h.guildSkills[skill.id] ?? 0;
      if (rank > 0) out[skill.stat] += skill.per * rank;
    }
  }
  for (const [k, v] of Object.entries(relicFx(h)) as [keyof BonusFx, number][]) out[k] += v;
  return out;
}

// ---------- Guild Shop ----------
export interface GuildShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  mat: Mat;
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
  { id: "g_enchant3", name: "Enchantment Stone ×3", desc: "Enchant gear at the Forge (higher success)", cost: 1500, mat: "enchantStone", qty: 3 },
  { id: "g_enchant10", name: "Enchantment Stone ×10", desc: "Bulk enchantment stones", cost: 4000, mat: "enchantStone", qty: 10 },
];

export function buyGuildShopItem(h: Hero, id: string, times = 1): string | null {
  const item = GUILD_SHOP.find((i) => i.id === id);
  if (!item) return "Unknown item";
  const count = Math.max(1, Math.floor(times));
  const total = item.cost * count;
  if ((h.guildCoins ?? 0) < total) return `Need ${total} guild coins`;
  h.guildCoins = (h.guildCoins ?? 0) - total;
  addMats(h, { [item.mat]: item.qty * count });
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
  { mat: "enchantStone", name: "Enchantment Stone", rate: 100 },
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
