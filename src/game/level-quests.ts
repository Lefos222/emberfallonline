import { levelShareScale, xpToNext, type Hero } from "./data";
import { grant } from "./logic";

/**
 * Level quests — the login progression track. Every character level opens a fresh set of
 * three quests measured against a counter snapshot taken when that level began, so progress
 * is real play (battles, bosses, craft, training) rather than a second reward engine.
 */

export type QuestKind =
  "wins" | "stages" | "kills" | "enhances" | "bosses" | "crafts" | "arena" | "floors";

interface QuestDef {
  name: string;
  desc: string;
  base: number;
  growth: number;
}

const DEFS: Record<QuestKind, QuestDef> = {
  wins: { name: "Blood on the Blade", desc: "Win {n} battles", base: 3, growth: 0.5 },
  stages: { name: "Push the Frontier", desc: "Clear {n} campaign stages", base: 2, growth: 0.25 },
  kills: { name: "Cull the Horde", desc: "Slay {n} monsters", base: 10, growth: 3 },
  enhances: { name: "Temper the Steel", desc: "Succeed at {n} enhancements", base: 2, growth: 0.2 },
  bosses: { name: "Tyrant Hunter", desc: "Defeat {n} bosses", base: 1, growth: 0.15 },
  crafts: { name: "Master of the Forge", desc: "Craft {n} items", base: 1, growth: 0.1 },
  arena: { name: "Arena Glory", desc: "Win {n} arena duels", base: 1, growth: 0.15 },
  floors: { name: "Climb the Spire", desc: "Clear {n} Conquest floors", base: 1, growth: 0.15 },
};

/** The order quests rotate through, so consecutive levels never hand out the same three. */
const ORDER: QuestKind[] = [
  "wins",
  "stages",
  "kills",
  "enhances",
  "bosses",
  "crafts",
  "arena",
  "floors",
];

export interface LevelQuest {
  id: string;
  level: number;
  kind: QuestKind;
  name: string;
  desc: string;
  target: number;
  gold: number;
  xp: number;
}

/** The three quests a level owns. Deterministic, so a refresh never rerolls the board. */
export function questsForLevel(level: number): LevelQuest[] {
  const lv = Math.max(1, Math.floor(level));
  return [0, 1, 2].map((i) => {
    const kind = ORDER[(lv * 3 + i) % ORDER.length];
    const d = DEFS[kind];
    const target = Math.max(1, Math.round(d.base + d.growth * lv));
    return {
      id: `${kind}@${lv}`,
      level: lv,
      kind,
      name: d.name,
      desc: d.desc.replace("{n}", String(target)),
      target,
      gold: Math.round(50 + 12 * lv + 0.4 * lv * lv),
      xp: Math.round(xpToNext({ level: lv, paragon: 0 }) * 0.05 * levelShareScale(lv)),
    };
  });
}

/** The saved counter a quest kind reads. Every one is a lifetime value already on the hero. */
export function questCounter(h: Hero, kind: QuestKind): number {
  switch (kind) {
    case "wins":
      return h.record?.wins ?? 0;
    case "bosses":
      return h.record?.bosses ?? 0;
    case "arena":
      return h.record?.arenaWins ?? 0;
    case "enhances":
      return h.record?.enhances ?? 0;
    case "crafts":
      return h.crafts ?? 0;
    case "kills":
      return Object.values(h.kills ?? {}).reduce((a, n) => a + n, 0);
    case "stages":
      return Math.max(0, h.stage - 1);
    case "floors":
      return Math.max(0, h.spire - 1);
  }
}

export interface LevelQuestState {
  level: number;
  base: Record<string, number>;
  claimed: string[];
}

const snapshot = (h: Hero) => Object.fromEntries(ORDER.map((k) => [k, questCounter(h, k)]));

/** Start the board of the hero's current level, snapshotting its counters. */
export function resetLevelQuests(h: Hero): LevelQuestState {
  const state: LevelQuestState = { level: h.level, base: snapshot(h), claimed: [] };
  h.levelQuests = state;
  return state;
}

/** The board of the current level, created (and saved) on first read after a level-up. */
export function rollLevelQuests(h: Hero): LevelQuestState {
  const cur = h.levelQuests;
  return cur && cur.level === h.level ? cur : resetLevelQuests(h);
}

export interface LevelQuestRow {
  quest: LevelQuest;
  progress: number;
  claimed: boolean;
  done: boolean;
}

/** The current level's board without writing: an unstarted level counts from right now. */
const readState = (h: Hero): LevelQuestState =>
  h.levelQuests && h.levelQuests.level === h.level
    ? h.levelQuests
    : { level: h.level, base: snapshot(h), claimed: [] };

/** The current level's quests with progress counted from the level's snapshot. */
export function levelQuestRows(h: Hero): LevelQuestRow[] {
  const state = readState(h);
  return questsForLevel(h.level).map((quest) => {
    const progress = Math.max(0, questCounter(h, quest.kind) - (state.base[quest.kind] ?? 0));
    return {
      quest,
      progress: Math.min(progress, quest.target),
      claimed: state.claimed.includes(quest.id),
      done: progress >= quest.target,
    };
  });
}

/** Quests finished but not yet claimed — the badge on the Quests button. */
export const claimableLevelQuests = (h: Hero | null) =>
  h ? levelQuestRows(h).filter((r) => r.done && !r.claimed).length : 0;

/** Claim one finished quest. Returns an error message, or null on success. */
export function claimLevelQuest(h: Hero, id: string): string | null {
  const state = rollLevelQuests(h);
  const row = levelQuestRows(h).find((r) => r.quest.id === id);
  if (!row) return "That quest is not on this level's board.";
  if (row.claimed) return "Already claimed.";
  if (!row.done) return "Not finished yet.";
  state.claimed.push(id);
  // grant() clears the board when the payout levels the hero up: the next level brings its own quests.
  grant(h, row.quest.xp, row.quest.gold);
  return null;
}
