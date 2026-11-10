import type { ChestKind } from "./chests";
import type { GemType } from "./crafting";
import type { DiamondMat } from "./economy";
import { confirmCheckout, spendDiamonds, startCheckout } from "./payments.functions";
import { requestKey, returnedSave } from "./services-contract";
import { adoptServerSave, getState, withServerHero } from "./store";

/** Client wrappers around the server-owned premium wallet.
 *
 *  Nothing here decides a price or credits anything: the server reads the catalogue, verifies the
 *  Stripe session or the Diamond balance, and returns the new save, which the client adopts. */

const heroId = () => {
  const id = getState().heroId;
  if (!id) throw new Error("Select a character first.");
  return id;
};

const message = (error: unknown) =>
  error instanceof Error ? error.message : "The purchase could not be completed.";

/** Pending Stripe sessions, so a closed tab can still be reconciled when the player returns. */
const PENDING = "ef-stripe-pending";
interface PendingSession {
  id: string;
  at: number;
}

function readPending(): PendingSession[] {
  try {
    const raw = window.localStorage.getItem(PENDING);
    const list = raw ? (JSON.parse(raw) as PendingSession[]) : [];
    return Array.isArray(list) ? list.filter((p) => p && typeof p.id === "string") : [];
  } catch {
    return [];
  }
}

function writePending(list: PendingSession[]) {
  try {
    window.localStorage.setItem(PENDING, JSON.stringify(list.slice(-10)));
  } catch {
    /* storage disabled */
  }
}

function rememberSession(id: string) {
  writePending([...readPending().filter((p) => p.id !== id), { id, at: Date.now() }]);
}

function forgetSession(id: string) {
  writePending(readPending().filter((p) => p.id !== id));
}

async function spend(
  kind: "material" | "gem" | "chest" | "gold" | "vip" | "item",
  itemId: string,
  qty?: number,
): Promise<void> {
  const id = heroId();
  const op = `shop:${kind}:${itemId}:${qty ?? 1}`;
  const req = requestKey(localStorage, id, op, () => crypto.randomUUID());
  await withServerHero(async () => {
    const result = await spendDiamonds({
      data: { kind, itemId, qty, requestId: req, heroId: id },
    });
    adoptServerSave(id, returnedSave(result));
  });
  localStorage.removeItem(`ef-pending:${id}:${op}`);
}

/** Confirm one Stripe session and adopt the credited save. */
export async function confirmCardPurchase(sessionId: string) {
  const id = heroId();
  const result = await withServerHero(async () => {
    const value = await confirmCheckout({ data: { sessionId } });
    adoptServerSave(id, returnedSave(value));
    return value;
  });
  forgetSession(sessionId);
  return result;
}

/** Re-check every pending session (the player may have closed the tab before returning). */
export async function reconcilePendingPurchases(): Promise<number> {
  let credited = 0;
  for (const pending of readPending()) {
    if (Date.now() - pending.at > 24 * 3_600_000) {
      forgetSession(pending.id);
      continue;
    }
    try {
      const result = await confirmCardPurchase(pending.id);
      if (result && !result.already) credited += 1;
    } catch {
      /* still unpaid or unreachable — keep it for the next visit */
    }
  }
  return credited;
}

async function startCard(kind: "diamonds" | "vip", itemId: string): Promise<string | null> {
  try {
    const session = await startCheckout({ data: { kind, itemId, heroId: heroId() } });
    rememberSession(session.sessionId);
    // A hosted Checkout page cannot be framed, so open it as its own page/tab.
    const opened = window.open(session.url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.assign(session.url);
    return null;
  } catch (error) {
    return message(error);
  }
}

/** Buy a Diamond pack with a card (Stripe Checkout, server-verified). */
export const buyDiamondPack = (id: string) => startCard("diamonds", id);
/** Buy one month of VIP with a card. */
export const buyVipWithCard = (level: number) => startCard("vip", String(level));

export const buyGoldPack = (id: string): Promise<string | null> =>
  spend("gold", id).then(() => null, message);
export const buyMaterial = (mat: DiamondMat, quantity = 1): Promise<string | null> =>
  spend("material", mat, quantity).then(() => null, message);
export const buyGem = (type: GemType, tier: number): Promise<string | null> =>
  spend("gem", `${type}:${tier}`).then(() => null, message);
export const buyChest = (kind: ChestKind): Promise<string | null> =>
  spend("chest", kind).then(() => null, message);
/** One month of VIP paid with Diamonds instead of a card. */
export const buyVip = (level: number): Promise<string | null> =>
  spend("vip", String(level)).then(() => null, message);
export const buyDiamondItem = (id: string): Promise<string | null> =>
  spend("item", id).then(() => null, message);
