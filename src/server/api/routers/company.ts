import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { companyReviews } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const companyRouter = createTRPCRouter({
  getPendingReviews: publicProcedure.query(async ({ ctx }) => {
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
        .update(companyReviews)
        .set({ isApproved: input.isApproved })
        .where(eq(companyReviews.id, input.id))
        .returning();

      return review[0];
    }),
});
