import * as z from "zod";

export const subscriptionPriceSchema = z.object({
  active: z.boolean().default(true),
  currency: z.string().default("usd"),
  interval: z.enum(["day", "week", "month", "year"]),
  intervalCount: z.number().min(1).default(1),
  trialPeriodDays: z.number().min(0).optional(),
  type: z.enum(["one_time", "recurring"]),
  unitAmount: z.number().min(0),
});

export const subscriptionProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  image: z.string().url().optional(),
  metadata: z.record(z.string()).optional(),
  prices: z
    .array(subscriptionPriceSchema)
    .min(1, "At least one price is required"),
});

export type SubscriptionPrice = z.infer<typeof subscriptionPriceSchema>;
export type SubscriptionProduct = z.infer<typeof subscriptionProductSchema>;
