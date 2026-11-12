import { describe, expect, it } from "vitest";
import { buyVulcanCard, VULCAN_CARD_GOLD, vulcanCardPrice, vulcanCards } from "@/game/vulcan";
import { makeItem, newHero } from "@/game/data";
import { gemRemoveCost, insertGem, removeGem } from "@/game/crafting";
import { scaledGold } from "@/game/gold";

/**
 * The Vulcan Card (one extra Spire run a day) and the smith's fee for prising a socketed gem back
 * out. Both are gold sinks, so their prices go through `scaledGold` like every other gold price.
 */

const hero = () => {
  const h = newHero("Vulcanist", "warrior");
  h.level = 1;
  h.gold = 1_000_000;
  return h;
};

describe("the Vulcan Card", () => {
  it("costs 80,000 gold at level 1 and lands in the pack", () => {
    const h = hero();
    expect(vulcanCardPrice(1)).toBe(VULCAN_CARD_GOLD);
    expect(vulcanCardPrice(1)).toBe(80_000);
    expect(vulcanCards(h)).toBe(0);
    expect(buyVulcanCard(h)).toBeNull();
    expect(vulcanCards(h)).toBe(1);
    expect(h.gold).toBe(1_000_000 - 80_000);
  });

  it("scales with the hero's level and refuses a purse that cannot pay", () => {
    const h = hero();
    h.level = 20;
    expect(vulcanCardPrice(20)).toBe(scaledGold(VULCAN_CARD_GOLD, 20));
    h.gold = 10;
    expect(buyVulcanCard(h)).toMatch(/not enough gold/i);
    expect(vulcanCards(h)).toBe(0);
    expect(h.gold).toBe(10);
  });
});

describe("prising a gem out of armour", () => {
  it("charges gold, returns the gem to the pouch and scales with the gem's level", () => {
    const h = hero();
    const piece = makeItem("warrior", 10, 3, "armour");
    h.inventory.push(piece);
    h.gems = { "ruby:1": 2 };
    expect(insertGem(h, piece.id, 0, "ruby:1")).toBeNull();

    const fee = gemRemoveCost("ruby:1", h.level);
    const gold = h.gold;
    expect(fee).toBeGreaterThan(0);
    expect(removeGem(h, piece.id, 0)).toBeNull();
    expect(h.gold).toBe(gold - fee);
    expect(h.gems["ruby:1"]).toBe(2);
    // A higher gem costs the smith more.
    expect(gemRemoveCost("ruby:5", 1)).toBeGreaterThan(gemRemoveCost("ruby:1", 1));
  });

  it("keeps the gem socketed when the purse cannot pay the smith", () => {
    const h = hero();
    const piece = makeItem("warrior", 10, 3, "armour");
    h.inventory.push(piece);
    h.gems = { "ruby:3": 1 };
    expect(insertGem(h, piece.id, 0, "ruby:3")).toBeNull();
    h.gold = 0;
    expect(removeGem(h, piece.id, 0)).toMatch(/gold/i);
    expect(piece.gems?.[0]).toBe("ruby:3");
    expect(h.gems["ruby:3"]).toBe(0);
  });
});
