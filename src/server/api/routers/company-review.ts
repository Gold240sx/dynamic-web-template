import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  companyReviewSchema,
  companyReviewUpdateSchema,
} from "~/lib/validations/store";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { companyReviews, users } from "~/server/db/schema";

export const companyReviewRouter = createTRPCRouter({
  create: publicProcedure
    .input(companyReviewSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to review the company",
        });
      }

      const review = await ctx.db.insert(companyReviews).values({
        userId: ctx.session.user.id,
        content: input.content,
        rating: input.rating,
      });
      return review;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.db.query.companyReviews.findMany({
      where: eq(companyReviews.isApproved, true),
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

    const reviews = await ctx.db.query.companyReviews.findMany({
      where: eq(companyReviews.isApproved, false),
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

  update: publicProcedure
    .input(companyReviewUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update reviews",
        });
      }

      const review = await ctx.db
        .update(companyReviews)
        .set({ isApproved: input.isApproved })
        .where(eq(companyReviews.id, input.id));
      return review;
    }),

  getApprovedReviews: publicProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.db
      .select({
        id: companyReviews.id,
        content: companyReviews.content,
        rating: companyReviews.rating,
        createdAt: companyReviews.createdAt,
        updatedAt: companyReviews.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(companyReviews)
      .innerJoin(users, eq(companyReviews.userId, users.id))
      .where(eq(companyReviews.isApproved, true))
      .orderBy(desc(companyReviews.createdAt));

    return reviews;
  }),
});
