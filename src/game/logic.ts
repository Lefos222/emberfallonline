import { isArmor } from "./crafting";
import {
  invCap, MAX_LEVEL, makeItem, rollRarity, xpToNext, type Hero, type Item, type Slot,
} from "./data";

/** Grant xp & gold; handles level ups up to 80 then endless Ascension (paragon) levels. */
export function grant(h: Hero, xp: number, gold: number): { levels: number } {
  h.gold += gold;
  h.xp += xp;
  let levels = 0;
  while (h.xp >= xpToNext(h)) {
    h.xp -= xpToNext(h);
    if (h.level < MAX_LEVEL) h.level++;
    else h.paragon++;
    levels++;
  }
  return { levels };
}

export function addLoot(h: Hero, item: Item): boolean {
  // Full bag: never destroy or auto-sell — park it in the persistent overflow chest (claimable in the Armory).
  if (h.inventory.length >= invCap(h)) { h.overflow = [item, ...(h.overflow ?? [])]; return false; }
  h.inventory.unshift(item);
  return true;
}

/** Move overflow items into the bag while space remains. Returns how many moved. */
export function claimOverflow(h: Hero): number {
  let n = 0;
  while ((h.overflow?.length ?? 0) > 0 && h.inventory.length < invCap(h)) {
    const item = h.overflow?.shift();
    if (!item) break;
    h.inventory.unshift(item); n++;
  }
  return n;
}

export function rollLoot(h: Hero, stage: number, chance: number, minRarity = 0): Item | null {
  if (Math.random() > chance) return null;
  const ilvl = Math.max(1, Math.round(stage * 0.9 + h.level * 0.3));
  return makeDrop(h.cls, ilvl, rollRarity(stage, h.attrs.agi, minRarity));
}

/** Loot-table item: finished Rare+ armor never drops — those rolls become a weapon, ring or amulet instead. */
export function makeDrop(cls: Hero["cls"], ilvl: number, rarity: number, slot?: Slot): Item {
  const it = makeItem(cls, ilvl, rarity, slot);
  if (rarity >= 2 && isArmor(it.slot)) return makeItem(cls, ilvl, rarity, (["weapon", "ring", "talisman"] as Slot[])[Math.floor(Math.random() * 3)]);
  return it;
}

export function refreshMerchant(h: Hero) {
  h.merchant = Array.from({ length: 6 }, () =>
    makeDrop(h.cls, h.level + Math.floor(h.paragon / 2), rollRarity(h.level, h.attrs.agi)),
  );
}
