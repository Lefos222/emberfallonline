import { describe, expect, it } from "vitest";
import { heroStats, makeItem, newHero } from "@/game/data";
import { ACHIEVEMENTS, isClaimable, recordBattle, setFx, sortAchievements } from "@/game/progress";

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
    h.quests = ["wilds-elite", "wilds-boss"];
    const byId = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;
    expect(isClaimable(h, byId("kills_1"))).toBe(true); // 30 kills ≥ 25
    expect(isClaimable(h, byId("kills_2"))).toBe(false); // 30 < 250
    expect(isClaimable(h, byId("drills_1"))).toBe(true);
    expect(isClaimable(h, byId("quests_1"))).toBe(false); // needs 4
    expect(ACHIEVEMENTS.some((a) => a.cat === "Endless")).toBe(true);
  });
  it("the Awakening families read the sanctum's saved track", () => {
    const h = newHero("Tester", "warrior");
    h.level = 90;
    h.awakening = { ...(h.awakening ?? {}), stage: 1, alv: 12, abyss: 4, best: 6, raiment: 1, stars: { wrath: 8 } } as never;
    const byId = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;
    expect(ACHIEVEMENTS.filter((a) => a.cat === "Awakening").length).toBeGreaterThan(5);
    expect(isClaimable(h, byId("awaklvl_1"))).toBe(true); // Awakening level 1
    expect(isClaimable(h, byId("awaklvl_2"))).toBe(true); // Awakening level 10
    expect(isClaimable(h, byId("awaklvl_3"))).toBe(false); // 25 not reached
    expect(isClaimable(h, byId("abyss_1"))).toBe(true); // one floor cleared
    expect(isClaimable(h, byId("echo_1"))).toBe(true); // depth 5+
    expect(isClaimable(h, byId("raiment_1"))).toBe(true);
    expect(ACHIEVEMENTS.some((a) => a.cat === "Life")).toBe(true);
  });

  it("finished achievements lead every list", () => {
    const h = newHero("Tester", "archer");
    // One tiny goal met, everything else untouched.
    recordBattle(h, { title: "A", won: true, rewards: [] });
    const order = sortAchievements(h);
    const firstReady = order.findIndex((a) => isClaimable(h, a));
    const firstOpen = order.findIndex((a) => !isClaimable(h, a) && (a.value(h) < a.goal));
    expect(firstReady).toBe(0);
    expect(firstReady).toBeLessThan(firstOpen);
    // Claiming it drops it behind everything still open, and the next ready one takes the lead.
    const claimed = order[0];
    h.achClaimed = [claimed.id];
    const after = sortAchievements(h);
    expect(after[0].id).not.toBe(claimed.id);
    expect(after[after.length - 1].id).toBe(claimed.id);
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
