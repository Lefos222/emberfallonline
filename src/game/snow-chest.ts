import type { Hero } from "./data";

/** Hours between two openings of the Christmas snow chest. */
export const SNOW_CHEST_HOURS = 4;
/** Snowballs handed out per opening. */
export const SNOW_CHEST_SNOWBALLS = 3;
/** Gold paid for each snowball redeemed. */
export const SNOWBALL_GOLD = 250;

const COOLDOWN = SNOW_CHEST_HOURS * 3_600_000;

/** Milliseconds until the chest can be opened again (0 = ready). */
export function snowChestWait(h: Hero, now: number): number {
  const last = h.snow?.chestAt;
  if (last === undefined) return 0;
  return Math.max(0, last + COOLDOWN - now);
}

/** Opens the chest; returns snowballs gained or null while it is still sealed. */
export function openSnowChest(h: Hero, now: number): number | null {
  if (snowChestWait(h, now) > 0) return null;
  h.snow = { balls: (h.snow?.balls ?? 0) + SNOW_CHEST_SNOWBALLS, chestAt: now };
  return SNOW_CHEST_SNOWBALLS;
}

/** Trades every snowball for gold; returns gold gained (0 when there are none). */
export function redeemSnowballs(h: Hero): number {
  const balls = h.snow?.balls ?? 0;
  if (balls <= 0) return 0;
  const gold = balls * SNOWBALL_GOLD;
  h.gold += gold;
  h.snow = { ...h.snow, balls: 0 };
  return gold;
}
