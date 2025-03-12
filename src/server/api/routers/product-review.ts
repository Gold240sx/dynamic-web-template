import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  productReviewSchema,
  productReviewUpdateSchema,
} from "~/lib/validations/store";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { productReviews } from "~/server/db/schema";

export const productReviewRouter = createTRPCRouter({
  create: publicProcedure
    .input(productReviewSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to review products",
        });
      }

      const review = await ctx.db.insert(productReviews).values({
        productId: input.productId,
        userId: ctx.session.user.id,
        content: input.content,
        rating: input.rating,
      });
      return review;
    }),

  getByProductId: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.query.productReviews.findMany({
        where: and(
          eq(productReviews.productId, input.productId),
          eq(productReviews.isApproved, true),
        ),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: (reviews) => [reviews.createdAt],
      });
      return reviews;
    }),

  getPending: publicProcedure.query(async ({ ctx }) => {
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

  update: publicProcedure
    .input(productReviewUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update reviews",
        });
      }

      const review = await ctx.db
        .update(productReviews)
        .set({ isApproved: input.isApproved })
        .where(eq(productReviews.id, input.id));
      return review;
    }),
});
