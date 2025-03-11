/**
 * This file contains server-side Stripe configuration.
 * It should only be imported in server-side code or API routes.
 */
import Stripe from "stripe";
import { env } from "~/env";

// Use test keys in development, live keys in production
const stripeSecretKey =
  process.env.NODE_ENV === "development"
    ? env.STRIPE_TEST_SECRET_KEY
    : env.STRIPE_SECRET_KEY;

const stripeWebhookSecret =
  process.env.NODE_ENV === "development"
    ? env.STRIPE_TEST_WEBHOOK_SECRET
    : env.STRIPE_WEBHOOK_SECRET;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as const,
});

// Helper function for handling Stripe errors
export function handleStripeError(error: unknown): never {
  console.error("Stripe error:", error);
  if (error instanceof Stripe.errors.StripeError) {
    throw new Error(error.message);
  }
  throw new Error("An error occurred with the payment system");
}

// Export webhook secret for use in webhook handler
export const webhookSecret = stripeWebhookSecret;
