import { createFileRoute } from "@tanstack/react-router";
import { fulfilCheckoutSession } from "@/game/premium-fulfil.server";
import { readCheckoutSession } from "@/game/premium.server";
import { verifyStripeSignature } from "@/game/stripe.server";

/** Stripe's webhook: the credit that does not depend on the player coming back.
 *
 *  The event only says which Checkout Session was paid; the session is read back from Stripe and
 *  credited through the same idempotent path the shop uses, so a retried or replayed event can
 *  never pay twice. */

interface StripeEvent {
  type?: string;
  data?: { object?: { id?: string } };
}

const CREDITED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) {
          return Response.json(
            { error: "The Stripe webhook signing secret is not configured." },
            { status: 503 },
          );
        }
        const raw = await request.text();
        const verdict = verifyStripeSignature(raw, request.headers.get("stripe-signature"), secret);
        if (!verdict.ok) return Response.json({ error: verdict.reason }, { status: 400 });

        let event: StripeEvent;
        try {
          event = JSON.parse(raw) as StripeEvent;
        } catch {
          return Response.json({ error: "The webhook payload is not JSON." }, { status: 400 });
        }
        const sessionId = event.data?.object?.id;
        if (!event.type || !sessionId) return Response.json({ received: true, ignored: true });
        if (!CREDITED_EVENTS.has(event.type))
          return Response.json({ received: true, ignored: true });

        try {
          const session = await readCheckoutSession(sessionId);
          if (session.payment_status !== "paid") {
            // A delayed payment method: `async_payment_succeeded` credits it once it settles.
            return Response.json({ received: true, pending: session.payment_status });
          }
          const result = await fulfilCheckoutSession(session);
          return Response.json({
            received: true,
            credited: result.credited,
            already: result.already,
          });
        } catch (error) {
          // Answering with an error makes Stripe retry, which is what a failed credit needs.
          console.error("[stripe] webhook could not credit", event.type, sessionId, error);
          return Response.json({ error: "The payment could not be credited yet." }, { status: 500 });
        }
      },
    },
  },
});
