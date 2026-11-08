import type { BonusFx } from "./crafting";
import type { Hero } from "./data";

/**
 * Titles are earned by reaching milestones and grant permanent stat buffs while equipped.
 * Each title has a tier (Silver → Gold → Blue → Purple → Gold → Red) and a unique set of buffs.
 * Higher-tier titles carry stronger buffs. A hero equips one title at a time from the profile panel.
 */

export type TitleTier = 0 | 1 | 2 | 3 | 4 | 5;

export const TITLE_TIERS = ["Silver", "Gold", "Blue", "Purple", "Gold", "Red"] as const;
export const TITLE_COLORS = ["#c0c0c8", "#facc15", "#3b82f6", "#a855f7", "#facc15", "#e11d48"];

export interface TitleDef {
  id: string;
  name: string;
  tier: TitleTier;
  desc: string;
  /** Buffs this title grants while equipped. */
  buff: Partial<BonusFx>;
  /** Condition text for how to earn it. */
  howToEarn: string;
  /** Check if the hero has earned this title. */
  earned: (h: Hero) => boolean;
}

export const TITLES: TitleDef[] = [
  // Silver tier
  { id: "novice", name: "Novice", tier: 0, desc: "A first step into the world.", howToEarn: "Reach level 5", buff: { atkPct: 2, hpPct: 2 }, earned: (h) => h.level >= 5 },
  { id: "scout", name: "Scout", tier: 0, desc: "An eye for the road ahead.", howToEarn: "Clear 5 campaign stages", buff: { acc: 2, dodge: 1 }, earned: (h) => h.stage - 1 >= 5 },
  // Gold tier
  { id: "warrior", name: "Warrior", tier: 1, desc: "Blooded in a hundred fights.", howToEarn: "Win 100 battles", buff: { atkPct: 4, crit: 2 }, earned: (h) => (h.record?.wins ?? 0) >= 100 },
  { id: "slayer", name: "Slayer", tier: 1, desc: "Bosses fall before you.", howToEarn: "Defeat 10 bosses", buff: { critDmg: 5, atkPct: 3 }, earned: (h) => (h.record?.bosses ?? 0) >= 10 },
  // Blue tier
  { id: "champion", name: "Champion", tier: 2, desc: "A veteran of the arena.", howToEarn: "Win 50 arena fights", buff: { atkPct: 6, defPct: 4, crit: 3 }, earned: (h) => (h.record?.arenaWins ?? 0) >= 50 },
  { id: "explorer", name: "Explorer", tier: 2, desc: "The road holds no fear.", howToEarn: "Reach Long Road stage 50", buff: { hpPct: 5, dodge: 2, acc: 2 }, earned: (h) => (h.road?.best ?? 0) >= 50 },
  // Purple tier
  { id: "conqueror", name: "Conqueror", tier: 3, desc: "Realms bow to your will.", howToEarn: "Reach level 50", buff: { atkPct: 8, defPct: 6, hpPct: 6, crit: 4 }, earned: (h) => h.level >= 50 },
  { id: "astral", name: "Astral Lord", tier: 3, desc: "Master of the Astral Vault.", howToEarn: "Own 15 Astrals", buff: { matkPct: 8, crit: 4, critDmg: 8 }, earned: (h) => (h.astrals ?? []).length >= 15 },
  // Gold (high) tier
  { id: "legend", name: "Legend", tier: 4, desc: "A name spoken in every hall.", howToEarn: "Reach level 80", buff: { atkPct: 12, defPct: 8, hpPct: 8, crit: 6, critDmg: 10 }, earned: (h) => h.level >= 80 },
  { id: "ascendant", name: "Ascendant", tier: 4, desc: "Beyond mortality.", howToEarn: "Reach Ascension 10", buff: { atkPct: 10, matkPct: 10, defPct: 10, hpPct: 10 }, earned: (h) => h.paragon >= 10 },
  // Red tier
  { id: "eternal", name: "Eternal", tier: 5, desc: "A force that shapes the world.", howToEarn: "Reach Ascension 50", buff: { atkPct: 18, matkPct: 18, defPct: 15, hpPct: 15, crit: 8, critDmg: 15, pen: 5, dodge: 4 }, earned: (h) => h.paragon >= 50 },
  { id: "warmaster", name: "Warmaster", tier: 5, desc: "A thousand victories and counting.", howToEarn: "Win 5000 battles", buff: { atkPct: 16, crit: 8, critDmg: 20, pen: 8, acc: 5 }, earned: (h) => (h.record?.wins ?? 0) >= 5000 },
];

/** All titles the hero has earned but not yet claimed (first time the condition is met). */
export function newlyEarnedTitles(h: Hero): TitleDef[] {
  const claimed = h.titleClaimed ?? [];
  return TITLES.filter((t) => t.earned(h) && !claimed.includes(t.id));
}

/** Claim a newly-earned title so it can be equipped. */
export function claimTitle(h: Hero, id: string): string | null {
  const t = TITLES.find((x) => x.id === id);
  if (!t) return "Unknown title";
  if (!t.earned(h)) return "You have not earned this title yet";
  const claimed = h.titleClaimed ?? [];
  if (claimed.includes(id)) return "Already claimed";
  h.titleClaimed = [...claimed, id];
  return null;
}

/** Equip a title (must be claimed first). Returns error or null. */
export function equipTitle(h: Hero, id: string | null): string | null {
  if (id === null) { h.equippedTitle = undefined; return null; }
  const t = TITLES.find((x) => x.id === id);
  if (!t) return "Unknown title";
  if (!(h.titleClaimed ?? []).includes(id)) return "You have not claimed this title";
  h.equippedTitle = id;
  return null;
}

/** The currently equipped title definition, or null. */
export const activeTitle = (h: Hero): TitleDef | null => {
  if (!h.equippedTitle) return null;
  return TITLES.find((t) => t.id === h.equippedTitle) ?? null;
};

/** Buffs from the equipped title, for the shared stat pipeline. */
export function titleFx(h: Hero): BonusFx {
  const t = activeTitle(h);
  if (!t) return { atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0, acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0 };
  return { atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0, acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0, ...t.buff };
}
