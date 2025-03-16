import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { subscriptionProducts, subscriptionPrices } from "~/server/db/schema";
import { eq, desc, asc, and, notInArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createStripePrice,
  createStripeProduct,
  updateStripePrice,
  updateStripeProduct,
  archiveStripePrice,
  archiveStripeProduct,
} from "~/server/stripe/subscription";
import {
  hasUsedTrial,
  startTrial,
  endTrial,
  getTrialStatus,
} from "./subscription/trial-utils";
import { addDays, addHours, addMonths, addWeeks } from "date-fns";

const priceSchema = z.object({
  active: z.boolean().default(true),
  currency: z.string().default("usd"),
  interval: z.enum(["month", "year"]),
  type: z.enum(["one_time", "recurring"]),
  unitAmount: z.number(),
  includesTrial: z.boolean().default(false),
  trialLength: z.number().optional(),
  trialUnit: z.enum(["hour", "day", "week", "month"]).optional(),
  requires_cc: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().default(true),
  image: z.string().url().optional(),
  metadata: z.record(z.string()).nullable().optional(),
  prices: z.array(priceSchema),
});

function calculateTrialEndDate(length: number, unit: string): Date {
  const now = new Date();
  switch (unit) {
    case "hour":
      return addHours(now, length);
    case "day":
      return addDays(now, length);
    case "week":
      return addWeeks(now, length);
    case "month":
      return addMonths(now, length);
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid trial unit",
      });
  }
}

export const subscriptionRouter = createTRPCRouter({
  getAllProducts: publicProcedure.query(async ({ ctx }) => {
    try {
      console.log("Fetching subscription products...");
      const products = await ctx.db.query.subscriptionProducts.findMany({
        where: (products) => eq(products.active, true),
        with: {
          prices: {
            where: (prices) => eq(prices.active, true),
            orderBy: (prices, { asc }) => [asc(prices.unitAmount)],
          },
        },
        orderBy: (products, { asc }) => [asc(products.name)],
      });

      console.log("Found products:", JSON.stringify(products, null, 2));
      if (!products || products.length === 0) {
        console.log("No products found, returning empty array");
        return [];
      }

      console.log(
        "Returning sorted products:",
        JSON.stringify(products, null, 2),
      );

      return products;
    } catch (error) {
      console.error("Error fetching subscription products:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch subscription products",
        cause: error,
      });
    }
  }),

  getProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.subscriptionProducts.findFirst({
        where: eq(subscriptionProducts.id, input.id),
        with: {
          prices: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return {
        ...product,
        prices: [...product.prices].sort((a, b) => a.unitAmount - b.unitAmount),
      };
    }),

  createProduct: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        metadata: z.record(z.string()).optional(),
        stripeProductId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const stripeProductId =
        input.stripeProductId ?? (await createStripeProduct(input)).id;

      const [product] = await ctx.db
        .insert(subscriptionProducts)
        .values({
          name: input.name,
          description: input.description,
          image: input.image,
          metadata: input.metadata,
          stripeProductId,
        })
        .returning();

      return product;
    }),

  updateProduct: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
        metadata: z.record(z.string()).optional(),
        active: z.boolean().optional(),
        prices: z.array(priceSchema).optional(),
        stripeProductId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.subscriptionProducts.findFirst({
        where: eq(subscriptionProducts.id, input.id),
        with: {
          prices: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // First, update the product details
      const [updatedProduct] = await ctx.db
        .update(subscriptionProducts)
        .set({
          name: input.name ?? product.name,
          description: input.description ?? product.description,
          image: input.image ?? product.image,
          metadata: input.metadata ?? product.metadata,
          active: input.active ?? product.active,
          stripeProductId: input.stripeProductId ?? product.stripeProductId,
        })
        .where(eq(subscriptionProducts.id, input.id))
        .returning();

      // If prices are provided, update them
      if (input.prices) {
        // Get existing prices
        const existingPrices = await ctx.db.query.subscriptionPrices.findMany({
          where: eq(subscriptionPrices.productId, input.id),
        });

        for (const price of input.prices) {
          const existingPrice = existingPrices.find(
            (ep) =>
              ep.interval === price.interval &&
              ep.type === price.type &&
              ep.currency === price.currency,
          );

          if (existingPrice) {
            // Update existing price
            await ctx.db
              .update(subscriptionPrices)
              .set({
                active: price.active,
                unitAmount: price.unitAmount,
                includesTrial: price.includesTrial,
                trialLength: price.trialLength,
                trialUnit: price.trialUnit,
                requires_cc: price.requires_cc,
              })
              .where(eq(subscriptionPrices.id, existingPrice.id));
          } else {
            // Create new price only if it doesn't exist
            await ctx.db.insert(subscriptionPrices).values({
              productId: input.id,
              active: price.active,
              currency: price.currency,
              interval: price.interval,
              type: price.type,
              unitAmount: price.unitAmount,
              includesTrial: price.includesTrial,
              trialLength: price.trialLength,
              trialUnit: price.trialUnit,
              requires_cc: price.requires_cc,
            });
          }
        }

        // Deactivate prices that are no longer in use
        const prices = input.prices ?? [];
        if (prices.length > 0) {
          const pricesToKeep = existingPrices
            .filter((ep) =>
              prices.some(
                (ip) =>
                  ip.interval === ep.interval &&
                  ip.type === ep.type &&
                  ip.currency === ep.currency,
              ),
            )
            .map((ep) => ep.id);

          await ctx.db
            .update(subscriptionPrices)
            .set({ active: false })
            .where(
              and(
                eq(subscriptionPrices.productId, input.id),
                sql`${subscriptionPrices.id} NOT IN ${sql.join(pricesToKeep)}`,
              ),
            );
        }
      }

      // Return the updated product with its new prices
      return await ctx.db.query.subscriptionProducts.findFirst({
        where: eq(subscriptionProducts.id, input.id),
        with: {
          prices: {
            where: (prices) => eq(prices.active, true),
          },
        },
      });
    }),

  createPrice: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        unitAmount: z.number(),
        currency: z.string().default("usd"),
        interval: z.enum(["month", "year"]),
        type: z.enum(["one_time", "recurring"]),
        includesTrial: z.boolean().default(false),
        trialLength: z.number().optional(),
        trialUnit: z.enum(["hour", "day", "week", "month"]).optional(),
        requires_cc: z.boolean().default(true),
        metadata: z.record(z.string()).optional(),
        stripePriceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.subscriptionProducts.findFirst({
        where: eq(subscriptionProducts.id, input.productId),
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const stripePriceId =
        input.stripePriceId ??
        (product.stripeProductId
          ? (await createStripePrice(product.stripeProductId, input)).id
          : undefined);

      const [price] = await ctx.db
        .insert(subscriptionPrices)
        .values({
          productId: input.productId,
          unitAmount: input.unitAmount,
          currency: input.currency,
          interval: input.interval,
          type: input.type,
          includesTrial: input.includesTrial,
          trialLength: input.trialLength,
          trialUnit: input.trialUnit,
          requires_cc: input.requires_cc,
          stripePriceId,
        })
        .returning();

      return price;
    }),

  updatePrice: publicProcedure
    .input(
      z.object({
        id: z.string(),
        active: z.boolean().optional(),
        metadata: z.record(z.string()).optional(),
        stripePriceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const price = await ctx.db.query.subscriptionPrices.findFirst({
        where: eq(subscriptionPrices.id, input.id),
      });

      if (!price) {
        throw new Error("Price not found");
      }

      if (input.stripePriceId) {
        const [updatedPrice] = await ctx.db
          .update(subscriptionPrices)
          .set({
            active: input.active,
            stripePriceId: input.stripePriceId,
          })
          .where(eq(subscriptionPrices.id, input.id))
          .returning();

        return updatedPrice;
      }

      if (!price.stripePriceId) {
        throw new Error("Price not linked to Stripe");
      }

      await updateStripePrice(price.stripePriceId, input);

      const [updatedPrice] = await ctx.db
        .update(subscriptionPrices)
        .set({
          active: input.active,
        })
        .where(eq(subscriptionPrices.id, input.id))
        .returning();

      return updatedPrice;
    }),

  deleteProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.subscriptionProducts.findFirst({
        where: eq(subscriptionProducts.id, input.id),
        with: {
          prices: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stripeProductId) {
        await archiveStripeProduct(product.stripeProductId);
      }

      for (const price of product.prices) {
        if (price.stripePriceId) {
          await archiveStripePrice(price.stripePriceId);
        }
      }

      await ctx.db
        .update(subscriptionPrices)
        .set({ active: false })
        .where(eq(subscriptionPrices.productId, input.id));

      await ctx.db
        .update(subscriptionProducts)
        .set({ active: false })
        .where(eq(subscriptionProducts.id, input.id));

      return product;
    }),

  checkTrialEligibility: publicProcedure
    .input(
      z.object({
        subscriptionPriceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { subscriptionPriceId } = input;
      const email = ctx.session?.user?.email;

      if (!email) {
        return {
          isEligible: false,
          currentStatus: null,
        };
      }

      const hasUsedTrialBefore = await hasUsedTrial(email, subscriptionPriceId);
      const currentStatus = await getTrialStatus(email, subscriptionPriceId);

      return {
        isEligible: !hasUsedTrialBefore,
        currentStatus,
      };
    }),

  startTrial: publicProcedure
    .input(
      z.object({
        subscriptionPriceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subscriptionPriceId } = input;
      const userId = ctx.session?.user?.id;
      const email = ctx.session?.user?.email;

      if (!userId || !email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to start a trial",
        });
      }

      const price = await ctx.db.query.subscriptionPrices.findFirst({
        where: eq(subscriptionPrices.id, subscriptionPriceId),
      });

      if (!price) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription price not found",
        });
      }

      if (!price.includesTrial || !price.trialLength || !price.trialUnit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This subscription does not include a trial",
        });
      }

      const trialEndDate = calculateTrialEndDate(
        price.trialLength,
        price.trialUnit,
      );

      await startTrial({
        email,
        subscriptionPriceId,
        userId,
        trialEndDate,
      });

      return {
        success: true,
        trialEndsAt: trialEndDate,
      };
    }),

  endTrial: publicProcedure
    .input(
      z.object({
        subscriptionPriceId: z.string(),
        status: z.enum(["completed", "cancelled"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subscriptionPriceId, status } = input;
      const userId = ctx.session?.user?.id;
      const email = ctx.session?.user?.email;

      if (!userId || !email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to end a trial",
        });
      }

      await endTrial({
        email,
        subscriptionPriceId,
        userId,
        status,
      });

      return {
        success: true,
      };
    }),
});
