import type { Hero } from "./data";
import { type BonusFx, zeroFx, addMats, type Mat } from "./crafting";

// ---------- Guild contribution: gold → guild coins ----------
/** 1000 gold = 1000 guild coins (1:1 rate). */
export const GUILD_COIN_RATE = 1;
export const GUILD_CONTRIB_MIN = 1000;

export function contributeGold(h: Hero, gold: number): string | null {
  if (gold < GUILD_CONTRIB_MIN) return `Minimum ${GUILD_CONTRIB_MIN} gold`;
  if (h.gold < gold) return "Not enough gold";
  h.gold -= gold;
  h.guildCoins = (h.guildCoins ?? 0) + Math.floor(gold * GUILD_COIN_RATE);
  return null;
}

// ---------- Guild Skill Tower ----------
export interface GuildSkill {
  id: string;
  name: string;
  desc: string;
  stat: keyof BonusFx;
  per: number;
  max: number;
  baseCost: number;
  costMult: number;
}

export const GUILD_SKILLS: GuildSkill[] = [
  { id: "g_atk", name: "Warlord's Might", desc: "+2% Physical & Magic Attack per rank", stat: "atkPct", per: 2, max: 15, baseCost: 1000, costMult: 1.4 },
  { id: "g_def", name: "Guardian's Aegis", desc: "+2% Physical & Magic Defense per rank", stat: "defPct", per: 2, max: 15, baseCost: 1000, costMult: 1.4 },
  { id: "g_hp", name: "Titan's Vigor", desc: "+3% Max HP per rank", stat: "hpPct", per: 3, max: 15, baseCost: 1000, costMult: 1.4 },
  { id: "g_crit", name: "Executioner's Eye", desc: "+0.5% Crit Chance per rank", stat: "crit", per: 0.5, max: 10, baseCost: 1500, costMult: 1.5 },
  { id: "g_critDmg", name: "Devastation", desc: "+3% Crit Damage per rank", stat: "critDmg", per: 3, max: 10, baseCost: 1500, costMult: 1.5 },
  { id: "g_pen", name: "Siegebreaker", desc: "+0.5% Armor Pen per rank", stat: "pen", per: 0.5, max: 10, baseCost: 2000, costMult: 1.6 },
  { id: "g_dodge", name: "Phantom Step", desc: "+0.3% Dodge per rank", stat: "dodge", per: 0.3, max: 8, baseCost: 2000, costMult: 1.6 },
  { id: "g_acc", name: "Trueshot", desc: "+0.5% Accuracy per rank", stat: "acc", per: 0.5, max: 8, baseCost: 1500, costMult: 1.5 },
];

export const guildSkillRank = (h: Pick<Hero, "guildSkills">, id: string) => h.guildSkills?.[id] ?? 0;

export function guildSkillCost(skill: GuildSkill, currentRank: number): number {
  return Math.round(skill.baseCost * Math.pow(skill.costMult, currentRank));
}

export function guildSkillBlocker(h: Hero, skill: GuildSkill): string | null {
  const rank = guildSkillRank(h, skill.id);
  if (rank >= skill.max) return "Max rank";
  return null;
}

export function learnGuildSkill(h: Hero, id: string): string | null {
  const skill = GUILD_SKILLS.find((s) => s.id === id);
  if (!skill) return "Unknown skill";
  const rank = guildSkillRank(h, skill.id);
  if (rank >= skill.max) return "Max rank";
  const cost = guildSkillCost(skill, rank);
  if ((h.guildCoins ?? 0) < cost) return `Need ${cost} guild coins`;
  h.guildCoins = (h.guildCoins ?? 0) - cost;
  h.guildSkills = { ...(h.guildSkills ?? {}), [id]: rank + 1 };
  return null;
}

/** Combat bonus from guild skill tower ranks — feeds into computeStats like drills/talents. */
export function guildFx(h: Pick<Hero, "guildSkills">): BonusFx {
  const out = zeroFx();
  if (!h.guildSkills) return out;
  for (const skill of GUILD_SKILLS) {
    const rank = h.guildSkills[skill.id] ?? 0;
    if (rank > 0) out[skill.stat] += skill.per * rank;
  }
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
  { id: "g_essence", name: "Soul Essence ×10", desc: "Used in crafting and fusion", cost: 1000, mat: "essence", qty: 10 },
  { id: "g_fragment", name: "Armor Fragment ×10", desc: "For Rare+ armor", cost: 1000, mat: "fragment", qty: 10 },
  { id: "g_hide", name: "Beast Hide ×20", desc: "Refines into Armor Fragments", cost: 400, mat: "hide", qty: 20 },
  { id: "g_starshard", name: "Starshard ×5", desc: "For Astral summoning & upgrades", cost: 2000, mat: "starshard", qty: 5 },
  { id: "g_sigil", name: "Elite Sigil ×5", desc: "For Epic+ gear", cost: 2500, mat: "sigil", qty: 5 },
  { id: "g_bossCore", name: "Boss Core ×3", desc: "For Legendary+ gear", cost: 3000, mat: "bossCore", qty: 3 },
  { id: "g_crystal", name: "Arcane Crystal ×5", desc: "Refines into Starshards", cost: 2000, mat: "crystal", qty: 5 },
  { id: "g_enh1", name: "Enhancement Stone Lv 1 ×5", desc: "Empowers gear up to +4 at the Forge, +10% success", cost: 1500, mat: "enhStone1", qty: 5 },
  { id: "g_enh2", name: "Enhancement Stone Lv 2 ×3", desc: "For gear up to +8, +15% success", cost: 4000, mat: "enhStone2", qty: 3 },
  { id: "g_enh3", name: "Enhancement Stone Lv 3 ×2", desc: "For gear up to +12, +20% success", cost: 9000, mat: "enhStone3", qty: 2 },
  { id: "g_enh4", name: "Enhancement Stone Lv 4 ×1", desc: "The only stone that carries gear past +12, +25% success", cost: 18000, mat: "enhStone4", qty: 1 },
];

export function buyGuildShopItem(h: Hero, id: string): string | null {
  const item = GUILD_SHOP.find((i) => i.id === id);
  if (!item) return "Unknown item";
  if ((h.guildCoins ?? 0) < item.cost) return `Need ${item.cost} guild coins`;
  h.guildCoins = (h.guildCoins ?? 0) - item.cost;
  addMats(h, { [item.mat]: item.qty });
  return null;
}
