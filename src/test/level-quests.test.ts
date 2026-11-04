import { describe, expect, it } from "vitest";
import { newHero } from "@/game/data";
import {
  claimLevelQuest,
  claimableLevelQuests,
  levelQuestRows,
  questsForLevel,
  resetLevelQuests,
} from "@/game/level-quests";
import { recordBattle } from "@/game/progress";

describe("level quests", () => {
  it("gives every level its own three quests", () => {
    for (let lv = 1; lv <= 80; lv++) expect(questsForLevel(lv)).toHaveLength(3);
    expect(questsForLevel(5).map((q) => q.id)).not.toEqual(questsForLevel(6).map((q) => q.id));
  });

  it("pays more the higher the level", () => {
    expect(questsForLevel(40)[0].gold).toBeGreaterThan(questsForLevel(5)[0].gold);
    expect(questsForLevel(40)[0].xp).toBeGreaterThan(questsForLevel(5)[0].xp);
  });

  it("counts progress from the snapshot taken when the level began", () => {
    const h = newHero("Questor", "warrior");
    h.level = 2; // level 2 owns the win-battles quest
    resetLevelQuests(h);
    const row = levelQuestRows(h).find((r) => r.quest.kind === "wins")!;
    expect(row.progress).toBe(0);
    recordBattle(h, { title: "skirmish", won: true, rewards: [] });
    expect(levelQuestRows(h).find((r) => r.quest.id === row.quest.id)!.progress).toBe(1);
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
    expect(claimLevelQuest(h, row.quest.id)).toMatch(/Already claimed/);
    expect(claimableLevelQuests(h)).toBe(0);
  });
});
