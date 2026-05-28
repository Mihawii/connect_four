import Stripe from "stripe";

export function stripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || process.env.STRIPE_RESTRICTED_KEY?.trim() || undefined;
}

export const isStripeEnabled = Boolean(stripeSecretKey());

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = stripeSecretKey();
  if (!key) return null;
  if (!cached) {
    cached = new Stripe(key, {
      typescript: true,
    });
  }
  return cached;
}
