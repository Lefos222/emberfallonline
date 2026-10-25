import type { Hero } from "./data";
import type { Mat } from "./crafting";
import { greekDayStart } from "./events";

/** One daily commission. Progress is measured against a snapshot taken on the first visit of the
 *  Greek day, so every counter below is a lifetime value read straight from the hero save. */
export interface DailyQuest {
  id: string; name: string; desc: string; target: number;
  mat: Mat; mats: number; gold: number; xp: number;
  count: (h: Hero) => number;
}

const gemTotal = (h: Hero) => Object.values(h.gems ?? {}).reduce((a, n) => a + n, 0);
const attrTotal = (h: Hero) => Object.values(h.attrs).reduce((a, n) => a + n, 0);

export const DAILY_QUESTS: DailyQuest[] = [
  { id: "level", name: "Rise Through the Ranks", desc: "Gain a character level", target: 1, mat: "essence", mats: 2, gold: 400, xp: 250, count: (h) => h.level + h.paragon * 10 },
  { id: "astral", name: "Bind New Astrals", desc: "Summon or capture 2 Astrals", target: 2, mat: "starshard", mats: 2, gold: 500, xp: 400, count: (h) => (h.astrals ?? []).length },
  { id: "gems", name: "Cut Three Gems", desc: "Cut 3 gems from Ember Ore", target: 3, mat: "ore", mats: 3, gold: 350, xp: 300, count: gemTotal },
  { id: "train", name: "Drill the Troops", desc: "Train 5 attribute points", target: 5, mat: "essence", mats: 2, gold: 300, xp: 350, count: attrTotal },
  { id: "battle", name: "Win Five Battles", desc: "Win 5 fights anywhere", target: 5, mat: "fragment", mats: 1, gold: 450, xp: 500, count: (h) => h.record?.wins ?? 0 },
  { id: "enhance", name: "Temper the Steel", desc: "Succeed at 3 enhancements", target: 3, mat: "essence", mats: 2, gold: 400, xp: 300, count: (h) => h.record?.enhances ?? 0 },
];

export type BoardState = { day: string; base: Record<string, number>; claimed: string[] };

/** Snapshot of every counter at the start of the day. */
export const snapshot = (h: Hero) => Object.fromEntries(DAILY_QUESTS.map((q) => [q.id, q.count(h)]));

/** Greek calendar day the board is on. */
export const boardDay = (now = Date.now()) => new Date(greekDayStart(now)).toISOString().slice(0, 10);

/** When the board rolls over: the next Greek midnight. */
export const boardResetAt = (now = Date.now()) => greekDayStart(now) + 86400000;

/** Brings the saved board up to date for today, snapshotting counters when the day has turned. */
export function rollBoard(h: Hero, now = Date.now()): BoardState {
  const day = boardDay(now);
  const cur = h.daily;
  if (cur && cur.day === day) return cur;
  const fresh: BoardState = { day, base: snapshot(h), claimed: [] };
  h.daily = fresh;
  return fresh;
}

export interface BoardRow { quest: DailyQuest; progress: number; claimed: boolean; done: boolean }

export function boardRows(h: Hero, now = Date.now()): BoardRow[] {
  const day = boardDay(now);
  const state: BoardState = h.daily && h.daily.day === day ? h.daily : { day, base: snapshot(h), claimed: [] };
  return DAILY_QUESTS.map((quest) => {
    const gained = quest.count(h) - (state.base[quest.id] ?? 0);
    const progress = Math.min(quest.target, Math.max(0, gained));
    return { quest, progress, claimed: state.claimed.includes(quest.id), done: progress >= quest.target };
  });
}
