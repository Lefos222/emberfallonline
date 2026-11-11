import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Stripe plumbing that must stay on the server.
 *
 *  `verifyStripeSignature` is the only thing standing between the public webhook URL and a forged
 *  "payment completed" event, so it follows Stripe's scheme exactly: the endpoint's signing secret
 *  signs `${timestamp}.${rawBody}` and every `v1` signature is compared in constant time. */

export interface SignatureVerdict {
  ok: boolean;
  reason?: string;
}

/** Check a `Stripe-Signature` header against the raw request body. */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
  now = Date.now(),
): SignatureVerdict {
  if (!secret) return { ok: false, reason: "The webhook signing secret is missing." };
  if (!header) return { ok: false, reason: "The Stripe-Signature header is missing." };
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = Number(parts.find((part) => part.startsWith("t="))?.slice(2));
  if (!Number.isFinite(timestamp)) return { ok: false, reason: "The signature timestamp is missing." };
  if (Math.abs(now / 1000 - timestamp) > toleranceSeconds)
    return { ok: false, reason: "The signature is outside the allowed time window." };
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest();
  const given = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!given.length) return { ok: false, reason: "The v1 signature is missing." };
  const matches = given.some((signature) => {
    const bytes = Buffer.from(signature, "hex");
    return bytes.length === expected.length && timingSafeEqual(bytes, expected);
  });
  return matches ? { ok: true } : { ok: false, reason: "The signature does not match." };
}

/** A stable uuid for a Checkout Session, so `purchases.request_id` can claim the credit atomically
 *  no matter whether the webhook, the returning browser or a retry gets there first. */
export function sessionLockId(sessionId: string): string {
  const hash = createHash("sha256").update(`stripe:${sessionId}`).digest("hex");
  const variant = ((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80)
    .toString(16)
    .padStart(2, "0");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${variant}${hash.slice(18, 20)}-${hash.slice(20, 32)}`;
}
