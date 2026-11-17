/**
 * The real-money (card) checkout switch.
 *
 * Card purchases stay closed until the owner sets CARD_PAYMENTS_ENABLED=1 in the project's
 * environment. Diamond spending is untouched: it is in-game currency, debited by the server,
 * and never touches a payment provider.
 *
 * This module is browser-safe on purpose — no process.env reads here, so the shop can import
 * the same wording and the same rule the server enforces.
 */
export const CARD_PAYMENTS_FLAG = "CARD_PAYMENTS_ENABLED";

/** Only the exact value "1" opens the card checkout; anything else — unset, "0", "true" — keeps it closed. */
export function cardPaymentsEnabledFrom(value: string | undefined | null): boolean {
  return value === "1";
}

/** Shown to the player in the shop and returned by the server when a checkout is refused. */
export const CARD_PAYMENTS_PAUSED_MESSAGE =
  "Card purchases are paused — Diamonds still work.";

/** The label a paused card button carries instead of "Buy with card". */
export const CARD_PAYMENTS_PAUSED_BUTTON = "Card checkout paused";
