import { stripe } from "./client";
import type { SubscriptionProductWithPrices } from "../db/types";
import type Stripe from "stripe";

export async function createStripeProduct(product: {
  name: string;
  description?: string | null;
  image?: string | null;
  metadata?: Record<string, string>;
}) {
  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: product.description ?? undefined,
    images: product.image ? [product.image] : undefined,
    metadata: product.metadata,
  });

  return stripeProduct;
}

export async function updateStripeProduct(
  stripeProductId: string,
  product: {
    name?: string;
    description?: string | null;
    image?: string | null;
    metadata?: Record<string, string>;
    active?: boolean;
  },
) {
  const stripeProduct = await stripe.products.update(stripeProductId, {
    name: product.name,
    description: product.description ?? undefined,
    images: product.image ? [product.image] : undefined,
    metadata: product.metadata,
    active: product.active,
  });

  return stripeProduct;
}

export async function createStripePrice(
  stripeProductId: string,
  price: {
    unitAmount: number;
    currency: string;
    interval: "month" | "year";
    type: "one_time" | "recurring";
    includesTrial?: boolean;
    trialLength?: number;
    trialUnit?: "hour" | "day" | "week" | "month";
    metadata?: Record<string, string>;
  },
) {
  // Convert trial length and unit to days for Stripe
  let trialPeriodDays: number | undefined;
  if (price.includesTrial && price.trialLength && price.trialUnit) {
    switch (price.trialUnit) {
      case "hour":
        trialPeriodDays = Math.ceil(price.trialLength / 24);
        break;
      case "day":
        trialPeriodDays = price.trialLength;
        break;
      case "week":
        trialPeriodDays = price.trialLength * 7;
        break;
      case "month":
        trialPeriodDays = price.trialLength * 30;
        break;
    }
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: price.unitAmount,
    currency: price.currency,
    recurring:
      price.type === "recurring"
        ? {
            interval: price.interval,
            interval_count: 1,
            trial_period_days: trialPeriodDays,
          }
        : undefined,
    metadata: price.metadata,
  });

  return stripePrice;
}

export async function updateStripePrice(
  stripePriceId: string,
  price: {
    active?: boolean;
    metadata?: Record<string, string>;
  },
) {
  const stripePrice = await stripe.prices.update(stripePriceId, {
    active: price.active,
    metadata: price.metadata,
  });

  return stripePrice;
}

export async function archiveStripeProduct(stripeProductId: string) {
  const stripeProduct = await stripe.products.update(stripeProductId, {
    active: false,
  });

  return stripeProduct;
}

export async function archiveStripePrice(stripePriceId: string) {
  const stripePrice = await stripe.prices.update(stripePriceId, {
    active: false,
  });

  return stripePrice;
}
