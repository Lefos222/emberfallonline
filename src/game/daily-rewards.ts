// ============= Daily reward board: a 30-day cycle of small gifts =============
// One gift per Greek day, taken in order. The board is a ledger on the hero save and hands out
// gold, level 1-2 gems, materials and gold chests, so it never needs a server round trip.

import { greekDayStart } from "./events";
import { GEMS, GEM_TIER_NAMES, MATS, addGem, addMats, type GemType, type Mat } from "./crafting";
import type { Hero } from "./data";

export const DAILY_REWARD_DAYS = 30;

/** One gem the board hands out: the chart family and its level (1-2 on this board). */
export interface DailyGem {
  gem: GemType;
  tier: number;
}

export interface DailyReward {
  day: number;
  /** Short name shown on the board tile. */
  label: string;
  gold?: number;
  gems?: DailyGem[];
  mats?: Partial<Record<Mat, number>>;
  /** Chest days bundle a bigger gold and material gift in one tile. */
  chest?: boolean;
}

// One line per day keeps the 30-day table readable.
// prettier-ignore
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, label: "120 gold", gold: 120 },
  { day: 2, label: "Chipped Ruby gem", gems: [{ gem: "ruby", tier: 1 }] },
  { day: 3, label: "4 Ember Ore", mats: { ore: 4 } },
  { day: 4, label: "Chipped Emerald gem", gems: [{ gem: "emerald", tier: 1 }] },
  { day: 5, label: "2 Armor Fragments", mats: { fragment: 2 } },
  { day: 6, label: "Gold Chest", chest: true, gold: 1200, mats: { ore: 6 } },
  { day: 7, label: "180 gold", gold: 180 },
  { day: 8, label: "Chipped Sapphire gem", gems: [{ gem: "sapphire", tier: 1 }] },
  { day: 9, label: "3 Armor Fragments", mats: { fragment: 3 } },
  { day: 10, label: "Chipped Topaz gem + 2 Soul Essence", gems: [{ gem: "topaz", tier: 1 }], mats: { essence: 2 } },
  { day: 11, label: "260 gold", gold: 260 },
  { day: 12, label: "Gold Chest", chest: true, gold: 2000, mats: { ore: 8, fragment: 3 } },
  { day: 13, label: "Flawed Amethyst gem", gems: [{ gem: "amethyst", tier: 2 }] },
  { day: 14, label: "5 Armor Fragments", mats: { fragment: 5 } },
  { day: 15, label: "350 gold", gold: 350 },
  { day: 16, label: "Flawed Tourmaline gem", gems: [{ gem: "tourmaline", tier: 2 }] },
  { day: 17, label: "4 Soul Essence + 4 Beast Hide", mats: { essence: 4, hide: 4 } },
  { day: 18, label: "Gold Chest", chest: true, gold: 3000, mats: { ore: 10, fragment: 5, essence: 2 } },
  { day: 19, label: "Flawed Ruby gem", gems: [{ gem: "ruby", tier: 2 }] },
  { day: 20, label: "500 gold", gold: 500 },
  { day: 21, label: "6 Armor Fragments", mats: { fragment: 6 } },
  { day: 22, label: "Flawed Aquamarine gem", gems: [{ gem: "aquamarine", tier: 2 }] },
  { day: 23, label: "700 gold", gold: 700 },
  { day: 24, label: "Gold Chest", chest: true, gold: 4500, mats: { ore: 12, fragment: 6, essence: 3 } },
  { day: 25, label: "Flawed Lapis gem", gems: [{ gem: "lapis", tier: 2 }] },
  { day: 26, label: "900 gold", gold: 900 },
  { day: 27, label: "8 Armor Fragments + Elite Sigil", mats: { fragment: 8, sigil: 1 } },
  { day: 28, label: "Flawed Emerald + Flawed Sapphire gems", gems: [{ gem: "emerald", tier: 2 }, { gem: "sapphire", tier: 2 }] },
  { day: 29, label: "1,200 gold", gold: 1200 },
  { day: 30, label: "Grand Gold Chest", chest: true, gold: 8000, mats: { ore: 20, fragment: 12, essence: 5 }, gems: [{ gem: "amethyst", tier: 2 }] },
];

/** Board progress kept on the hero save: days claimed this cycle, the Greek day it was claimed, cycles finished. */
export interface DailyRewardState {
  day?: number;
  last?: string;
  cycles?: number;
}

/** Greek day key, so the board offers exactly one gift per server day. */
export const boardDayKey = (now = Date.now()) =>
  new Date(greekDayStart(now)).toISOString().slice(0, 10);

/** Days already claimed in the current cycle (0-30). */
export const claimedBoardDays = (h: { dailyRewards?: DailyRewardState }) =>
  Math.min(DAILY_REWARD_DAYS, Math.max(0, Math.floor(h.dailyRewards?.day ?? 0)));

/** The day the board offers next, 1-30; a finished board rolls over to day 1. */
export const nextBoardDay = (h: { dailyRewards?: DailyRewardState }) => claimedBoardDays(h) + 1;

/** A day's gift, or the first day's gift when the board rolls over. */
export const boardReward = (day: number): DailyReward => DAILY_REWARDS[day - 1] ?? DAILY_REWARDS[0];

/** True while the next board day is still unclaimed today. */
export const canClaimBoardDay = (h: { dailyRewards?: DailyRewardState }, now = Date.now()) =>
  h.dailyRewards?.last !== boardDayKey(now);

/** Human-readable lines for a day's gift. */
export function boardRewardLines(rw: DailyReward): string[] {
  const lines: string[] = [];
  if (rw.gold) lines.push(`+${rw.gold.toLocaleString("en-GB")} gold`);
  for (const g of rw.gems ?? [])
    lines.push(`${GEM_TIER_NAMES[g.tier - 1]} ${GEMS[g.gem].name} gem`);
  for (const [m, n] of Object.entries(rw.mats ?? {}) as [Mat, number][])
    lines.push(`${n} ${MATS[m].name}`);
  return lines;
}

/** Grant the next board day and advance the cycle. Throws when today's gift is already claimed. */
export function claimBoardDay(h: Hero, now = Date.now()): string[] {
  if (!canClaimBoardDay(h, now))
    throw new Error("Today's board reward is already claimed — it refreshes at Greek midnight.");
  const day = nextBoardDay(h);
  const rw = boardReward(day);
  const lines = boardRewardLines(rw);
  if (rw.gold) h.gold += rw.gold;
  if (rw.mats) addMats(h, rw.mats);
  for (const g of rw.gems ?? []) addGem(h, g.gem, g.tier);
  const finishedCycle = day >= DAILY_REWARD_DAYS;
  h.dailyRewards = {
    day: finishedCycle ? 0 : day,
    last: boardDayKey(now),
    cycles: (h.dailyRewards?.cycles ?? 0) + (finishedCycle ? 1 : 0),
  };
  return lines;
}
