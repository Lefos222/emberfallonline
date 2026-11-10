import { makeItem, type Hero, type Item, type Slot } from "./data";
import { scaledGold } from "./gold";
import { isArmor, type Mat } from "./crafting";

/**
 * The VIP Black Market: a little better than the open catalogue, never a match for the Forge.
 * Armour stays Uncommon (Rare+ armour is craft-only); weapons and trinkets may be Rare. Stock
 * rolls every six hours and can be restocked for 50 Diamonds through `premium_service`.
 */
export const BM_WINDOW_MS = 6 * 60 * 60 * 1000;
export const bmWindow = (now = Date.now()) => Math.floor(now / BM_WINDOW_MS);
const SLOTS: Slot[] = ["weapon", "helmet", "armour", "ring", "boots", "talisman"] as Slot[];

export interface BmMat { mat: Mat; qty: number; gold: number }

export function rollBlackMarket(h: Hero) {
  const items: Item[] = SLOTS.map((slot) => makeItem(h.cls, h.level + 3, isArmor(slot) ? 1 : Math.random() < 0.5 ? 2 : 1, slot));
  const mats: BmMat[] = [
    { mat: "frostCrystal", qty: 3, gold: scaledGold(12000, h.level) },
    { mat: "voidCrystal", qty: 1, gold: scaledGold(30000, h.level) },
    { mat: "fragment", qty: 15, gold: scaledGold(9000, h.level) },
  ];
  h.blackMarket = { window: bmWindow(), items, mats, sold: [] };
}

export function blackMarketStock(h: Hero) {
  if (!h.blackMarket || h.blackMarket.window !== bmWindow()) rollBlackMarket(h);
  return h.blackMarket!;
}

export const bmItemPrice = (it: Item, level: number) => scaledGold(4000 + it.ilvl * 220 * (it.rarity + 1), level);
