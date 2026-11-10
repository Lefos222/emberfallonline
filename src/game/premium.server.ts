import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Hero } from "./data";

/** Server-only helpers for paid purchases.
 *
 *  Stripe is deliberately called over its REST API instead of the Node SDK: the game server only
 *  needs three calls (create a Checkout Session, read it back), and no extra dependency ships to
 *  the browser. The service-role Supabase client is used for exactly two things: reading a
 *  character's save and writing it back through the server-only `_write_save` RPC after a payment
 *  has been verified or a Diamond spend validated. */

const STRIPE_API = "https://api.stripe.com/v1";

export interface StripeSession {
  id: string;
  status: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  url?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
}

export function paymentsConfigured(): boolean {
  return Boolean(
    process.env["STRIPE_SECRET_KEY"] &&
    process.env["SUPABASE_URL"] &&
    process.env["SUPABASE_SERVICE_ROLE_KEY"],
  );
}

function requirePayments() {
  if (!process.env["STRIPE_SECRET_KEY"]) {
    throw new Error(
      "Card payments are not open yet — the Stripe secret key is missing. Add it to the app's secrets.",
    );
  }
  if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    throw new Error(
      "Card payments are not open yet — the server cannot credit purchases without the Supabase service role key.",
    );
  }
}

async function stripe(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  requirePayments();
  const response = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env["STRIPE_SECRET_KEY"]}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    [key: string]: unknown;
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "The payment provider refused the request.");
  }
  return body;
}

/** Create a hosted Stripe Checkout Session and return it with its redirect URL. */
export async function createCheckoutSession(
  fields: Record<string, string | number>,
): Promise<StripeSession> {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  return (await stripe("/checkout/sessions", {
    method: "POST",
    body: form.toString(),
  })) as unknown as StripeSession;
}

/** Read a Checkout Session back so the server can verify what was actually paid. */
export async function readCheckoutSession(id: string): Promise<StripeSession> {
  return (await stripe(`/checkout/sessions/${encodeURIComponent(id)}`, {
    method: "GET",
  })) as unknown as StripeSession;
}

export function adminClient(): SupabaseClient {
  requirePayments();
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** A character's save plus its owner, read with the service role. */
export async function readHeroSave(heroId: string): Promise<{ save: Hero; userId: string } | null> {
  const admin = adminClient();
  const { data, error } = await admin
    .from("heroes")
    .select("save,user_id")
    .eq("id", heroId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { save: data.save as unknown as Hero, userId: String(data.user_id) };
}

/** Write a save back through the trigger-safe server RPC. */
export async function writeHeroSave(heroId: string, save: Hero): Promise<void> {
  const admin = adminClient();
  const { error } = await admin.rpc(
    "_write_save" as never,
    { _hero: heroId, _save: save } as never,
  );
  if (error) {
    throw new Error(
      `${error.message} — the server needs EXECUTE on _write_save to credit purchases.`,
    );
  }
}

/** Record a request id once. Returns false when this request was already applied. */
export async function recordRequest(
  requestId: string,
  heroId: string,
  item: string,
  price: number,
): Promise<boolean> {
  const admin = adminClient();
  const { error } = await admin
    .from("purchases")
    .insert({ request_id: requestId, hero_id: heroId, item, price });
  if (!error) return true;
  if (error.code === "23505") return false;
  throw new Error(error.message);
}

export async function forgetRequest(requestId: string): Promise<void> {
  const admin = adminClient();
  await admin.from("purchases").delete().eq("request_id", requestId);
}
