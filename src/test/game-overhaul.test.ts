import { describe, expect, it } from "vitest";
import { newHero, stageFoe } from "@/game/data";
import { relicFoe } from "@/game/relics";
import { EXPEDITIONS, EXPEDITION_COMMON_ADDITIONS } from "@/game/building-content";
import { MATS } from "@/game/crafting";
import { claimLevelQuest, levelQuestRows, resetLevelQuests } from "@/game/level-quests";
describe("requested progression rules", () => {
  it("keeps all new expedition materials below rare and pays their stated quantities", () => {
    expect(EXPEDITION_COMMON_ADDITIONS).toEqual(["hide", "bloom", "crystal"]);
    for (const material of EXPEDITION_COMMON_ADDITIONS) expect(MATS[material].rarity).toBeLessThan(3);
    expect(EXPEDITIONS.filter(e => EXPEDITION_COMMON_ADDITIONS.includes(e.material as "hide" | "bloom" | "crystal")).map(e => e.quantity)).toEqual([8, 6, 4]);
  });
  it("makes relic bosses progressively harder at the same character level", () => {
    const hero = newHero("Warden", "warrior"); hero.level = 60;
    const a = relicFoe(hero, 1), b = relicFoe(hero, 2), c = relicFoe(hero, 3);
    expect(a.hp).toBeGreaterThan(stageFoe(61).hp * 1.8);
    expect(b.hp).toBeGreaterThan(a.hp); expect(c.hp).toBeGreaterThan(b.hp);
    expect(b.atk).toBeGreaterThan(a.atk); expect(c.atk).toBeGreaterThan(b.atk);
  });
  it("retains a claimed quest on the eight-quest board", () => {
    const hero = newHero("Legacy", "mage"); hero.level = 4; resetLevelQuests(hero);
    if (!hero.levelQuests) throw new Error("Missing quest state");
    hero.levelQuests.claimed = ["bosses"];
    expect(levelQuestRows(hero)).toHaveLength(8);
    expect(claimLevelQuest(hero, "bosses")).toBe("Already claimed.");
  });
});