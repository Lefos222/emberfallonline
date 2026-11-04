import { describe, expect, it } from "vitest";
import { heroStats, makeItem, newHero, INVENTORY_CAP } from "@/game/data";
import {
  ASTRAL_MAX_LVL, ASTRAL_RARITY, RECIPES, astralLabel, astralUpgradeCost, astralValue,
  battleMats, craft, equipAstral, fuseGem, gemValue, insertGem, normalizeAstrals, refine, removeGem, scrapItem,
  scrapYield, summonAstral, upgradeAstral,
} from "@/game/crafting";
import { buyConquestGem, gemGoldPrice } from "@/game/conquest";

describe("gems, astrals, crafting", () => {
  it("a socketed ruby raises attack and removing returns the gem", () => {
    const h = newHero("T", "warrior");
    const w = makeItem("warrior", 10, 3, "weapon"); h.equipment.weapon = w;
    h.gems = { "ruby:2": 1 };
    const before = heroStats(h).atk;
    expect(insertGem(h, w.id, 0, "ruby:2")).toBeNull();
    expect(h.gems["ruby:2"]).toBe(0);
    expect(heroStats(h).atk).toBeGreaterThan(before);
    expect(insertGem(h, w.id, 0, "ruby:2")).not.toBeNull(); // no gem left
    expect(removeGem(h, w.id, 0)).toBeNull();
    expect(h.gems["ruby:2"]).toBe(1);
  });
  it("gem values follow the twelve-level chart", () => {
    expect(gemValue("ruby:1")).toBe(32);
    expect(gemValue("ruby:12")).toBe(780);
    expect(gemValue("tourmaline:12")).toBe(3900);
    expect(gemValue("amethyst:12")).toBe(33); // 660 rating / 20 points per percent
  });
  it("a socketed ruby adds flat physical attack", () => {
    const h = newHero("T", "warrior");
    const w = makeItem("warrior", 10, 3, "weapon"); h.equipment.weapon = w;
    h.gems = { "ruby:12": 1 };
    const before = heroStats(h).patk;
    expect(insertGem(h, w.id, 0, "ruby:12")).toBeNull();
    expect(heroStats(h).patk).toBe(before + 780);
  });
  it("the Conquest Gate sells any gem level for gold", () => {
    const h = newHero("T", "warrior");
    expect(gemGoldPrice(1, 1)).toBe(1800);
    h.gold = gemGoldPrice(3, h.level);
    expect(buyConquestGem(h, "lapis", 3)).toBeNull();
    expect(h.gold).toBe(0);
    expect(h.gems?.["lapis:3"]).toBe(1);
    expect(buyConquestGem(h, "lapis", 4)).toMatch(/Not enough gold/);
  });
  it("fusing needs 3 gems and consumes them", () => {
    const h = newHero("T", "mage"); h.gold = 10000; h.mats = { essence: 5 };
    h.gems = { "topaz:1": 2 };
    expect(fuseGem(h, "topaz:1")).toMatch(/Needs 3/);
    h.gems = { "topaz:1": 3 };
    expect(fuseGem(h, "topaz:1")).toBeNull();
    expect(h.gems).toMatchObject({ "topaz:1": 0, "topaz:2": 1 });
  });
  it("crafting validates materials and never charges twice on failure", () => {
    const h = newHero("T", "archer"); h.gold = 500; h.mats = { ore: 19, essence: 2 };
    const r = RECIPES[0];
    expect(craft(h, r, INVENTORY_CAP, () => makeItem("archer", 1, 2))).toBe("Missing materials");
    expect(h.gold).toBe(500);
    h.mats.ore = 20;
    const it = craft(h, r, INVENTORY_CAP, () => makeItem("archer", 1, 2));
    expect(typeof it).not.toBe("string");
    expect(h.gold).toBe(0);
    expect(h.mats.ore).toBe(0);
  });
  it("astrals carry the six-colour ladder and climb ten levels", () => {
    const h = newHero("T", "warrior");
    h.mats = { starshard: 9999 };
    const a = summonAstral(h, () => 0.999) as Exclude<ReturnType<typeof summonAstral>, string>;
    expect(ASTRAL_RARITY).toEqual(["White", "Green", "Blue", "Purple", "Gold", "Red"]);
    expect(a.rarity).toBe(0);
    expect(a.lvl).toBe(1);
    expect(ASTRAL_MAX_LVL).toBe(10);
    // Rarity outranks levels: a fresh Red Astral beats a fully upgraded White one.
    expect(astralValue({ ...a, rarity: 5, lvl: 1 })).toBeGreaterThan(astralValue({ ...a, rarity: 0, lvl: ASTRAL_MAX_LVL }));
    expect(astralLabel({ ...a, lvl: ASTRAL_MAX_LVL })).toMatch(/Lv10$/);
    // Ten upgrades, the eleventh is refused.
    const first = astralUpgradeCost(a);
    for (let i = 0; i < ASTRAL_MAX_LVL - 1; i++) expect(upgradeAstral(h, a.id)).toBeNull();
    expect(a.lvl).toBe(ASTRAL_MAX_LVL);
    expect(upgradeAstral(h, a.id)).toBe("Max level");
    expect(astralUpgradeCost(a)).toBeGreaterThan(first);
  });

  it("clamps old saves and server Astrals onto the new ladder", () => {
    const h = { astrals: [{ id: "a", base: "ember", rarity: 9, lvl: 0 }, { id: "b", base: "owl", rarity: -2, lvl: 40 }] };
    normalizeAstrals(h);
    expect(h.astrals.map((x) => [x.rarity, x.lvl])).toEqual([[5, 1], [0, 10]]);
  });

  it("equipped astrals add stats; summoning costs 10 starshards", () => {
    const h = newHero("T", "warrior"); h.mats = { starshard: 10 };
    const a = summonAstral(h, () => 0.99);
    expect(typeof a).toBe("object");
    expect(h.mats.starshard).toBe(0);
    const before = heroStats(h).power;
    equipAstral(h, (a as { id: string }).id, 0);
    expect(heroStats(h).power).toBeGreaterThan(before);
  });
});

import { invCap, bagRowCost } from "@/game/data";
describe("bag expansion", () => {
  it("each row adds 8 slots and doubles in cost", () => {
    expect(invCap({})).toBe(40);
    expect(invCap({ bagRows: 2 })).toBe(56);
    expect(bagRowCost({})).toBe(5000);
    expect(bagRowCost({ bagRows: 1 })).toBe(10000);
  });
});

describe("forge salvaging", () => {
  it("breaks bagged gear into materials and returns socketed gems to the pouch", () => {
    const h = newHero("T", "warrior");
    const it = makeItem("warrior", 40, 4, "weapon");
    it.gems = ["ruby:2", null];
    h.inventory = [it];
    h.gems = {};
    const y = scrapYield(it);
    expect(Number(y.ore)).toBeGreaterThan(0);
    expect(scrapItem(h, it.id)).toBeNull();
    expect(h.inventory).toHaveLength(0);
    expect(h.mats?.ore).toBe(y.ore);
    expect(h.gems["ruby:2"]).toBe(1);
  });
  it("never salvages worn gear and gives nothing for an unknown item", () => {
    const h = newHero("T", "mage");
    const worn = makeItem("mage", 30, 5, "armour");
    h.equipment.armour = worn;
    h.inventory = [];
    expect(scrapItem(h, worn.id)).toMatch(/Equipped gear/);
    expect(h.equipment.armour?.id).toBe(worn.id);
    expect(h.mats?.ore ?? 0).toBe(0);
    expect(scrapItem(h, "nope")).toMatch(/Equipped gear/);
  });
  it("rarer and higher level gear is worth more", () => {
    const common = scrapYield(makeItem("archer", 5, 0, "boots"));
    const mythic = scrapYield(makeItem("archer", 60, 5, "boots"));
    expect(Number(mythic.ore)).toBeGreaterThan(Number(common.ore));
    expect(Number(mythic.bossCore)).toBeGreaterThan(0);
    expect(Number(common.bossCore ?? 0)).toBe(0);
  });
});

describe("materials carried in the bag", () => {
  it("refines spare materials into forge materials", () => {
    const h = newHero("T", "mage"); h.mats = { hide: 3 };
    expect(refine(h, "hide")).toBeNull();
    expect(h.mats.hide).toBe(0); expect(h.mats.fragment).toBe(1);
  });
  it("refuses a refinement the bag cannot pay for", () => {
    const h = newHero("T", "mage"); h.mats = { crystal: 2 };
    expect(refine(h, "crystal")).toBe("Not enough Arcane Crystal");
    expect(h.mats.crystal).toBe(2);
  });
  it("battles drop the spare materials", () => {
    const m = battleMats(30, false, () => 0.5);
    expect(m.hide).toBe(3); expect(m.ore).toBeGreaterThan(0);
  });
});
