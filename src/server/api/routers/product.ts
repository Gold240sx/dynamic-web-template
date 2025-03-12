import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import {
  products,
  productVariants,
  variantImages,
  productCategories,
  productReviews,
} from "~/server/db/schema";
import { desc, eq, count, inArray, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { type Product } from "~/types/store";
import { stripe } from "~/lib/stripe";
import { db } from "../../db";
import { type SQL } from "drizzle-orm";
import { subscriptionPrices, subscriptionProducts } from "../../db/schema";
import { type SubscriptionProductWithPrices } from "../../db/types";
import { type InferModel } from "drizzle-orm";

const variantSchema = z
  .object({
    name: z.string().min(3).max(256),
    description: z.string().optional(),
    price: z.number().min(0),
    stock: z.number().default(-1),
    isDigital: z.boolean().default(false),
    isLive: z.boolean().default(false),
    attributes: z.record(z.union([z.string(), z.number(), z.boolean()])),
    images: z.array(
      z.object({
        url: z.string().url(),
        title: z.string().min(3).max(256),
        order: z.number().default(0),
      }),
    ),
    stripeProductId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.isLive &&
        (!data.stripeProductId || data.stripeProductId.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "A Stripe product ID is required to make a variant live",
      path: ["stripeProductId"],
    },
  );

async function createStripeProduct(
  name: string,
  description: string | undefined,
  price: number,
  images: { url: string }[],
) {
  // Create the product in Stripe
  const product = await stripe.products.create({
    name,
    description,
    images: images.map((img) => img.url),
  });

  // Create a price for the product
  const priceObj = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(price * 100), // Convert to cents
    currency: "usd",
  });

  return product.id;
}

async function updateStripeProduct(
  stripeProductId: string,
  name: string,
  description: string | undefined,
  price: number,
  images: { url: string }[],
) {
  // Update the product in Stripe
  const product = await stripe.products.update(stripeProductId, {
    name,
    description,
    images: images.map((img) => img.url),
  });

  // Create a new price for the product
  await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(price * 100),
    currency: "usd",
  });

  return product.id;
}

type ProductWithRelations = InferModel<typeof products> & {
  category: InferModel<typeof productCategories> | null;
  variants: Array<
    InferModel<typeof productVariants> & {
      images: Array<InferModel<typeof variantImages>>;
    }
  >;
};

export const productRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3).max(256),
        description: z.string().min(10),
        categoryId: z.string(),
        variants: z.array(variantSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const productId = nanoid();

      return await ctx.db.transaction(async (tx) => {
        // Create the product
        const [newProduct] = await tx
          .insert(products)
          .values({
            id: productId,
            name: input.name,
            description: input.description,
            categoryId: input.categoryId,
          })
          .returning();

        if (!newProduct) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create product",
          });
        }

        // Create variants and their Stripe products
        for (const variant of input.variants) {
          const { images, ...variantData } = variant;
          const variantId = nanoid();

          // Create Stripe product for the variant
          const stripeProductId = await createStripeProduct(
            `${input.name} - ${variant.name}`,
            variant.description,
            variant.price,
            variant.images,
          );

          await tx.insert(productVariants).values({
            id: variantId,
            productId: newProduct.id,
            ...variantData,
            stripeProductId,
            attributes: JSON.stringify(variantData.attributes),
          });

          if (images.length > 0) {
            await tx.insert(variantImages).values(
              images.map((image) => ({
                id: nanoid(),
                variantId,
                ...image,
              })),
            );
          }
        }

        return newProduct;
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(256).optional(),
        description: z.string().min(10).optional(),
        categoryId: z.string().optional(),
        variants: z.array(variantSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, variants, ...updateData } = input;

      return await ctx.db.transaction(async (tx) => {
        // Update product
        const [updatedProduct] = await tx
          .update(products)
          .set(updateData)
          .where(eq(products.id, id))
          .returning();

        if (!updatedProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        // Update variants if provided
        if (variants) {
          // Get existing variants to handle Stripe product updates/deletions
          const existingVariants = await tx
            .select()
            .from(productVariants)
            .where(eq(productVariants.productId, id));

          // Delete variants that are no longer present
          const variantIds = variants
            .map((v) => v.stripeProductId)
            .filter(Boolean);
          for (const existingVariant of existingVariants) {
            if (
              existingVariant.stripeProductId &&
              !variantIds.includes(existingVariant.stripeProductId)
            ) {
              // Deactivate the Stripe product
              await stripe.products.update(existingVariant.stripeProductId, {
                active: false,
              });
            }
          }

          // Delete existing variants (cascade will handle images)
          await tx
            .delete(productVariants)
            .where(eq(productVariants.productId, id));

          // Create new variants
          for (const variant of variants) {
            const { images, ...variantData } = variant;
            const variantId = nanoid();

            // Create or update Stripe product
            const stripeProductId = variant.stripeProductId
              ? await updateStripeProduct(
                  variant.stripeProductId,
                  `${updatedProduct.name} - ${variant.name}`,
                  variant.description,
                  variant.price,
                  variant.images,
                )
              : await createStripeProduct(
                  `${updatedProduct.name} - ${variant.name}`,
                  variant.description,
                  variant.price,
                  variant.images,
                );

            await tx.insert(productVariants).values({
              id: variantId,
              productId: updatedProduct.id,
              ...variantData,
              stripeProductId,
              attributes: JSON.stringify(variantData.attributes),
            });

            if (images.length > 0) {
              await tx.insert(variantImages).values(
                images.map((image) => ({
                  id: nanoid(),
                  variantId,
                  ...image,
                })),
              );
            }
          }
        }

        return updatedProduct;
      });
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    // Get all variants with Stripe product IDs
    const variants = await ctx.db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, input));

    // Deactivate all Stripe products
    for (const variant of variants) {
      if (variant.stripeProductId) {
        await stripe.products.update(variant.stripeProductId, {
          active: false,
        });
      }
    }

    await ctx.db.delete(products).where(eq(products.id, input));
    return true;
  }),

  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const product = await ctx.db
      .select()
      .from(products)
      .where(eq(products.id, input))
      .limit(1);

    return product[0];
  }),

  getStats: publicProcedure.query(
    async ({
      ctx,
    }): Promise<{
      totalProducts: number;
      liveProducts: number;
      digitalProducts: number;
      physicalProducts: number;
    }> => {
      const [[totalProducts], [liveProducts]] = await Promise.all([
        ctx.db.select({ count: count() }).from(products),
        ctx.db
          .select({ count: count() })
          .from(products)
          .where(eq(products.isLive, true)),
      ]);

      const [[digitalProducts], [physicalProducts]] = await Promise.all([
        ctx.db
          .select({ count: count() })
          .from(productVariants)
          .where(eq(productVariants.isDigital, true)),
        ctx.db
          .select({ count: count() })
          .from(productVariants)
          .where(eq(productVariants.isDigital, false)),
      ]);

      return {
        totalProducts: totalProducts?.count ?? 0,
        liveProducts: liveProducts?.count ?? 0,
        digitalProducts: digitalProducts?.count ?? 0,
        physicalProducts: physicalProducts?.count ?? 0,
      };
    },
  ),

  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional(),
          cursor: z.string().optional(),
          onlyLive: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx }) => {
      // Get all products
      const allProducts = await ctx.db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt));

      // Get live variants
      const variants = await ctx.db
        .select()
        .from(productVariants)
        .where(eq(productVariants.isLive, true));

      // Filter products that have live variants
      const productsWithLiveVariants = allProducts.filter((product) =>
        variants.some((v) => v.productId === product.id),
      );

      // Get categories for these products
      const categories =
        productsWithLiveVariants.length > 0
          ? await ctx.db
              .select()
              .from(productCategories)
              .where(
                inArray(
                  productCategories.id,
                  productsWithLiveVariants.map((p) => p.categoryId),
                ),
              )
          : [];

      // Get all variants for these products
      const allVariants =
        productsWithLiveVariants.length > 0
          ? await ctx.db
              .select()
              .from(productVariants)
              .where(
                inArray(
                  productVariants.productId,
                  productsWithLiveVariants.map((p) => p.id),
                ),
              )
          : [];

      // Get variant images
      const variantIds = allVariants.map((v) => v.id);
      const images =
        variantIds.length > 0
          ? await ctx.db
              .select()
              .from(variantImages)
              .where(inArray(variantImages.variantId, variantIds))
          : [];

      // Construct the final product objects
      return productsWithLiveVariants.map((product) => ({
        ...product,
        category:
          categories.find((c) => c.id === product.categoryId)?.name ??
          "Uncategorized",
        variants: allVariants
          .filter((v) => v.productId === product.id)
          .map((variant) => ({
            ...variant,
            stripeProductId: variant.stripeProductId ?? undefined,
            images: images
              .filter((img) => img.variantId === variant.id)
              .map((img) => ({
                id: img.id,
                variantId: img.variantId,
                url: img.url,
                title: img.title,
                order: img.order,
              })),
            attributes: JSON.parse(variant.attributes as string) as Record<
              string,
              string | number | boolean
            >,
            description: variant.description ?? undefined,
            createdAt: variant.createdAt ?? new Date(),
            updatedAt: variant.updatedAt ?? new Date(),
          })),
      }));
    }),

  getPendingReviews: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
      return [];
    }

    const reviews = await ctx.db.query.productReviews.findMany({
      where: eq(productReviews.isApproved, false),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        product: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (reviews) => [reviews.createdAt],
    });

    return reviews;
  }),

  updateReview: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isApproved: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update review status",
        });
      }

      const review = await ctx.db
        .update(productReviews)
        .set({ isApproved: input.isApproved })
        .where(eq(productReviews.id, input.id))
        .returning();

      return review[0];
    }),
});
