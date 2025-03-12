import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  blogComments,
  productReviews,
  companyReviews,
  orders,
} from "~/server/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = createTRPCRouter({
  getUnviewedCounts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view notification counts",
      });
    }

    const [
      unviewedComments,
      unviewedProductReviews,
      unviewedCompanyReviews,
      unviewedOrders,
    ] = await Promise.all([
      // Get unviewed comments count
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(blogComments)
        .where(
          and(
            eq(blogComments.isApproved, false),
            isNull(blogComments.viewedAt),
          ),
        )
        .then((result) => result[0]?.count ?? 0),

      // Get unviewed product reviews count
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(productReviews)
        .where(
          and(
            eq(productReviews.isApproved, false),
            isNull(productReviews.viewedAt),
          ),
        )
        .then((result) => result[0]?.count ?? 0),

      // Get unviewed company reviews count
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(companyReviews)
        .where(
          and(
            eq(companyReviews.isApproved, false),
            isNull(companyReviews.viewedAt),
          ),
        )
        .then((result) => result[0]?.count ?? 0),

      // Get unviewed orders count
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(isNull(orders.viewedAt))
        .then((result) => result[0]?.count ?? 0),
    ]);

    const reviewsTotal = unviewedProductReviews + unviewedCompanyReviews;

    return {
      comments: unviewedComments,
      reviews: reviewsTotal,
      orders: unviewedOrders,
      total: unviewedComments + reviewsTotal + unviewedOrders,
    };
  }),

  markAsViewed: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "comments",
          "productReviews",
          "companyReviews",
          "orders",
        ]),
        ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can mark notifications as viewed",
        });
      }

      const now = new Date();

      switch (input.type) {
        case "comments":
          await ctx.db
            .update(blogComments)
            .set({ viewedAt: now })
            .where(
              and(
                isNull(blogComments.viewedAt),
                eq(blogComments.isApproved, false),
              ),
            );
          break;
        case "productReviews":
          await ctx.db
            .update(productReviews)
            .set({ viewedAt: now })
            .where(
              and(
                isNull(productReviews.viewedAt),
                eq(productReviews.isApproved, false),
              ),
            );
          break;
        case "companyReviews":
          await ctx.db
            .update(companyReviews)
            .set({ viewedAt: now })
            .where(
              and(
                isNull(companyReviews.viewedAt),
                eq(companyReviews.isApproved, false),
              ),
            );
          break;
        case "orders":
          await ctx.db
            .update(orders)
            .set({ viewedAt: now })
            .where(isNull(orders.viewedAt));
          break;
      }
    }),
});
