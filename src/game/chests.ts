// ============= Chest items and the periodic reward chest =============
// Chests are real items: they sit in the hero's vault until opened, then pay out
// gold, materials or gems. The reward chest refills on a timer so a returning
// player always has something to open.

import { GEMS, GEM_TIER_NAMES, GEM_TYPES, addGem, addMats, type GemType } from "./crafting";
import type { Hero } from "./data";
import { goldGain } from "./gold";

export type ChestKind = "gold" | "gem";

export interface ChestDef {
  id: ChestKind;
  name: string;
  desc: string;
}

export const CHESTS: Record<ChestKind, ChestDef> = {
  gold: {
    id: "gold",
    name: "Gold Chest",
    desc: "A banded coffer of coin and forge stock. Open it for gold and materials.",
  },
  gem: {
    id: "gem",
    name: "Gem Chest",
    desc: "A cursed coffer humming with cut stones. Open it for gems and essence.",
  },
};

export const CHEST_KINDS = Object.keys(CHESTS) as ChestKind[];

type ChestSave = Pick<Hero, "chests">;

/** How many of a chest the hero is carrying. */
export const chestCount = (h: ChestSave, kind: ChestKind) =>
  Math.max(0, Math.floor(h.chests?.[kind] ?? 0));

/** Put chests into the vault (they never overflow the bag). */
export function addChests(h: Hero, kind: ChestKind, n = 1) {
  h.chests = { ...(h.chests ?? {}), [kind]: Math.max(0, chestCount(h, kind) + Math.floor(n)) };
}

/** Every chest the hero owns, with its count, in display order. */
export const ownedChests = (h: ChestSave) =>
  CHEST_KINDS.map((kind) => ({ ...CHESTS[kind], count: chestCount(h, kind) }));

const pickGem = (): GemType => GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];

/** Coin inside one Gold Chest — a few fights' worth, in step with the scarce campaign purse. */
export const goldChestValue = (level: number) => goldGain(600 + level * 45, level);

// ---------- Chests found in battle ----------

/** Chance a won fight leaves a chest behind. Gem chests are the rarer find, but they do turn up. */
export const BATTLE_CHEST_ODDS: Record<ChestKind, number> = { gold: 0.12, gem: 0.08 };

/** Roll the chest a won battle drops, or null when the field stays empty. */
export function rollBattleChest(random: () => number = Math.random): ChestKind | null {
  const roll = random();
  if (roll < BATTLE_CHEST_ODDS.gem) return "gem";
  if (roll < BATTLE_CHEST_ODDS.gem + BATTLE_CHEST_ODDS.gold) return "gold";
  return null;
}

/** Open one chest from the vault. Returns the reward lines shown to the player. */
export function openChest(h: Hero, kind: ChestKind): string[] {
  if (chestCount(h, kind) < 1) throw new Error(`No ${CHESTS[kind].name} in your vault.`);
  addChests(h, kind, -1);
  const lines: string[] = [];
  if (kind === "gold") {
    const gold = goldChestValue(h.level);
    h.gold += gold;
    addMats(h, { ore: 5, fragment: 2 });
    lines.push(`+${gold.toLocaleString("en-GB")} gold`, "5 Ember Ore", "2 Armor Fragments");
  } else {
    const first = pickGem();
    const second = pickGem();
    const tier = h.level >= 40 ? 3 : 2;
    addGem(h, first, tier);
    addGem(h, second, tier);
    addMats(h, { essence: 3, crystal: 1 });
    const gold = goldGain(150);
    h.gold += gold;
    lines.push(
      `${GEM_TIER_NAMES[tier - 1]} ${GEMS[first].name} gem`,
      `${GEM_TIER_NAMES[tier - 1]} ${GEMS[second].name} gem`,
      "3 Soul Essence",
      "1 Arcane Crystal",
      `+${gold} gold`,
    );
  }
  return lines;
}

// ---------- Periodic reward chest ----------

/** How long a free reward chest takes to refill. */
export const REWARD_CHEST_HOURS = 4;
const REWARD_CHEST_MS = REWARD_CHEST_HOURS * 3_600_000;

type RewardChestSave = Pick<Hero, "rewardChest">;

/** When the next free reward chest appears. A hero who never claimed one is ready at once. */
export const nextRewardChestAt = (h: RewardChestSave) =>
  (h.rewardChest?.last ?? 0) + REWARD_CHEST_MS;

export const rewardChestReady = (h: RewardChestSave, now = Date.now()) =>
  now >= nextRewardChestAt(h);

/** Milliseconds until the next reward chest, or 0 when it is ready. */
export const rewardChestCountdown = (h: RewardChestSave, now = Date.now()) =>
  Math.max(0, nextRewardChestAt(h) - now);

/** "3h 42m" / "42m 10s" — short enough for the reward board. */
export function formatChestCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Collect the free reward chest. It goes to the vault, not straight into gold,
 * so the player chooses when to open it. Every fourth chest is a Gem Chest.
 */
export function claimRewardChest(h: Hero, now = Date.now()): ChestKind {
  if (!rewardChestReady(h, now)) throw new Error("The reward chest is still refilling.");
  const claims = Math.max(0, Math.floor(h.rewardChest?.claims ?? 0)) + 1;
  const kind: ChestKind = claims % 4 === 0 ? "gem" : "gold";
  addChests(h, kind, 1);
  h.rewardChest = { last: now, claims };
  return kind;
}
