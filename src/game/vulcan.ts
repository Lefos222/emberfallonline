import type { Hero } from "./data";
import { scaledGold } from "./gold";

/**
 * The Vulcan Card: a 80,000-gold shop card that burns for one more Party Spire run on the day it
 * is spent. The Spire's allowance itself is server-owned (`spire_begin` in
 * drizzle/migrations/0049_vulcan_card.sql counts the runs), so the card is only the client's
 * half: the pack it sits in and the purchase. `spire_use_vulcan` takes the card from the save and
 * mints the extra run in the same transaction, so the count can never be spent twice.
 */
export const VULCAN_CARD_GOLD = 80000;

/** Cards waiting in the hero's pack. */
export const vulcanCards = (h: Pick<Hero, "vulcan">) => Math.max(0, Math.floor(h.vulcan ?? 0));

/** Gold one Vulcan Card costs this hero (80,000 at level 1). */
export const vulcanCardPrice = (level = 1) => scaledGold(VULCAN_CARD_GOLD, level);

/** Buy one Vulcan Card into the pack. Returns an error message, or null on success. */
export function buyVulcanCard(h: Hero): string | null {
  const price = vulcanCardPrice(h.level);
  if (h.gold < price) return `Not enough gold — ${price.toLocaleString()} needed`;
  h.gold -= price;
  h.vulcan = vulcanCards(h) + 1;
  return null;
}
