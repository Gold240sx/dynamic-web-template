/**
 * This file contains server-side Stripe configuration.
 * It should only be imported in server-side code or API routes.
 */
import Stripe from "stripe";
import { env } from "~/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

// Helper function for handling Stripe errors
export function handleStripeError(error: unknown): never {
  console.error("Stripe error:", error);
  if (error instanceof Stripe.errors.StripeError) {
    throw new Error(error.message);
  }
  throw new Error("An error occurred with the payment system");
}
