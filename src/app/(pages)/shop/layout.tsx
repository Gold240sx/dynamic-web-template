"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Initialize Stripe outside of component to avoid recreation
const stripePromise = loadStripe(
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY!
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
