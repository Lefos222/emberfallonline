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
