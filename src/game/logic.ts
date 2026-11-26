import { isArmor } from "./crafting";
import {
  invCap,
  clampDropLevel,
  makeItem,
  rarityCap,
  rollRarity,
  type Hero,
  type Item,
  type Slot,
} from "./data";
import { statTrainFx } from "./drills";
import { vipGoldMultiplier, vipLevelOf } from "./vip-perks";

/** Void Crystals a hero banks for each level gained — the slow trickle behind advanced training. */
export const CRYSTALS_PER_LEVEL = 2;
/** Void Crystals paid for every boss defeated, so boss hunting keeps feeding advanced training too. */
export const BOSS_CRYSTALS = 1;

/**
 * Grant xp & gold.
 *
 * Levels are earned by fighting: every recorded battle is one step of the 40 that pay the next
 * level (see recordBattle in progress.ts). XP is the lifetime tally the reward screens report,
 * so a quest or a scroll can never skip a level the hero has not fought for.
 */
export function grant(h: Hero, xp: number, gold: number): { levels: number } {
  const goldMult = 1 + (statTrainFx(h).goldScale ?? 0) / 100;
  // VIP members earn more gold from every payout that goes through grant(): battles, blitzes,
  // events, activities and the daily boards. Diamonds never pass through here.
  const vipMult = vipGoldMultiplier(vipLevelOf(h));
  h.gold += Math.round(gold * goldMult * vipMult);
  h.xp += Math.max(0, Math.round(xp));
  return { levels: 0 };
}

export function addLoot(h: Hero, item: Item): boolean {
  // Full bag: never destroy or auto-sell — park it in the persistent overflow chest (claimable in the Armory).
  if (h.inventory.length >= invCap(h)) {
    h.overflow = [item, ...(h.overflow ?? [])];
    return false;
  }
  h.inventory.unshift(item);
  return true;
}

/** Move overflow items into the bag while space remains. Returns how many moved. */
export function claimOverflow(h: Hero): number {
  let n = 0;
  while ((h.overflow?.length ?? 0) > 0 && h.inventory.length < invCap(h)) {
    const item = h.overflow?.shift();
    if (!item) break;
    h.inventory.unshift(item);
    n++;
  }
  return n;
}

export function rollLoot(h: Hero, stage: number, chance: number, minRarity = 0): Item | null {
  const lootBonus = (statTrainFx(h).loot ?? 0) / 100;
  if (Math.random() > chance + lootBonus) return null;
  const ilvl = clampDropLevel(h.level, Math.round(stage * 0.9 + h.level * 0.3));
  return makeDrop(h.cls, ilvl, rollRarity(stage, h.attrs.agi, minRarity, h.level));
}

/** Rarity a guaranteed drop of this minimum may reach, never above the hero's own level gate. */
export const cappedRarity = (minRarity: number, level: number) =>
  Math.min(minRarity, rarityCap(level));

/** Loot-table item: finished Rare+ armor never drops — those rolls become a weapon, ring or amulet instead. */
export function makeDrop(cls: Hero["cls"], ilvl: number, rarity: number, slot?: Slot): Item {
  const it = makeItem(cls, ilvl, rarity, slot);
  if (rarity >= 2 && isArmor(it.slot))
    return makeItem(
      cls,
      ilvl,
      rarity,
      (["weapon", "ring", "talisman"] as Slot[])[Math.floor(Math.random() * 3)],
    );
  return it;
}

/** The Night Market stocks ordinary goods only: its rarity obeys the same level gate as wild drops. */
export function refreshMerchant(h: Hero) {
  h.merchant = Array.from({ length: 6 }, () =>
    makeDrop(
      h.cls,
      clampDropLevel(h.level, h.level + Math.floor(h.paragon / 2)),
      rollRarity(h.level, h.attrs.agi, 0, h.level),
    ),
  );
}
