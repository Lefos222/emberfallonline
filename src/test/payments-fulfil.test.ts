import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { DIAMOND_PACKS, VIP_PLANS, diamondPackTotal } from "@/game/economy";
import { verifiedCardPurchase } from "@/game/premium-ledger";
import { sessionLockId, verifyStripeSignature } from "@/game/stripe.server";

const SECRET = "whsec_test_123";
const HERO = "0b6f2e4c-6c4f-4b9a-9a54-3f8a2f0f2b71";

const sign = (body: string, secret = SECRET, timestamp = Math.floor(Date.now() / 1000)) =>
  `t=${timestamp},v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;

const diamondSession = (pack = DIAMOND_PACKS[0]!) => ({
  id: "cs_test_diamonds",
  status: "complete",
  payment_status: "paid",
  amount_total: pack.priceCents,
  currency: "usd",
  client_reference_id: "user-1",
  metadata: { userId: "user-1", heroId: HERO, kind: "diamonds", itemId: pack.id },
});

describe("stripe webhook signatures", () => {
  const body = JSON.stringify({ type: "checkout.session.completed" });

  it("accepts a body signed with the endpoint secret", () => {
    expect(verifyStripeSignature(body, sign(body), SECRET).ok).toBe(true);
  });

  it("refuses a body that was changed after signing", () => {
    const header = sign(body);
    const verdict = verifyStripeSignature(`${body} `, header, SECRET);
    expect(verdict.ok).toBe(false);
  });

  it("refuses a signature made with another secret or without the header", () => {
    expect(verifyStripeSignature(body, sign(body, "whsec_other"), SECRET).ok).toBe(false);
    expect(verifyStripeSignature(body, null, SECRET).ok).toBe(false);
  });

  it("refuses a signature older than the tolerance window", () => {
    const old = Math.floor(Date.now() / 1000) - 3_600;
    expect(verifyStripeSignature(body, sign(body, SECRET, old), SECRET).ok).toBe(false);
  });
});

describe("checkout session lock ids", () => {
  it("gives one stable uuid per session and a different one per payment", () => {
    const first = sessionLockId("cs_test_a");
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{2}-[0-9a-f]{12}$/);
    expect(sessionLockId("cs_test_a")).toBe(first);
    expect(sessionLockId("cs_test_b")).not.toBe(first);
  });
});

describe("what a paid session buys", () => {
  it("credits the full Diamond pack, bonus included", () => {
    const pack = DIAMOND_PACKS.find((p) => p.bonus > 0)!;
    const purchase = verifiedCardPurchase(diamondSession(pack));
    expect(purchase.grant).toMatchObject({
      ref: "cs_test_diamonds",
      kind: "diamonds",
      diamonds: diamondPackTotal(pack),
    });
    expect(purchase.heroId).toBe(HERO);
    expect(purchase.userId).toBe("user-1");
  });

  it("credits one month of the VIP tier that was paid for", () => {
    const plan = VIP_PLANS[0]!;
    const purchase = verifiedCardPurchase({
      ...diamondSession(),
      id: "cs_test_vip",
      amount_total: plan.priceCents,
      metadata: { userId: "user-1", heroId: HERO, kind: "vip", itemId: String(plan.level) },
    });
    expect(purchase.grant).toMatchObject({ kind: "vip", vipLevel: plan.level, days: plan.days });
  });

  it("refuses a session that has not been paid", () => {
    expect(() => verifiedCardPurchase({ ...diamondSession(), payment_status: "unpaid" })).toThrow(
      /not completed/i,
    );
    expect(() => verifiedCardPurchase({ ...diamondSession(), status: "open" })).toThrow(
      /not completed/i,
    );
  });

  it("refuses a session that paid less than the catalogue price", () => {
    const pack = DIAMOND_PACKS[0]!;
    expect(() => verifiedCardPurchase({ ...diamondSession(pack), amount_total: 1 })).toThrow(
      /does not cover/i,
    );
  });

  it("refuses an unknown good, an unknown pack and another currency", () => {
    expect(() =>
      verifiedCardPurchase({
        ...diamondSession(),
        metadata: { userId: "user-1", heroId: HERO, kind: "gold", itemId: "vault" },
      }),
    ).toThrow(/unknown purchase/i);
    expect(() =>
      verifiedCardPurchase({
        ...diamondSession(),
        metadata: { userId: "user-1", heroId: HERO, kind: "diamonds", itemId: "vault" },
      }),
    ).toThrow(/unknown diamond pack/i);
    expect(() => verifiedCardPurchase({ ...diamondSession(), currency: "eur" })).toThrow(
      /currency/i,
    );
  });

  it("refuses a payment with no account or character attached", () => {
    expect(() =>
      verifiedCardPurchase({
        ...diamondSession(),
        client_reference_id: null,
        metadata: { heroId: HERO, kind: "diamonds", itemId: DIAMOND_PACKS[0]!.id },
      }),
    ).toThrow(/account/i);
    expect(() =>
      verifiedCardPurchase({
        ...diamondSession(),
        metadata: { userId: "user-1", kind: "diamonds", itemId: DIAMOND_PACKS[0]!.id },
      }),
    ).toThrow(/character/i);
  });
});
