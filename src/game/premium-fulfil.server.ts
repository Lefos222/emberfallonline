import type { Hero } from "./data";
import {
  applyCardPurchase,
  cardPurchaseApplied,
  verifiedCardPurchase,
  type PaidSession,
} from "./premium-ledger";
import { forgetRequest, readHeroSave, recordRequest, writeHeroSave } from "./premium.server";
import { sessionLockId } from "./stripe.server";

/** Credit one paid Stripe Checkout Session to the character it was bought for.
 *
 *  The returning browser, the Stripe webhook and a later "restore purchases" all funnel through
 *  here, so the same session can never be credited twice: the session id is claimed in `purchases`
 *  first (unique on `request_id`), then the wallet is written from a save read after the claim. */

export interface FulfilResult {
  save: Hero;
  heroId: string;
  /** True when this call actually added the goods. */
  credited: boolean;
  /** True when the session had already been credited. */
  already: boolean;
}

export async function fulfilCheckoutSession(session: PaidSession): Promise<FulfilResult> {
  const purchase = verifiedCardPurchase(session);
  const row = await readHeroSave(purchase.heroId);
  if (!row) throw new Error("That character no longer exists.");
  if (row.userId !== purchase.userId) throw new Error("This payment belongs to another account.");

  if (cardPurchaseApplied(row.save, session.id)) {
    return { save: row.save, heroId: purchase.heroId, credited: false, already: true };
  }

  const claim = sessionLockId(session.id);
  const claimed = await recordRequest(
    claim,
    purchase.heroId,
    `card:${purchase.grant.kind}:${purchase.itemId}`,
    purchase.amountTotal,
  );
  if (!claimed) {
    const current = await readHeroSave(purchase.heroId);
    if (current && cardPurchaseApplied(current.save, session.id)) {
      return { save: current.save, heroId: purchase.heroId, credited: false, already: true };
    }
    // Another request holds the claim but has not written the credit yet. Say so instead of
    // reporting an empty wallet as a completed purchase; the caller retries.
    throw new Error("This payment is still being credited. Try again in a moment.");
  }

  // Re-read after claiming: another server reward may have landed while this payment was in flight.
  const fresh = (await readHeroSave(purchase.heroId)) ?? row;
  const next = applyCardPurchase(fresh.save, purchase.grant);
  try {
    await writeHeroSave(purchase.heroId, next);
  } catch (error) {
    await forgetRequest(claim);
    throw error;
  }
  return { save: next, heroId: purchase.heroId, credited: true, already: false };
}
