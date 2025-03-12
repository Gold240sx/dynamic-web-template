import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { subscriptionProducts, subscriptionPrices } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const priceSchema = z.object({
  active: z.boolean().default(true),
  currency: z.string().default("usd"),
  interval: z.enum(["day", "week", "month", "year"]),
  intervalCount: z.number().default(1),
  trialPeriodDays: z.number().optional(),
  type: z.enum(["one_time", "recurring"]),
  unitAmount: z.number(),
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().default(true),
  image: z.string().url().optional(),
  metadata: z.record(z.string()).optional(),
  prices: z.array(priceSchema),
});

export const subscriptionRouter = createTRPCRouter({
  getAllProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.query.subscriptionProducts.findMany({
      with: {
        prices: true,
      },
      orderBy: [desc(subscriptionProducts.createdAt)],
    });

    return products;
  }),

  getProduct: protectedProcedure
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

      return product;
    }),

  createProduct: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdProduct] = await ctx.db
        .insert(subscriptionProducts)
        .values({
          name: input.name,
          description: input.description,
          active: input.active,
          image: input.image,
          metadata: input.metadata
            ? Object.keys(input.metadata).length > 0
              ? JSON.stringify(input.metadata)
              : null
            : null,
        })
        .returning();

      if (!createdProduct) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }

      // Create prices for the product
      await ctx.db.insert(subscriptionPrices).values(
        input.prices.map((price) => ({
          productId: createdProduct.id,
          active: price.active,
          currency: price.currency,
          interval: price.interval,
          intervalCount: price.intervalCount,
          trialPeriodDays: price.trialPeriodDays,
          type: price.type,
          unitAmount: price.unitAmount,
        })),
      );

      return createdProduct;
    }),

  updateProduct: protectedProcedure
    .input(z.object({ id: z.string() }).merge(productSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, prices, ...productData } = input;

      const product = await ctx.db
        .update(subscriptionProducts)
        .set({
          name: productData.name,
          description: productData.description,
          active: productData.active,
          image: productData.image,
          metadata: input.metadata
            ? Object.keys(input.metadata).length > 0
              ? JSON.stringify(input.metadata)
              : null
            : null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionProducts.id, id))
        .returning();

      if (!product[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Delete existing prices
      await ctx.db
        .delete(subscriptionPrices)
        .where(eq(subscriptionPrices.productId, id));

      // Create new prices
      await ctx.db.insert(subscriptionPrices).values(
        prices.map((price) => ({
          productId: id,
          active: price.active,
          currency: price.currency,
          interval: price.interval,
          intervalCount: price.intervalCount,
          trialPeriodDays: price.trialPeriodDays,
          type: price.type,
          unitAmount: price.unitAmount,
        })),
      );

      return product[0];
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete prices first due to foreign key constraint
      await ctx.db
        .delete(subscriptionPrices)
        .where(eq(subscriptionPrices.productId, input.id));

      // Delete the product
      await ctx.db
        .delete(subscriptionProducts)
        .where(eq(subscriptionProducts.id, input.id));

      return { success: true };
    }),
});
