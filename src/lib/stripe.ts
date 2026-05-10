import Stripe from 'stripe';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  _stripe = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true
  });
  return _stripe;
}

export function getStripePublishableKey(): string {
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
  }
  return publishableKey;
}

export function getStripePriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error('STRIPE_PRICE_ID is not configured');
  }
  return priceId;
}
