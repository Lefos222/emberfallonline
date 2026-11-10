import { makeItem, type Hero, type Item, type Slot } from "./data";
import { scaledGold } from "./gold";
import { isArmor, type Mat } from "./crafting";

/**
 * The VIP Black Market: a little better than the open catalogue, never a match for the Forge.
 * Armour stays Uncommon (Rare+ armour is craft-only); weapons and trinkets may be Rare. Stock
 * rolls every six hours and can be restocked for 50 Diamonds through `premium_service`.
 *
 * Every roll is a gamble: quantities swing up and down, and there is a 5% chance per roll of a
 * "lucky stock" — one weapon or trinket turns Epic and a Sun Crystal offer appears.
 */
export const BM_LUCKY_CHANCE = 0.05;
const swing = (n: number, rnd: () => number) => Math.max(1, Math.round(n * (0.5 + rnd())));
export const BM_WINDOW_MS = 6 * 60 * 60 * 1000;
export const bmWindow = (now = Date.now()) => Math.floor(now / BM_WINDOW_MS);
const SLOTS: Slot[] = ["weapon", "helmet", "armour", "ring", "boots", "talisman"] as Slot[];

export interface BmMat { mat: Mat; qty: number; gold: number }

export function rollBlackMarket(h: Hero, rnd: () => number = Math.random) {
  const lucky = rnd() < BM_LUCKY_CHANCE;
  const open = SLOTS.filter((s) => !isArmor(s)); // never armour: Rare+ armour is craft-only
  const luckySlot = lucky ? open[Math.floor(rnd() * open.length)] : null;
  const items: Item[] = SLOTS.map((slot) => {
    const rarity = isArmor(slot) ? 1 : slot === luckySlot ? 3 : rnd() < 0.5 ? 2 : 1;
    return makeItem(h.cls, h.level + 3, rarity, slot);
  });
  const mats: BmMat[] = [
    { mat: "frostCrystal", qty: swing(3, rnd), gold: scaledGold(12000, h.level) },
    { mat: "voidCrystal", qty: rnd() < 0.2 ? 2 : 1, gold: scaledGold(30000, h.level) },
    { mat: "fragment", qty: swing(15, rnd), gold: scaledGold(9000, h.level) },
  ];
  if (lucky) mats.push({ mat: "sunCrystal", qty: 1, gold: scaledGold(60000, h.level) });
  h.blackMarket = { window: bmWindow(), items, mats, sold: [], lucky };
}

export function blackMarketStock(h: Hero) {
  if (!h.blackMarket || h.blackMarket.window !== bmWindow()) rollBlackMarket(h);
  return h.blackMarket!;
}

export const bmItemPrice = (it: Item, level: number) => scaledGold(4000 + it.ilvl * 220 * (it.rarity + 1), level);
