import { isArmor } from "./crafting";
import {
  invCap,
  MAX_LEVEL,
  makeItem,
  rarityCap,
  rollRarity,
  xpToNext,
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

/** Version 1.12: every XP source pays 15% less — one funnel, so no source escapes the cut. */
export const XP_GAIN_SHARE = 0.85;

/** Grant xp & gold; handles level ups up to 80 then endless Ascension (paragon) levels. */
export function grant(h: Hero, xp: number, gold: number): { levels: number } {
  const goldMult = 1 + (statTrainFx(h).goldScale ?? 0) / 100;
  // VIP members earn more gold from every payout that goes through grant(): battles, blitzes,
  // events, activities and the daily boards. Diamonds never pass through here.
  const vipMult = vipGoldMultiplier(vipLevelOf(h));
  h.gold += Math.round(gold * goldMult * vipMult);
  // Every source of XP (battles, blitzes, quests, boards, scrolls, events) is paid through here,
  // so one share applies the global cut without a second XP path.
  h.xp += Math.round(xp * XP_GAIN_SHARE);
  let levels = 0;
  while (h.xp >= xpToNext(h)) {
    h.xp -= xpToNext(h);
    if (h.level < MAX_LEVEL) h.level++;
    else h.paragon++;
    levels++;
    // Every level-up pays one skill point (see talents.totalPoints) and one passive point.
    h.insight = (h.insight ?? 0) + 1;
  }
  if (levels) h.voidCrystals = (h.voidCrystals ?? 0) + levels * CRYSTALS_PER_LEVEL;
  // The quest board survives a level-up: its rewards and targets scale with the new level instead.
  return { levels };
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
  const ilvl = Math.max(1, Math.round(stage * 0.9 + h.level * 0.3));
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
      h.level + Math.floor(h.paragon / 2),
      rollRarity(h.level, h.attrs.agi, 0, h.level),
    ),
  );
}
