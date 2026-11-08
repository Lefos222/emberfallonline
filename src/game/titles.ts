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

/** Endless title ladders generated from one rule per family, so new rungs never need new code. */
function ladder(
  prefix: string,
  thresholds: number[],
  tier: (i: number) => TitleTier,
  buff: (i: number) => Partial<BonusFx>,
  earned: (h: Hero, n: number) => boolean,
  how: (n: number) => string,
  name: (i: number) => string,
): TitleDef[] {
  return thresholds.map((n, i) => ({
    id: `${prefix}_${n}`,
    name: name(i),
    tier: tier(i),
    desc: "Every rung leaves the last one behind.",
    howToEarn: how(n),
    buff: buff(i),
    earned: (h: Hero) => earned(h, n),
  }));
}

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const levelLadder = () =>
  ladder("lvl", [90, 100, 110, 120, 130, 140], () => 4,
    (i) => ({ atkPct: 8 + i, hpPct: 7 + i, defPct: 5 + i }),
    (h, n) => h.level >= n, (n) => `Reach level ${n}`, (i) => `Emberforged ${roman[i] ?? i + 1}`);
const ascensionLadder = () =>
  ladder("asc", [25, 50, 75, 100, 150, 200, 300], () => 5,
    (i) => ({ atkPct: 6 + i * 2, matkPct: 6 + i * 2, defPct: 4 + i, hpPct: 4 + i, crit: 1 + i }),
    (h, n) => h.paragon >= n, (n) => `Reach Ascension ${n}`, (i) => `Ascended ${roman[i] ?? i + 1}`);
const victoryLadder = () =>
  ladder("wins", [10000, 25000, 50000, 100000], () => 5,
    (i) => ({ atkPct: 20 + i * 3, crit: 10 + i * 2, critDmg: 20 + i * 4 }),
    (h, n) => (h.record?.wins ?? 0) >= n, (n) => `Win ${n.toLocaleString("en-GB")} battles`, (i) => `Reaver ${roman[i] ?? i + 1}`);
const campaignLadder = () =>
  ladder("stage", [250, 300, 400, 500, 750, 1000], () => 5,
    (i) => ({ atkPct: 14 + i * 2, defPct: 10 + i * 2, hpPct: 10 + i * 2, crit: 5 + i }),
    (h, n) => h.stage - 1 >= n, (n) => `Clear ${n.toLocaleString("en-GB")} Campaign stages`, (i) => `Trailblazer ${roman[i] ?? i + 1}`);

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
  if (!t) return { atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0, acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0, loot: 0, goldScale: 0 };
  return { atkPct: 0, matkPct: 0, defPct: 0, mdefPct: 0, hpPct: 0, crit: 0, critDmg: 0, acc: 0, dodge: 0, block: 0, pen: 0, mpen: 0, heal: 0, loot: 0, goldScale: 0, ...t.buff };
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
  { id: "explorer", name: "Explorer", tier: 2, desc: "The endless road holds no fear.", howToEarn: "Clear 50 Campaign stages", buff: { hpPct: 5, dodge: 2, acc: 2 }, earned: (h) => h.stage - 1 >= 50 },
  // Purple tier
  { id: "conqueror", name: "Conqueror", tier: 3, desc: "Realms bow to your will.", howToEarn: "Reach level 50", buff: { atkPct: 8, defPct: 6, hpPct: 6, crit: 4 }, earned: (h) => h.level >= 50 },
  { id: "astral", name: "Astral Lord", tier: 3, desc: "Master of the Astral Vault.", howToEarn: "Own 15 Astrals", buff: { matkPct: 8, crit: 4, critDmg: 8 }, earned: (h) => (h.astrals ?? []).length >= 15 },
  // Gold (high) tier
  { id: "legend", name: "Legend", tier: 4, desc: "A name spoken in every hall.", howToEarn: "Reach level 80", buff: { atkPct: 12, defPct: 8, hpPct: 8, crit: 6, critDmg: 10 }, earned: (h) => h.level >= 80 },
  { id: "ascendant", name: "Ascendant", tier: 4, desc: "Beyond mortality.", howToEarn: "Reach Ascension 10", buff: { atkPct: 10, matkPct: 10, defPct: 10, hpPct: 10 }, earned: (h) => h.paragon >= 10 },
  // Red tier
  { id: "eternal", name: "Eternal", tier: 5, desc: "A force that shapes the world.", howToEarn: "Reach Ascension 50", buff: { atkPct: 18, matkPct: 18, defPct: 15, hpPct: 15, crit: 8, critDmg: 15, pen: 5, dodge: 4 }, earned: (h) => h.paragon >= 50 },
  { id: "warmaster", name: "Warmaster", tier: 5, desc: "A thousand victories and counting.", howToEarn: "Win 5000 battles", buff: { atkPct: 16, crit: 8, critDmg: 20, pen: 8, acc: 5 }, earned: (h) => (h.record?.wins ?? 0) >= 5000 },

  // ---- Mid-game milestones ----
  { id: "drifting", name: "Drifting Blade", tier: 0, desc: "The first real fight.", howToEarn: "Reach level 10", buff: { atkPct: 3, hpPct: 3 }, earned: (h) => h.level >= 10 },
  { id: "recruit", name: "Recruit", tier: 0, desc: "Ten fights survived.", howToEarn: "Win 10 battles", buff: { hpPct: 3, defPct: 2 }, earned: (h) => (h.record?.wins ?? 0) >= 10 },
  { id: "duelist", name: "Duelist", tier: 1, desc: "A name in the pit.", howToEarn: "Win 10 arena fights", buff: { atkPct: 4, crit: 3 }, earned: (h) => (h.record?.arenaWins ?? 0) >= 10 },
  { id: "wanderer", name: "Wanderer", tier: 1, desc: "Past the first region.", howToEarn: "Clear 15 Campaign stages", buff: { hpPct: 4, acc: 2 }, earned: (h) => h.stage - 1 >= 15 },
  { id: "forger", name: "Forger", tier: 1, desc: "Steel answers steel.", howToEarn: "Craft 10 items at the Forge", buff: { atkPct: 3, defPct: 3 }, earned: (h) => (h.crafts ?? 0) >= 10 },
  { id: "veteran", name: "Veteran", tier: 2, desc: "Blooded in hundreds of fights.", howToEarn: "Win 250 battles", buff: { atkPct: 6, defPct: 4, hpPct: 5 }, earned: (h) => (h.record?.wins ?? 0) >= 250 },
  { id: "beastbane", name: "Beastbane", tier: 2, desc: "The bestiary fears you.", howToEarn: "Defeat 250 monsters", buff: { crit: 4, critDmg: 8 }, earned: (h) => Object.values(h.kills ?? {}).reduce((a, n) => a + n, 0) >= 250 },
  { id: "starkeeper", name: "Starkeeper", tier: 2, desc: "Astrals orbit your name.", howToEarn: "Own 5 Astrals", buff: { matkPct: 6, crit: 3 }, earned: (h) => (h.astrals ?? []).length >= 5 },
  { id: "realmbreaker", name: "Realmbreaker", tier: 3, desc: "The campaign bends to you.", howToEarn: "Clear 80 Campaign stages", buff: { atkPct: 9, hpPct: 8, crit: 4 }, earned: (h) => h.stage - 1 >= 80 },
  { id: "gladiator", name: "Gladiator", tier: 3, desc: "The arena roars your name.", howToEarn: "Win 100 arena fights", buff: { atkPct: 8, defPct: 5, critDmg: 10 }, earned: (h) => (h.record?.arenaWins ?? 0) >= 100 },
  { id: "deepclimber", name: "Deep Climber", tier: 3, desc: "The Conquest has no ceiling.", howToEarn: "Clear 50 Endless Conquest floors", buff: { hpPct: 8, defPct: 6, dodge: 3 }, earned: (h) => h.spire - 1 >= 50 },
  { id: "unbroken", name: "Unbroken", tier: 4, desc: "A thousand victories without breaking.", howToEarn: "Win 1000 battles", buff: { atkPct: 11, defPct: 8, hpPct: 9, crit: 5 }, earned: (h) => (h.record?.wins ?? 0) >= 1000 },
  { id: "worldwalker", name: "Worldwalker", tier: 4, desc: "No horizon stops you.", howToEarn: "Clear 120 Campaign stages", buff: { atkPct: 12, hpPct: 10, acc: 4, dodge: 4 }, earned: (h) => h.stage - 1 >= 120 },
  { id: "mythic", name: "Mythic Hero", tier: 4, desc: "Beyond the reach of legend.", howToEarn: "Reach level 120", buff: { atkPct: 14, defPct: 10, hpPct: 12, critDmg: 12 }, earned: (h) => h.level >= 120 },
  { id: "worldender", name: "World Ender", tier: 5, desc: "Bosses are a memory.", howToEarn: "Defeat 500 bosses", buff: { atkPct: 18, crit: 10, critDmg: 22, pen: 6 }, earned: (h) => (h.record?.bosses ?? 0) >= 500 },
  { id: "sovereign", name: "Conquest Sovereign", tier: 5, desc: "The endless gate bows.", howToEarn: "Clear 200 Endless Conquest floors", buff: { atkPct: 17, matkPct: 17, defPct: 12, hpPct: 12 }, earned: (h) => h.spire - 1 >= 200 },
  { id: "horizon", name: "Beyond the Horizon", tier: 5, desc: "The campaign has no ending.", howToEarn: "Clear 200 Campaign stages", buff: { atkPct: 19, defPct: 14, hpPct: 14, crit: 7, critDmg: 16 }, earned: (h) => h.stage - 1 >= 200 },

  // ---- Endless ladders: each rung keeps climbing, so the title hunt never stops ----
  ...levelLadder(),
  ...ascensionLadder(),
  ...victoryLadder(),
  ...campaignLadder(),
];
