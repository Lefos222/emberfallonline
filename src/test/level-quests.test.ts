import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  claimLevelQuest,
  claimableLevelQuests,
  levelQuestRows,
  questsForLevel,
  resetLevelQuests,
} from "@/game/level-quests";
import { emptyRecord, recordBattle } from "@/game/progress";

describe("level quests", () => {
  it("gives every level the same eight distinct quests", () => {
    for (let lv = 1; lv <= 80; lv++) expect(questsForLevel(lv)).toHaveLength(8);
    for (let lv = 1; lv <= 80; lv++) expect(new Set(questsForLevel(lv).map((q) => q.kind)).size).toBe(8);
    expect(questsForLevel(5).map((q) => q.id)).toEqual(questsForLevel(6).map((q) => q.id));
  });

  it("pays more the higher the level", () => {
    expect(questsForLevel(40)[0].gold).toBeGreaterThan(questsForLevel(5)[0].gold);
    expect(questsForLevel(40)[0].xp).toBeGreaterThan(questsForLevel(5)[0].xp);
  });

  it("counts progress from the snapshot taken when the board opened", () => {
    const h = newHero("Questor", "warrior");
    h.level = 2; // level 2 owns the win-battles quest
    resetLevelQuests(h);
    const row = levelQuestRows(h).find((r) => r.quest.kind === "wins")!;
    expect(row.progress).toBe(0);
    recordBattle(h, { title: "skirmish", won: true, rewards: [] });
    expect(levelQuestRows(h).find((r) => r.quest.id === row.quest.id)!.progress).toBe(1);
  });

  it("keeps the progress already made when the hero levels up", () => {
    const h = newHero("Questor", "warrior");
    h.level = 2;
    resetLevelQuests(h);
    for (let i = 0; i < 3; i++) recordBattle(h, { title: "skirmish", won: true, rewards: [] });
    h.level = 3;
    const row = levelQuestRows(h).find((r) => r.quest.kind === "wins")!;
    expect(row.progress).toBe(3);
  });

  it("keeps the Conquest quest locked until its gate opens", () => {
    const low = newHero("Questor", "warrior");
    low.level = 5;
    resetLevelQuests(low);
    expect(levelQuestRows(low).find((r) => r.quest.kind === "floors")!.locked).toBe(true);
    expect(claimableLevelQuests(low)).toBe(0);
    expect(claimLevelQuest(low, "floors")).toMatch(/opens at level 10/);

    const high = newHero("Questor", "warrior");
    high.level = 10;
    resetLevelQuests(high);
    expect(levelQuestRows(high).find((r) => r.quest.kind === "floors")!.locked).toBe(false);
  });

  it("only claims a finished quest, once", () => {
    const h = newHero("Questor", "warrior");
    h.level = 2;
    resetLevelQuests(h);
    const row = levelQuestRows(h).find((r) => r.quest.kind === "wins")!;
    expect(claimLevelQuest(h, row.quest.id)).toMatch(/Not finished/);
    for (let i = 0; i < row.quest.target; i++)
      recordBattle(h, { title: "skirmish", won: true, rewards: [] });
    expect(claimableLevelQuests(h)).toBe(1);
    const gold = h.gold;
    expect(claimLevelQuest(h, row.quest.id)).toBeNull();
    expect(h.gold).toBe(gold + row.quest.gold);
    expect(levelQuestRows(h).find((r) => r.quest.id === row.quest.id)!.claimed).toBe(true);
  });

  it("opens a fresh board once every quest on it is claimed", () => {
    const h = newHero("Questor", "warrior");
    h.level = 20;
    resetLevelQuests(h);
    // Meet every counter after the board opened.
    h.record = { ...emptyRecord(), wins: 999, bosses: 999, arenaWins: 999, enhances: 999 };
    h.crafts = 999;
    h.kills = { a: 999 };
    h.slain = 999;
    h.stage = 999;
    h.spire = 999;
    const ids = levelQuestRows(h).filter((r) => r.done).map((r) => r.quest.id);
    expect(ids).toHaveLength(8);
    for (const id of ids.slice(0, -1)) expect(claimLevelQuest(h, id)).toBeNull();
    const gold = h.gold;
    expect(claimLevelQuest(h, ids[ids.length - 1])).toBeNull();
    expect(h.gold).toBeGreaterThan(gold);
    // The finished board was replaced: nothing claimed, snapshot taken again.
    expect(h.levelQuests!.claimed).toEqual([]);
    expect(levelQuestRows(h).every((r) => !r.claimed)).toBe(true);
  });
});
