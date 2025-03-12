import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  users,
  commentResponses,
  reviewResponses,
  blogComments,
  productReviews,
  companyReviews,
} from "~/server/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export const userPermissionsRouter = createTRPCRouter({
  updatePermissions: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        canRespond: z.boolean().optional(),
        canComment: z.boolean().optional(),
        canReview: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update user permissions",
        });
      }

      const [user] = await ctx.db
        .update(users)
        .set({
          canRespond: input.canRespond,
          canComment: input.canComment,
          canReview: input.canReview,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning();

      return user;
    }),

  createCommentResponse: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string().min(1),
        responseType: z.enum(["adminOnly", "all"]).default("all"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to respond",
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user?.canRespond) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to respond",
        });
      }

      // Check rate limit
      const recentResponse = await ctx.db.query.commentResponses.findFirst({
        where: and(
          eq(commentResponses.userId, ctx.session.user.id),
          gt(
            commentResponses.createdAt,
            new Date(Date.now() - RATE_LIMIT_WINDOW),
          ),
        ),
      });

      if (recentResponse) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Please wait before responding again",
        });
      }

      // Check if user is trying to respond to their own comment
      const comment = await ctx.db.query.blogComments.findFirst({
        where: eq(blogComments.id, input.commentId),
      });

      if (comment?.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot respond to your own comment",
        });
      }

      const [response] = await ctx.db
        .insert(commentResponses)
        .values({
          commentId: input.commentId,
          userId: ctx.session.user.id,
          content: input.content,
          responseType: input.responseType,
          isDraft: !user.canRespond,
          isApproved: ctx.session.user.role === "admin",
        })
        .returning();

      return response;
    }),

  createReviewResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        reviewType: z.enum(["product", "company"]),
        content: z.string().min(1),
        responseType: z.enum(["adminOnly", "all"]).default("all"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to respond",
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user?.canRespond) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to respond",
        });
      }

      // Check rate limit
      const recentResponse = await ctx.db.query.reviewResponses.findFirst({
        where: and(
          eq(reviewResponses.userId, ctx.session.user.id),
          gt(
            reviewResponses.createdAt,
            new Date(Date.now() - RATE_LIMIT_WINDOW),
          ),
        ),
      });

      if (recentResponse) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Please wait before responding again",
        });
      }

      // Check if user is trying to respond to their own review
      let review;
      if (input.reviewType === "product") {
        review = await ctx.db.query.productReviews.findFirst({
          where: eq(productReviews.id, input.reviewId),
        });
      } else {
        review = await ctx.db.query.companyReviews.findFirst({
          where: eq(companyReviews.id, input.reviewId),
        });
      }

      if (review?.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot respond to your own review",
        });
      }

      const [response] = await ctx.db
        .insert(reviewResponses)
        .values({
          reviewId: input.reviewId,
          reviewType: input.reviewType,
          userId: ctx.session.user.id,
          content: input.content,
          responseType: input.responseType,
          isDraft: !user.canRespond,
          isApproved: ctx.session.user.role === "admin",
        })
        .returning();

      return response;
    }),
});
