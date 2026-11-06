// ============= Daily reward board: a 30-day cycle of small gifts =============
// One gift per Greek day, taken in order. The board is a ledger on the hero save and hands out
// gold, level 1-2 gems, materials and gold chests, so it never needs a server round trip.

import { greekDayStart } from "./events";
import { GEMS, GEM_TIER_NAMES, MATS, addGem, addMats, type GemType, type Mat } from "./crafting";
import type { Hero } from "./data";
import { CHESTS, addChests, type ChestKind } from "./chests";
import { premiumState } from "./economy";

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
  /** Chest days hand over real chest items, opened later from the Armory vault. */
  chest?: boolean;
  chests?: ChestKind[];
}

// One line per day keeps the 30-day table readable.
// prettier-ignore
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, label: "120 gold", gold: 120 },
  { day: 2, label: "Chipped Ruby gem", gems: [{ gem: "ruby", tier: 1 }] },
  { day: 3, label: "4 Ember Ore", mats: { ore: 4 } },
  { day: 4, label: "Chipped Emerald gem", gems: [{ gem: "emerald", tier: 1 }] },
  { day: 5, label: "2 Armor Fragments", mats: { fragment: 2 } },
  { day: 6, label: "Gold Chest", chest: true, chests: ["gold"], mats: { ore: 6 } },
  { day: 7, label: "180 gold", gold: 180 },
  { day: 8, label: "Chipped Sapphire gem", gems: [{ gem: "sapphire", tier: 1 }] },
  { day: 9, label: "3 Armor Fragments", mats: { fragment: 3 } },
  { day: 10, label: "Chipped Topaz gem + 2 Soul Essence", gems: [{ gem: "topaz", tier: 1 }], mats: { essence: 2 } },
  { day: 11, label: "260 gold", gold: 260 },
  { day: 12, label: "Gold Chest", chest: true, chests: ["gold"], mats: { ore: 8, fragment: 3 } },
  { day: 13, label: "Flawed Amethyst gem", gems: [{ gem: "amethyst", tier: 2 }] },
  { day: 14, label: "5 Armor Fragments", mats: { fragment: 5 } },
  { day: 15, label: "350 gold", gold: 350 },
  { day: 16, label: "Flawed Tourmaline gem", gems: [{ gem: "tourmaline", tier: 2 }] },
  { day: 17, label: "4 Soul Essence + 4 Beast Hide", mats: { essence: 4, hide: 4 } },
  { day: 18, label: "Gold Chest", chest: true, chests: ["gold"], mats: { ore: 10, fragment: 5, essence: 2 } },
  { day: 19, label: "Flawed Ruby gem", gems: [{ gem: "ruby", tier: 2 }] },
  { day: 20, label: "500 gold", gold: 500 },
  { day: 21, label: "6 Armor Fragments", mats: { fragment: 6 } },
  { day: 22, label: "Flawed Aquamarine gem", gems: [{ gem: "aquamarine", tier: 2 }] },
  { day: 23, label: "700 gold", gold: 700 },
  { day: 24, label: "Gold Chest", chest: true, chests: ["gold"], mats: { ore: 12, fragment: 6, essence: 3 } },
  { day: 25, label: "Flawed Lapis gem", gems: [{ gem: "lapis", tier: 2 }] },
  { day: 26, label: "900 gold", gold: 900 },
  { day: 27, label: "8 Armor Fragments + Elite Sigil", mats: { fragment: 8, sigil: 1 } },
  { day: 28, label: "Flawed Emerald + Flawed Sapphire gems", gems: [{ gem: "emerald", tier: 2 }, { gem: "sapphire", tier: 2 }] },
  { day: 29, label: "1,200 gold", gold: 1200 },
  { day: 30, label: "Grand Gold Chest", chest: true, chests: ["gold", "gold", "gem"], mats: { ore: 20, fragment: 12, essence: 5 }, gems: [{ gem: "amethyst", tier: 2 }] },
];

/** Board progress kept on the hero save: days claimed this cycle, the Greek day it was claimed, cycles finished. */
export interface DailyRewardState {
  day?: number;
  last?: string;
  cycles?: number;
  /** The VIP board's own ledger, so both boards roll on independently. */
  vip?: { day?: number; last?: string; cycles?: number };
}

/** The VIP board opens at the top membership tier. */
export const VIP_BOARD_MIN_LEVEL = 3;

export const VIP_BOARD_LOCKED = "The VIP board is for VIP 3 members and above.";

/**
 * The VIP board: thirty days of the same kind of small gifts, a touch richer than the free
 * board — more gold, an extra gem or material on some days — and deliberately nothing rare
 * and no Diamonds. VIP has to stay a head start, not a separate economy.
 */
// prettier-ignore
export const VIP_DAILY_REWARDS: DailyReward[] = [
  { day: 1, label: "180 gold", gold: 180 },
  { day: 2, label: "Chipped Ruby + Chipped Sapphire gems", gems: [{ gem: "ruby", tier: 1 }, { gem: "sapphire", tier: 1 }] },
  { day: 3, label: "6 Ember Ore + 2 Beast Hide", mats: { ore: 6, hide: 2 } },
  { day: 4, label: "Chipped Emerald gem + 120 gold", gems: [{ gem: "emerald", tier: 1 }], gold: 120 },
  { day: 5, label: "4 Armor Fragments", mats: { fragment: 4 } },
  { day: 6, label: "Gold Chest + 8 Ember Ore", chest: true, chests: ["gold"], mats: { ore: 8 } },
  { day: 7, label: "260 gold", gold: 260 },
  { day: 8, label: "Chipped Sapphire + Chipped Topaz gems", gems: [{ gem: "sapphire", tier: 1 }, { gem: "topaz", tier: 1 }] },
  { day: 9, label: "5 Armor Fragments + 2 Soul Essence", mats: { fragment: 5, essence: 2 } },
  { day: 10, label: "Chipped Amethyst gem + 3 Soul Essence", gems: [{ gem: "amethyst", tier: 1 }], mats: { essence: 3 } },
  { day: 11, label: "380 gold", gold: 380 },
  { day: 12, label: "Gold Chest + 12 Ember Ore + 4 Armor Fragments", chest: true, chests: ["gold"], mats: { ore: 12, fragment: 4 } },
  { day: 13, label: "Flawed Amethyst gem", gems: [{ gem: "amethyst", tier: 2 }] },
  { day: 14, label: "7 Armor Fragments", mats: { fragment: 7 } },
  { day: 15, label: "500 gold", gold: 500 },
  { day: 16, label: "Flawed Tourmaline gem + 150 gold", gems: [{ gem: "tourmaline", tier: 2 }], gold: 150 },
  { day: 17, label: "6 Soul Essence + 6 Beast Hide", mats: { essence: 6, hide: 6 } },
  { day: 18, label: "Gold Chest + 14 Ember Ore + 7 Armor Fragments", chest: true, chests: ["gold"], mats: { ore: 14, fragment: 7 } },
  { day: 19, label: "Flawed Ruby gem + 200 gold", gems: [{ gem: "ruby", tier: 2 }], gold: 200 },
  { day: 20, label: "720 gold", gold: 720 },
  { day: 21, label: "9 Armor Fragments", mats: { fragment: 9 } },
  { day: 22, label: "Flawed Aquamarine gem + 4 Soul Essence", gems: [{ gem: "aquamarine", tier: 2 }], mats: { essence: 4 } },
  { day: 23, label: "1,000 gold", gold: 1000 },
  { day: 24, label: "Gold Chest + 16 Ember Ore + 8 Armor Fragments", chest: true, chests: ["gold"], mats: { ore: 16, fragment: 8 } },
  { day: 25, label: "Flawed Lapis gem + 250 gold", gems: [{ gem: "lapis", tier: 2 }], gold: 250 },
  { day: 26, label: "1,300 gold", gold: 1300 },
  { day: 27, label: "10 Armor Fragments + 5 Soul Essence", mats: { fragment: 10, essence: 5 } },
  { day: 28, label: "Flawed Emerald + Flawed Sapphire gems", gems: [{ gem: "emerald", tier: 2 }, { gem: "sapphire", tier: 2 }] },
  { day: 29, label: "1,700 gold", gold: 1700 },
  { day: 30, label: "Grand Gold Chest + 24 Ember Ore + Flawed Amethyst gem", chest: true, chests: ["gold", "gold"], mats: { ore: 24, fragment: 14, essence: 6 }, gems: [{ gem: "amethyst", tier: 2 }] },
];

/** Greek day key, so the board offers exactly one gift per server day. */
export const boardDayKey = (now = Date.now()) =>
  new Date(greekDayStart(now)).toISOString().slice(0, 10);

/** Days already claimed on a board track (0-30). */
const claimedDays = (state?: { day?: number }) =>
  Math.min(DAILY_REWARD_DAYS, Math.max(0, Math.floor(state?.day ?? 0)));

/** Days already claimed in the current cycle (0-30). */
export const claimedBoardDays = (h: { dailyRewards?: DailyRewardState }) =>
  claimedDays(h.dailyRewards);

/** The day the board offers next, 1-30; a finished board rolls over to day 1. */
export const nextBoardDay = (h: { dailyRewards?: DailyRewardState }) => claimedBoardDays(h) + 1;

/** The VIP tier on the save; the premium wallet is server-owned (see economy.ts). */
export const vipLevelOf = (h: unknown) => premiumState(h).vip.level;

/** The VIP board is open to the top membership tier only. */
export const vipBoardUnlocked = (h: unknown) => vipLevelOf(h) >= VIP_BOARD_MIN_LEVEL;

/** Days claimed on the VIP board this cycle (0-30). */
export const vipClaimedBoardDays = (h: { dailyRewards?: DailyRewardState }) =>
  claimedDays(h.dailyRewards?.vip);

/** The day the VIP board offers next, 1-30. */
export const vipNextBoardDay = (h: { dailyRewards?: DailyRewardState }) =>
  vipClaimedBoardDays(h) + 1;

/** A day's gift, or the first day's gift when the board rolls over. */
export const boardReward = (day: number): DailyReward => DAILY_REWARDS[day - 1] ?? DAILY_REWARDS[0];

/** The VIP board's day, or its first day when the board rolls over. */
export const vipBoardReward = (day: number): DailyReward =>
  VIP_DAILY_REWARDS[day - 1] ?? VIP_DAILY_REWARDS[0];

/** True while the next board day is still unclaimed today. */
export const canClaimBoardDay = (h: { dailyRewards?: DailyRewardState }, now = Date.now()) =>
  h.dailyRewards?.last !== boardDayKey(now);

/** True while the next VIP board day is still unclaimed today and the membership is high enough. */
export const canClaimVipBoardDay = (h: { dailyRewards?: DailyRewardState }, now = Date.now()) =>
  vipBoardUnlocked(h) && h.dailyRewards?.vip?.last !== boardDayKey(now);

/** Human-readable lines for a day's gift. */
export function boardRewardLines(rw: DailyReward): string[] {
  const lines: string[] = [];
  if (rw.gold) lines.push(`+${rw.gold.toLocaleString("en-GB")} gold`);
  for (const g of rw.gems ?? [])
    lines.push(`${GEM_TIER_NAMES[g.tier - 1]} ${GEMS[g.gem].name} gem`);
  for (const [m, n] of Object.entries(rw.mats ?? {}) as [Mat, number][])
    lines.push(`${n} ${MATS[m].name}`);
  for (const c of rw.chests ?? []) lines.push(`${CHESTS[c].name} (Vault)`);
  return lines;
}

/** Pay one day's gift onto the hero and return the readable lines. */
function payDay(h: Hero, rw: DailyReward): string[] {
  if (rw.gold) h.gold += rw.gold;
  if (rw.mats) addMats(h, rw.mats);
  for (const g of rw.gems ?? []) addGem(h, g.gem, g.tier);
  for (const c of rw.chests ?? []) addChests(h, c);
  return boardRewardLines(rw);
}

/** Grant the next board day and advance the cycle. Throws when today's gift is already claimed. */
export function claimBoardDay(h: Hero, now = Date.now()): string[] {
  if (!canClaimBoardDay(h, now))
    throw new Error("Today's board reward is already claimed — it refreshes at Greek midnight.");
  const day = nextBoardDay(h);
  const lines = payDay(h, boardReward(day));
  const finishedCycle = day >= DAILY_REWARD_DAYS;
  h.dailyRewards = {
    ...(h.dailyRewards ?? {}),
    day: finishedCycle ? 0 : day,
    last: boardDayKey(now),
    cycles: (h.dailyRewards?.cycles ?? 0) + (finishedCycle ? 1 : 0),
  };
  return lines;
}

/**
 * Grant the next VIP board day. Throws below VIP 3 or when today's VIP gift is already taken.
 * The VIP board keeps its own ledger, so the free board is unaffected.
 */
export function claimVipBoardDay(h: Hero, now = Date.now()): string[] {
  if (!vipBoardUnlocked(h)) throw new Error(VIP_BOARD_LOCKED);
  if (!canClaimVipBoardDay(h, now))
    throw new Error("Today's VIP board gift is already claimed — it refreshes at Greek midnight.");
  const day = vipNextBoardDay(h);
  const lines = payDay(h, vipBoardReward(day));
  const finishedCycle = day >= DAILY_REWARD_DAYS;
  const previous = h.dailyRewards?.vip;
  h.dailyRewards = {
    ...(h.dailyRewards ?? {}),
    vip: {
      day: finishedCycle ? 0 : day,
      last: boardDayKey(now),
      cycles: (previous?.cycles ?? 0) + (finishedCycle ? 1 : 0),
    },
  };
  return lines;
}
