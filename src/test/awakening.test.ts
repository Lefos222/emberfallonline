import { describe, expect, it } from "vitest";
import { ENHANCE_MAX, MAX_LEVEL, RARITIES, heroStats, makeItem, newHero, type Slot } from "@/game/data";
import { STARS, RAIMENT, clearAbyss, forgeRaiment, buyStar, grantAxp, axpToNext } from "@/game/awakening";
import { acPowerCap } from "@/game/anticheat-limits";
import { ASPECT_MAX, LATTICE, SIGIL_SLOTS, STAGES, addShards, advanceStage, awakeningOf, spendTrial, TRIALS_PER_DAY, type AwakeningState } from "@/game/awakening";

const SLOTS: Slot[] = ["helmet", "armour", "boots", "belt", "weapon", "ring", "talisman"];

describe("awakening", () => {
  it("pays Dawnshards only from level 90", () => {
    const h = newHero("A", "mage"); h.level = 89; addShards(h, 5);
    expect(awakeningOf(h).shards).toBe(0);
    h.level = 90; addShards(h, 5);
    expect(awakeningOf(h).shards).toBe(5);
  });

  it("needs the stage level to awaken further", () => {
    const h = newHero("A", "warrior"); h.level = 95; h.gold = 1e10;
    h.awakening = { ...awakeningOf(h), shards: 1e6 };
    expect(advanceStage(h)).toBeNull();
    expect(advanceStage(h)).toBe("Requires level 100");
  });

  it("allows five Echo Trials per day", () => {
    const h = newHero("A", "archer"); h.level = 90;
    for (let i = 0; i < TRIALS_PER_DAY; i++) expect(spendTrial(h)).toBe(true);
    expect(spendTrial(h)).toBe(false);
  });

  it("a fully awakened perfect hero stays under the cheat-check rating cap", () => {
    const h = newHero("God", "warrior"); h.level = MAX_LEVEL;
    h.attrs = { str: 420, int: 0, agi: 0, vit: 420 }; h.equipment = {};
    for (const s of SLOTS) { const it = makeItem("warrior", MAX_LEVEL, RARITIES.length - 1, s); it.enh = ENHANCE_MAX; h.equipment[s] = it; }
    const a: AwakeningState = { stage: STAGES.length, shards: 0, lattice: Object.fromEntries(LATTICE.map((n) => [n.id, 30])), aspect: "fury", aspectRank: ASPECT_MAX, sigils: Object.fromEntries(SIGIL_SLOTS.map((s) => [s, { set: "eclipse", lv: 20 }])), trials: 0, best: 0, alv: 2000, stars: Object.fromEntries(STARS.map((x) => [x.id, x.max])), raiment: RAIMENT.length };
    h.awakening = a;
    expect(heroStats(h).power).toBeLessThan(acPowerCap(MAX_LEVEL));
  });

  it("the Abyss only pays the next floor in order", () => {
    const h = newHero("A", "mage"); h.level = 90;
    expect(clearAbyss(h, 2)).toBeNull();
    expect(clearAbyss(h, 1)?.shards).toBe(4);
    expect(clearAbyss(h, 1)).toBeNull();
    expect(h.awakening?.abyss).toBe(1);
  });

  it("each Awakening level grants one Constellation point", () => {
    const h = newHero("A", "mage"); h.level = 90;
    expect(grantAxp(h, axpToNext(0))).toBe(1);
    expect(buyStar(h, "wrath", 5)).toBeNull();
    expect(h.awakening?.stars?.['wrath']).toBe(1);
    expect(buyStar(h, "wrath")).toBe("No Awakening points");
  });

  it("Raiment needs Dawnshards and materials", () => {
    const h = newHero("A", "archer"); h.level = 90;
    h.awakening = { ...h.awakening!, stage: 1, shards: 150 } as AwakeningState;
    expect(forgeRaiment(h)).toBe("Not enough materials");
    h.mats = { ...(h.mats ?? {}), aetherEmber: 20 };
    expect(forgeRaiment(h)).toBeNull();
    expect(h.awakening?.raiment).toBe(1);
  });
});
