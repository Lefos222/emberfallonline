import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import z from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Hero } from "./data";
import { DIAMOND_PACKS, VIP_PLANS, diamondPackTotal } from "./economy";
import { applyCardPurchase, applyDiamondSpend, cardPurchaseApplied } from "./premium-ledger";
import {
  createCheckoutSession,
  forgetRequest,
  paymentsConfigured,
  readCheckoutSession,
  readHeroSave,
  recordRequest,
  writeHeroSave,
} from "./premium.server";

/** Every paid path lives here, on the server:
 *
 *  - `startCheckout` builds a Stripe Checkout Session from the catalogue price. The client never
 *    sends a price, only which pack or membership it wants.
 *  - `confirmCheckout` reads the session back from Stripe, checks it is paid and belongs to the
 *    signed-in player's character, then credits the wallet once per session id.
 *  - `spendDiamonds` validates a Diamond purchase (materials, stones, chests, gold, VIP months)
 *    against the same catalogue before debiting the server-owned balance. */

const origin = (): string => {
  const request = getRequest();
  const fromHeader = request?.headers.get("origin");
  if (fromHeader) return fromHeader.replace(/\/$/, "");
  const host =
    request?.headers.get("x-forwarded-host") ?? request?.headers.get("host") ?? "localhost:3000";
  const proto =
    request?.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
};

export const paymentStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({ configured: paymentsConfigured() }));

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        kind: z.enum(["diamonds", "vip"]),
        itemId: z.string().min(1).max(40),
        heroId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // The character must belong to the caller; RLS answers that for the authenticated client.
    const { data: hero, error } = await context.supabase
      .from("heroes")
      .select("id")
      .eq("id", data.heroId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!hero) throw new Error("Select a character before buying anything.");

    let cents = 0;
    let name = "";
    if (data.kind === "diamonds") {
      const pack = DIAMOND_PACKS.find((p) => p.id === data.itemId);
      if (!pack) throw new Error("Unknown Diamond pack.");
      cents = pack.priceCents;
      name = `${pack.name} — ${diamondPackTotal(pack).toLocaleString()} Diamonds`;
    } else {
      const plan = VIP_PLANS.find((p) => String(p.level) === data.itemId);
      if (!plan) throw new Error("Unknown VIP membership.");
      cents = plan.priceCents;
      name = `VIP ${plan.level} — ${plan.name} (${plan.days} days)`;
    }

    const session = await createCheckoutSession({
      mode: "payment",
      "payment_method_types[0]": "card",
      success_url: `${origin()}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin()}/?checkout=cancelled`,
      client_reference_id: context.userId,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": cents,
      "line_items[0][price_data][product_data][name]": name,
      "metadata[userId]": context.userId,
      "metadata[heroId]": data.heroId,
      "metadata[kind]": data.kind,
      "metadata[itemId]": data.itemId,
    });

    if (!session.url) throw new Error("The payment provider did not return a checkout page.");
    return { url: session.url, sessionId: session.id };
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ sessionId: z.string().min(4).max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const session = await readCheckoutSession(data.sessionId);
    const meta = session.metadata ?? {};
    if (meta["userId"] !== context.userId)
      throw new Error("This payment belongs to another account.");
    if (session.payment_status !== "paid" || session.status !== "complete") {
      throw new Error("The payment has not completed yet. Finish it and try again.");
    }
    const heroId = meta["heroId"];
    if (!heroId) throw new Error("This payment is missing its character.");

    const row = await readHeroSave(heroId);
    if (!row) throw new Error("That character no longer exists.");
    if (row.userId !== context.userId) throw new Error("This payment belongs to another account.");

    if (cardPurchaseApplied(row.save, session.id)) return { save: row.save, already: true };

    let next: Hero;
    if (meta["kind"] === "vip") {
      const plan = VIP_PLANS.find((p) => String(p.level) === meta["itemId"]);
      if (!plan) throw new Error("Unknown VIP membership in this payment.");
      if (session.amount_total !== null && session.amount_total < plan.priceCents) {
        throw new Error("This payment does not cover the membership.");
      }
      next = applyCardPurchase(row.save, {
        ref: session.id,
        kind: "vip",
        vipLevel: plan.level,
        days: plan.days,
      });
    } else if (meta["kind"] === "diamonds") {
      const pack = DIAMOND_PACKS.find((p) => p.id === meta["itemId"]);
      if (!pack) throw new Error("Unknown Diamond pack in this payment.");
      if (session.amount_total !== null && session.amount_total < pack.priceCents) {
        throw new Error("This payment does not cover the pack.");
      }
      next = applyCardPurchase(row.save, {
        ref: session.id,
        kind: "diamonds",
        diamonds: diamondPackTotal(pack),
      });
    } else {
      throw new Error("Unknown purchase in this payment.");
    }

    await writeHeroSave(heroId, next);
    return { save: next, already: false };
  });

export const spendDiamonds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        kind: z.enum(["material", "gem", "chest", "gold", "vip", "item"]),
        itemId: z.string().min(1).max(60),
        qty: z.number().int().min(1).max(999).optional(),
        requestId: z.string().uuid(),
        heroId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("heroes")
      .select("save")
      .eq("id", data.heroId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.save) throw new Error("Select a character before buying anything.");

    const save = row.save as unknown as Hero;
    const next = applyDiamondSpend(
      save,
      { kind: data.kind, itemId: data.itemId, qty: data.qty },
      data.requestId,
    );
    const price = Math.max(
      0,
      (save.srv?.premium?.balance ?? 0) - (next.srv?.premium?.balance ?? 0),
    );

    // Record the request before writing: a duplicate id means this exact spend already landed.
    const fresh = await recordRequest(
      data.requestId,
      data.heroId,
      `${data.kind}:${data.itemId}${data.qty ? `:${data.qty}` : ""}`,
      price,
    );
    if (!fresh) {
      const current = await readHeroSave(data.heroId);
      return { save: current?.save ?? save, already: true };
    }
    try {
      await writeHeroSave(data.heroId, next);
    } catch (writeError) {
      await forgetRequest(data.requestId);
      throw writeError;
    }
    return { save: next, already: false };
  });
