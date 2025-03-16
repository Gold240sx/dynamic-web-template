import { z } from "zod";

export const subscriptionPriceSchema = z
  .object({
    active: z.boolean().default(true),
    currency: z.string().default("usd"),
    interval: z.enum(["month", "year"]),
    type: z.enum(["one_time", "recurring"]),
    unitAmount: z.number().min(0),
    includesTrial: z.boolean().default(false),
    trialLength: z.number().min(1).optional(),
    trialUnit: z.enum(["hour", "day", "week", "month"]).optional(),
    requires_cc: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If includesTrial is true, both trialLength and trialUnit must be provided
      if (data.includesTrial) {
        return data.trialLength !== undefined && data.trialUnit !== undefined;
      }
      return true;
    },
    {
      message: "Trial length and unit are required when trial is enabled",
      path: ["trialLength", "trialUnit"],
    },
  );

export const subscriptionProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().url().optional(),
  active: z.boolean().default(true),
  prices: z
    .array(subscriptionPriceSchema)
    .min(1, "At least one price is required"),
});

export type SubscriptionPrice = z.infer<typeof subscriptionPriceSchema>;
export type SubscriptionProduct = z.infer<typeof subscriptionProductSchema>;
