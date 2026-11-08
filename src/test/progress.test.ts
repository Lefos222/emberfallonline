import { describe, expect, it } from "vitest";
import { heroStats, makeItem, newHero } from "@/game/data";
import { ACHIEVEMENTS, isClaimable, recordBattle, setFx } from "@/game/progress";

describe("progress", () => {
  it("records wins, bosses and keeps history newest first", () => {
    const h = newHero("Tester", "archer");
    recordBattle(h, { title: "A", won: true, boss: true, rewards: [] });
    recordBattle(h, { title: "B", won: false, rewards: [] });
    expect(h.record).toMatchObject({ battles: 2, wins: 1, losses: 1, bosses: 1 });
    expect(h.history?.[0].title).toBe("B");
  });
  it("an achievement can only be claimed once", () => {
    const h = newHero("Tester", "archer");
    const a = ACHIEVEMENTS.find((x) => x.id === "boss_1")!;
    recordBattle(h, { title: "Boss", won: true, boss: true, rewards: [] });
    expect(isClaimable(h, a)).toBe(true);
    h.achClaimed = [a.id];
    expect(isClaimable(h, a)).toBe(false);
  });
  it("counters from other systems feed their achievement families", () => {
    const h = newHero("Tester", "mage");
    h.kills = { wolf: 20, boar: 10 };
    h.drills = { vitality: 3 };
    h.talents = { t1: 5, t2: 10 };
    h.quests = ["wilds-elite", "wilds-boss"];
    const byId = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;
    expect(isClaimable(h, byId("kills_1"))).toBe(true); // 30 kills ≥ 25
    expect(isClaimable(h, byId("kills_2"))).toBe(false); // 30 < 250
    expect(isClaimable(h, byId("drills_1"))).toBe(true);
    expect(isClaimable(h, byId("talentranks_1"))).toBe(true); // 15 ranks
    expect(isClaimable(h, byId("quests_1"))).toBe(false); // needs 4
    expect(ACHIEVEMENTS.some((a) => a.cat === "Endless")).toBe(true);
  });
  it("2 matching set pieces grant +4% attack and raise stats", () => {
    const h = newHero("Tester", "warrior");
    const w = makeItem("warrior", 10, 2, "weapon"); w.name = "Moonlit Blade";
    const a = makeItem("warrior", 10, 2, "armour"); a.name = "Iron Plate";
    h.equipment = { weapon: w, armour: a };
    const before = heroStats(h).atk;
    a.name = "Moonlit Plate";
    expect(setFx(h.equipment).atkPct).toBe(4);
    expect(heroStats(h).atk).toBeGreaterThan(before);
  });
});
