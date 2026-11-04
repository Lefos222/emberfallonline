import { describe, expect, it } from "vitest";
import { heroStats, newHero } from "@/game/data";
import {
  ATTRIBUTE_DRILLS,
  attrDrillBlocker,
  attrDrillCost,
  attrDrillRank,
  drillAttrs,
  trainAttributeDrill,
} from "@/game/drills";

describe("barracks attribute drills", () => {
  it("upgrades strength, intelligence, agility and vitality", () => {
    expect(ATTRIBUTE_DRILLS.map((d) => d.id)).toEqual(["str", "int", "agi", "vit"]);
    expect(ATTRIBUTE_DRILLS.map((d) => d.name)).toEqual(["Strength", "Intelligence", "Agility", "Vitality"]);
  });

  it("banks a rank's points permanently and charges its gold", () => {
    const h = newHero("Driller", "warrior");
    h.gold = 100_000;
    h.buildings = { barracks: 20 };
    const drill = ATTRIBUTE_DRILLS[0];
    const cost = attrDrillCost(drill, 0, h.level);
    expect(trainAttributeDrill(h, drill.id)).toBeNull();
    expect(attrDrillRank(h, drill.id)).toBe(1);
    expect(h.gold).toBe(100_000 - cost);
    expect(drillAttrs(h).str).toBe(drill.per);
    // The next rank costs more than the first.
    expect(attrDrillCost(drill, 1, h.level)).toBeGreaterThan(cost);
  });

  it("needs the barracks upgraded before the deeper ranks", () => {
    const h = newHero("Driller", "warrior");
    h.gold = 100_000;
    h.buildings = { barracks: 1 };
    const deep = ATTRIBUTE_DRILLS[ATTRIBUTE_DRILLS.length - 1];
    expect(attrDrillBlocker(h, deep.id)).toMatch(/Requires barracks level/);
    expect(trainAttributeDrill(h, deep.id)).toMatch(/Requires barracks level/);
    expect(attrDrillRank(h, deep.id)).toBe(0);
  });

  it("feeds the shared stat pipeline", () => {
    const h = newHero("Driller", "warrior");
    h.gold = 50_000_000;
    h.buildings = { barracks: 20 };
    const before = heroStats(h);
    for (let i = 0; i < 5; i++) expect(trainAttributeDrill(h, "str")).toBeNull();
    for (let i = 0; i < 5; i++) expect(trainAttributeDrill(h, "vit")).toBeNull();
    const after = heroStats(h);
    expect(after.hp).toBeGreaterThan(before.hp);
    expect(after.patk).toBeGreaterThan(before.patk);
    expect(after.power).toBeGreaterThan(before.power);
  });
});
