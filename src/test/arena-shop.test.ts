import { describe, expect, it } from "vitest";
import { INVENTORY_CAP, newHero } from "@/game/data";
import {
  ARENA_SHOP, arenaBuyBlocker, arenaMarks, arenaPreview, arenaStock, buyArenaGood, duelMarks,
} from "@/game/arena";

describe("the Blood Arena armory", () => {
  it("stocks unique pieces for every class", () => {
    for (const cls of ["warrior", "mage", "archer"] as const) {
      const stock = arenaStock({ cls });
      expect(stock.length).toBeGreaterThan(0);
      expect(stock.every((g) => g.cls === cls)).toBe(true);
    }
    expect(new Set(ARENA_SHOP.map((g) => g.name)).size).toBe(ARENA_SHOP.length);
  });

  it("is priced in marks alone and pays marks for every duel", () => {
    expect(ARENA_SHOP.every((g) => g.marks >= 1000)).toBe(true);
    expect(duelMarks(true)).toBeGreaterThan(duelMarks(false));
    expect(duelMarks(false)).toBeGreaterThan(0);
  });

  it("charges the marks and hands over the unique piece", () => {
    const h = newHero("Pit", "warrior");
    const good = arenaStock(h)[0];
    h.arenaMarks = good.marks - 1;
    expect(arenaBuyBlocker(h, good, INVENTORY_CAP)).toMatch(/Arena Marks/);
    h.arenaMarks = good.marks + 40;
    const item = buyArenaGood(h, good, INVENTORY_CAP);
    expect(typeof item).not.toBe("string");
    if (typeof item === "string") return;
    expect(item.name).toBe(good.name);
    expect(item.rarity).toBe(5);
    expect(item.ilvl).toBe(good.ilvl);
    expect(item.slot).toBe(good.slot);
    expect(arenaMarks(h)).toBe(40);
    expect(h.inventory[0]).toBe(item);
  });

  it("refuses another class's gear and a full bag without charging", () => {
    const h = newHero("Pit", "mage");
    h.arenaMarks = 50000;
    const knight = ARENA_SHOP.find((g) => g.cls === "warrior")!;
    expect(arenaBuyBlocker(h, knight, INVENTORY_CAP)).toMatch(/class/);
    const own = arenaStock(h)[0];
    while (h.inventory.length < INVENTORY_CAP) h.inventory.push(arenaPreview(own));
    expect(arenaBuyBlocker(h, own, INVENTORY_CAP)).toBe("Bag is full");
    expect(arenaMarks(h)).toBe(50000);
  });
});
