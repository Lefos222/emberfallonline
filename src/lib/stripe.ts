import { loadStripe, type Stripe } from '@stripe/stripe-js';
const token = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
let promise: Promise<Stripe | null> | null = null;
export function getStripeEnvironment(): 'sandbox' | 'live' {
  if (token?.startsWith('pk_test_')) return 'sandbox';
  if (token?.startsWith('pk_live_')) return 'live';
  throw new Error('Live payments are not open yet. Complete payment setup before accepting real purchases.');
}
export function getStripe() {
  getStripeEnvironment();
  if (!promise) promise = loadStripe(token);
  return promise;
}
