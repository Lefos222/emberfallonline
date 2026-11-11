import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Hero } from "./data";
import { DIAMOND_PACKS, VIP_PLANS, diamondPackTotal } from "./economy";
import { applyDiamondSpend } from "./premium-ledger";
import { fulfilCheckoutSession } from "./premium-fulfil.server";
import {
  createCheckoutSession,
  forgetRequest,
  listRecentCheckoutSessions,
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
      success_url: `${origin()}/play?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin()}/play?checkout=cancelled`,
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
    const owner = session.metadata?.["userId"] ?? session.client_reference_id;
    if (owner !== context.userId) throw new Error("This payment belongs to another account.");
    // Crediting is idempotent per session id, so a webhook that already paid this out is reused.
    const result = await fulfilCheckoutSession(session);
    return { save: result.save, already: result.already };
  });

/** Credit every paid Checkout Session this account has not received yet.
 *
 *  Covers the payments a webhook may not have reached and the ones finished on another device:
 *  the sessions are read back from Stripe, not trusted from the browser. */
export const reclaimPurchases = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ heroId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: hero, error } = await context.supabase
      .from("heroes")
      .select("id")
      .eq("id", data.heroId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!hero) throw new Error("Select a character before buying anything.");

    const sessions = await listRecentCheckoutSessions(context.userId);
    let credited = 0;
    let settled = 0;
    let failure: unknown = null;
    let save: Hero | null = null;
    for (const session of sessions) {
      try {
        const result = await fulfilCheckoutSession(session);
        settled += 1;
        if (!result.credited) continue;
        credited += 1;
        if (result.heroId === data.heroId) save = result.save;
      } catch (sessionError) {
        // Not paid yet, already credited elsewhere or not this account's: the next check retries.
        failure ??= sessionError;
      }
    }
    if (settled === 0 && failure) {
      throw failure instanceof Error ? failure : new Error("Your purchases could not be checked.");
    }
    return { credited, save };
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
