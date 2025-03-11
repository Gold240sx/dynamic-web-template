import type { InferModel } from "drizzle-orm";
import type {
  subscriptionProducts,
  subscriptionPrices,
  subscriptions,
  users,
} from "./schema";

export type SubscriptionProduct = InferModel<typeof subscriptionProducts>;
export type SubscriptionPrice = InferModel<typeof subscriptionPrices>;
export type Subscription = InferModel<typeof subscriptions>;
export type User = InferModel<typeof users>;

export type SubscriptionProductWithPrices = SubscriptionProduct & {
  prices: SubscriptionPrice[];
};

export type SubscriptionPriceWithProduct = SubscriptionPrice & {
  product: SubscriptionProduct | null;
};

export type SubscriptionWithPrice = Subscription & {
  price: SubscriptionPriceWithProduct | null;
};
