import { locAll } from "./i18n";
import { levelShareScale, xpToNext, type Hero } from "./data";
import { grant } from "./logic";

/**
 * The hero's quest board — the one quest track of the game, opened from the right edge of the
 * castle. A board is eight quests measured against a counter snapshot taken when it opened, so
 * progress is real play (battles, bosses, craft, training) rather than a second reward engine.
 * Clearing the board opens a fresh one; levelling up never wipes the work already done.
 */

export type QuestKind =
  "wins" | "stages" | "kills" | "enhances" | "bosses" | "crafts" | "arena" | "floors";

interface QuestDef {
  name: string;
  desc: string;
  base: number;
  growth: number;
}

const DEFS: Record<QuestKind, QuestDef> = locAll(
  {
    wins: { name: "Blood on the Blade", desc: "Win {n} battles", base: 3, growth: 0.5 },
    stages: { name: "Push the Frontier", desc: "Clear {n} campaign stages", base: 2, growth: 0.25 },
    kills: { name: "Cull the Horde", desc: "Slay {n} monsters", base: 10, growth: 3 },
    enhances: {
      name: "Temper the Steel",
      desc: "Succeed at {n} enhancements",
      base: 2,
      growth: 0.2,
    },
    bosses: { name: "Tyrant Hunter", desc: "Defeat {n} bosses", base: 1, growth: 0.15 },
    crafts: { name: "Master of the Forge", desc: "Craft {n} items", base: 1, growth: 0.1 },
    arena: { name: "Arena Glory", desc: "Win {n} arena duels", base: 1, growth: 0.15 },
    floors: { name: "Climb the Spire", desc: "Clear {n} Conquest floors", base: 1, growth: 0.15 },
  },
  ["name"],
  ["desc"],
);

/** The order the eight quests appear in. One board carries all eight kinds, so nothing is ever a duplicate. */
const ORDER: QuestKind[] = [
  "wins",
  "kills",
  "stages",
  "bosses",
  "crafts",
  "enhances",
  "arena",
  "floors",
];

/** The Conquest Gate opens at this level; its quest stays on the board, locked, until then. */
export const QUESTS_FLOORS_LEVEL = 10;

export interface LevelQuest {
  id: string;
  level: number;
  kind: QuestKind;
  name: string;
  desc: string;
  target: number;
  gold: number;
  xp: number;
  /** Not reachable yet (the Conquest Gate is closed), so it can never be claimed. */
  locked: boolean;
}

/** The board's eight quests with targets and rewards scaled to the hero's level. */
export function questsForLevel(level: number): LevelQuest[] {
  const lv = Math.max(1, Math.floor(level));
  return ORDER.map((kind) => {
    const d = DEFS[kind];
    const target = Math.max(1, Math.round(d.base + d.growth * lv));
    return {
      id: kind,
      level: lv,
      kind,
      name: d.name,
      desc: d.desc.replace("{n}", String(target)),
      target,
      gold: Math.round(50 + 12 * lv + 0.4 * lv * lv),
      xp: Math.round(xpToNext({ level: lv, paragon: 0 }) * 0.05 * levelShareScale(lv)),
      locked: kind === "floors" && lv < QUESTS_FLOORS_LEVEL,
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
      return Object.values(h.kills ?? {}).reduce((a, n) => a + n, 0) + (h.slain ?? 0);
    case "stages":
      return Math.max(0, h.stage - 1);
    case "floors":
      return Math.max(0, h.spire - 1);
  }
}

export interface LevelQuestState {
  base: Record<string, number>;
  claimed: string[];
}

const snapshot = (h: Hero) => Object.fromEntries(ORDER.map((k) => [k, questCounter(h, k)]));

/** True for a save written by the old per-level board, which is replaced on its first read. */
const legacy = (state: LevelQuestState | undefined) => !!state && "level" in (state as object);

/** Open a fresh board: snapshot every counter now, with nothing claimed. */
export function resetLevelQuests(h: Hero): LevelQuestState {
  const state: LevelQuestState = { base: snapshot(h), claimed: [] };
  h.levelQuests = state;
  return state;
}

/** The hero's board, opened (and saved) the first time it is read. A level-up never resets it. */
export function rollLevelQuests(h: Hero): LevelQuestState {
  if (!h.levelQuests || legacy(h.levelQuests)) return resetLevelQuests(h);
  return h.levelQuests;
}

export interface LevelQuestRow {
  quest: LevelQuest;
  progress: number;
  claimed: boolean;
  done: boolean;
  locked: boolean;
}

/** The board without writing: an unopened board counts from right now. */
const readState = (h: Hero): LevelQuestState =>
  h.levelQuests && !legacy(h.levelQuests) ? h.levelQuests : { base: snapshot(h), claimed: [] };

/** The board's quests with progress counted from the snapshot its session began with. */
export function levelQuestRows(h: Hero): LevelQuestRow[] {
  const state = readState(h);
  return questsForLevel(h.level).map((quest) => {
    const gained = Math.max(0, questCounter(h, quest.kind) - (state.base[quest.kind] ?? 0));
    return {
      quest,
      progress: Math.min(gained, quest.target),
      claimed: state.claimed.includes(quest.id),
      done: !quest.locked && gained >= quest.target,
      locked: quest.locked,
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
  if (!row) return "That quest is not on this board.";
  if (row.locked) return `This quest opens at level ${QUESTS_FLOORS_LEVEL}.`;
  if (row.claimed) return "Already claimed.";
  if (!row.done) return "Not finished yet.";
  state.claimed.push(id);
  grant(h, row.quest.xp, row.quest.gold);
  // A finished board is replaced at once, so the hero always has quests to chase.
  if (levelQuestRows(h).every((r) => r.locked || r.claimed)) resetLevelQuests(h);
  return null;
}
