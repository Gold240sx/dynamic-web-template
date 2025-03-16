import Stripe from "stripe";
import { env } from "~/env";

const stripeSecretKey =
  process.env.NODE_ENV === "development"
    ? env.STRIPE_TEST_SECRET_KEY
    : env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});
