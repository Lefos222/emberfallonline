import type { Hero } from "./data";
import { goldGain } from "./gold";

/**
 * The Daily Bonus Chest: a free chest icon next to the player card that grants a random prize
 * (normal rarity) every 30 minutes, available until level 30. Mostly gives gold, with a small
 * chance of materials. Claimed from the HUD chest icon.
 */

/** How long between daily chest claims. */
export const DAILY_CHEST_MS = 30 * 60_000;
/** The chest is available until this level. */
export const DAILY_CHEST_MAX_LEVEL = 30;

type DailyChestSave = Pick<Hero, "dailyChest" | "level">;

/** When the next daily chest is ready. A hero who never claimed is ready at once. */
export const dailyChestReadyAt = (h: DailyChestSave) =>
  (h.dailyChest?.last ?? 0) + DAILY_CHEST_MS;

export const dailyChestReady = (h: DailyChestSave, now = Date.now()) =>
  h.level < DAILY_CHEST_MAX_LEVEL && now >= dailyChestReadyAt(h);

/** Milliseconds until the next daily chest, or 0 when ready. */
export const dailyChestCountdown = (h: DailyChestSave, now = Date.now()) =>
  Math.max(0, dailyChestReadyAt(h) - now);

export function formatDailyChestCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Claim the daily chest. Pays gold (normal rarity) most of the time, with a small chance
 * of materials. Only available below level 30.
 */
export function claimDailyChest(h: Hero, now = Date.now()): string {
  if (h.level >= DAILY_CHEST_MAX_LEVEL) return "The daily chest is only available until level 30.";
  if (!dailyChestReady(h, now)) return "The daily chest is still refilling.";
  const claims = Math.max(0, Math.floor(h.dailyChest?.claims ?? 0)) + 1;
  const lines: string[] = [];
  // 85% gold, 15% materials
  if (Math.random() < 0.85) {
    const gold = goldGain(200 + h.level * 30, h.level);
    h.gold += gold;
    lines.push(`+${gold.toLocaleString("en-GB")} gold`);
  } else {
    const matRoll = Math.random();
    if (matRoll < 0.4) {
      h.mats = { ...(h.mats ?? {}) };
      h.mats.ore = (h.mats.ore ?? 0) + 5 + Math.floor(h.level / 5);
      lines.push(`+${5 + Math.floor(h.level / 5)} Ember Ore`);
    } else if (matRoll < 0.7) {
      h.mats = { ...(h.mats ?? {}) };
      h.mats.fragment = (h.mats.fragment ?? 0) + 2 + Math.floor(h.level / 10);
      lines.push(`+${2 + Math.floor(h.level / 10)} Armor Fragments`);
    } else {
      h.mats = { ...(h.mats ?? {}) };
      h.mats.essence = (h.mats.essence ?? 0) + 1 + Math.floor(h.level / 15);
      lines.push(`+${1 + Math.floor(h.level / 15)} Soul Essence`);
    }
    const bonusGold = goldGain(50 + h.level * 10, h.level);
    h.gold += bonusGold;
    lines.push(`+${bonusGold.toLocaleString("en-GB")} gold`);
  }
  h.dailyChest = { last: now, claims };
  return lines.join(" · ");
}
