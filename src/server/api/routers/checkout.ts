import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { stripe, handleStripeError } from "~/lib/stripe";
import { env } from "~/env";
import { db } from "~/server/db";
import { eq, inArray } from "drizzle-orm";
import { productVariants, shippingEstimates } from "~/server/db/schema";
import { type ProductVariant } from "~/types/store";

const shippingAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
});

const shippingEstimateSchema = z.object({
  variantId: z.string(),
  estimatedDays: z.number(),
});

export const checkoutRouter = createTRPCRouter({
  createSession: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            quantity: z.number(),
            price: z.number(),
            name: z.string(),
            stripeProductId: z.string(),
            isDigital: z.boolean(),
          }),
        ),
        shippingAddress: shippingAddressSchema.optional(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Get all variants for the items
        const variantIds = input.items.map((item) => item.id);
        const variants = await db
          .select({
            id: productVariants.id,
            productId: productVariants.productId,
            name: productVariants.name,
            description: productVariants.description,
            price: productVariants.price,
            stock: productVariants.stock,
            isPhysical: productVariants.isPhysical,
            weight: productVariants.weight,
            length: productVariants.length,
            width: productVariants.width,
            height: productVariants.height,
            requiresShipping: productVariants.requiresShipping,
            flatRateShipping: productVariants.flatRateShipping,
            stripeProductId: productVariants.stripeProductId,
            isLive: productVariants.isLive,
          })
          .from(productVariants)
          .where(inArray(productVariants.id, variantIds));

        if (!variants.length) {
          throw new Error("No variants found for the selected items");
        }

        // Check if any items require shipping
        const requiresShipping = input.items.some((item) => !item.isDigital);

        if (requiresShipping && !input.shippingAddress) {
          throw new Error("Shipping address is required for physical items");
        }

        // Calculate base shipping cost from variants
        const baseShippingCost = variants.reduce(
          (total, variant) => total + (variant.flatRateShipping ?? 0),
          0,
        );

        // Define shipping tiers
        const shippingTiers = [
          {
            name: "Standard Shipping",
            amount: baseShippingCost,
            min_days: 5,
            max_days: 7,
          },
          {
            name: "Express Shipping",
            amount: baseShippingCost + 1000, // $10 more than standard
            min_days: 2,
            max_days: 4,
          },
          {
            name: "Next Day Air",
            amount: baseShippingCost + 2500, // $25 more than standard
            min_days: 1,
            max_days: 1,
          },
        ];

        // Check if any items have a price
        const hasItemsWithPrice = input.items.some((item) => item.price > 0);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          customer_email: input.email,
          billing_address_collection: hasItemsWithPrice ? "required" : "auto",
          shipping_address_collection: requiresShipping
            ? {
                allowed_countries: ["US", "CA"],
              }
            : undefined,
          line_items: input.items.map((item) => ({
            price_data: {
              currency: "usd",
              product: item.stripeProductId,
              unit_amount: Math.round(item.price * 100),
              tax_behavior: "exclusive",
            },
            quantity: item.quantity,
          })),
          shipping_options: requiresShipping
            ? shippingTiers.map((tier) => ({
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: tier.amount,
                    currency: "usd",
                  },
                  display_name: tier.name,
                  tax_behavior: "exclusive",
                  tax_code: "txcd_92010001", // Standard shipping tax code
                  delivery_estimate: {
                    minimum: {
                      unit: "business_day",
                      value: tier.min_days,
                    },
                    maximum: {
                      unit: "business_day",
                      value: tier.max_days,
                    },
                  },
                },
              }))
            : undefined,
          mode: "payment",
          automatic_tax: {
            enabled: true,
          },
          phone_number_collection: {
            enabled: true,
          },
          metadata: {
            requires_shipping: requiresShipping.toString(),
            has_paid_items: hasItemsWithPrice.toString(),
          },
          success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.NEXT_PUBLIC_APP_URL}/shop`,
        });

        if (!session.url) {
          throw new Error("Failed to create checkout session URL");
        }

        return { url: session.url };
      } catch (error) {
        handleStripeError(error);
      }
    }),
});
