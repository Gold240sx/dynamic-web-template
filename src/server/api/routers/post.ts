import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { posts, blogComments, postLikes, users } from "~/server/db/schema";
import { desc, eq, sql, and, gt, or } from "drizzle-orm";
import { slugify } from "~/lib/utils";
import {
  blogCommentSchema,
  blogCommentUpdateSchema,
  blogFormSchema,
  postLikeSchema,
} from "~/lib/validations/blog";
import { TRPCError } from "@trpc/server";
import type { inferAsyncReturnType } from "@trpc/server";
import type { createTRPCContext } from "~/server/api/trpc";
import { differenceInMinutes } from "date-fns";
import { BLOG_CONFIG } from "~/config/blog";

type Context = inferAsyncReturnType<typeof createTRPCContext>;

const editCommentSchema = z.object({
  commentId: z.string(),
  content: z.string().min(1).max(BLOG_CONFIG.comments.maxCommentLength),
});

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3).max(256),
        content: z.string().min(10),
        excerpt: z.string().max(512).optional(),
        image: z.string().url().optional(),
        published: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.title);

      const post = await ctx.db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          image: input.image,
          published: input.published,
          slug,
          authorId: "system", // TODO: Replace with actual user ID when auth is implemented
        })
        .returning();

      return post[0];
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).max(256),
        content: z.string().min(10),
        excerpt: z.string().max(512).optional(),
        image: z.string().url().optional(),
        published: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.title);

      const post = await ctx.db
        .update(posts)
        .set({
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          image: input.image,
          published: input.published,
          slug,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id))
        .returning();

      return post[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .then((res) => res[0]);

      return post;
    }),

  getAllPosts: publicProcedure.query(async ({ ctx }) => {
    const allPosts = await ctx.db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return allPosts;
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(1);

    return post[0] ?? null;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .then((res) => res[0]);

      return post;
    }),

  toggleLike: publicProcedure
    .input(postLikeSchema)
    .mutation(
      async ({
        ctx,
        input,
      }: {
        ctx: Context;
        input: z.infer<typeof postLikeSchema>;
      }) => {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to like posts",
          });
        }

        const existingLike = await ctx.db.query.postLikes.findFirst({
          where: and(
            eq(postLikes.postId, input.postId),
            eq(postLikes.userId, ctx.session.user.id),
          ),
        });

        if (existingLike) {
          await ctx.db
            .delete(postLikes)
            .where(eq(postLikes.id, existingLike.id));
          await ctx.db
            .update(posts)
            .set({ likes: sql`${posts.likes} - 1` })
            .where(eq(posts.id, input.postId));
          return { liked: false };
        }

        await ctx.db.insert(postLikes).values({
          postId: input.postId,
          userId: ctx.session.user.id,
        });
        await ctx.db
          .update(posts)
          .set({ likes: sql`${posts.likes} + 1` })
          .where(eq(posts.id, input.postId));
        return { liked: true };
      },
    ),

  getLikeStatus: publicProcedure
    .input(postLikeSchema)
    .query(
      async ({
        ctx,
        input,
      }: {
        ctx: Context;
        input: z.infer<typeof postLikeSchema>;
      }) => {
        if (!ctx.session?.user?.id) {
          return { liked: false };
        }

        const like = await ctx.db.query.postLikes.findFirst({
          where: and(
            eq(postLikes.postId, input.postId),
            eq(postLikes.userId, ctx.session.user.id),
          ),
        });
        return { liked: !!like };
      },
    ),

  createComment: publicProcedure
    .input(blogCommentSchema)
    .mutation(
      async ({
        ctx,
        input,
      }: {
        ctx: Context;
        input: z.infer<typeof blogCommentSchema>;
      }) => {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to comment",
          });
        }

        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.session.user.id),
        });

        if (!user?.canComment) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to comment",
          });
        }

        // Check rate limit
        const recentComment = await ctx.db.query.blogComments.findFirst({
          where: and(
            eq(blogComments.userId, ctx.session.user.id),
            gt(blogComments.createdAt, new Date(Date.now() - 60000)), // 1 minute
          ),
        });

        if (recentComment) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Please wait before commenting again",
          });
        }

        // If this is a reply, check if the parent comment exists and is approved
        if (input.parentId) {
          const parentComment = await ctx.db.query.blogComments.findFirst({
            where: eq(blogComments.id, input.parentId),
          });

          if (!parentComment) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Parent comment not found",
            });
          }

          if (!parentComment.isApproved && ctx.session.user.role !== "admin") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cannot reply to an unapproved comment",
            });
          }
        }

        const comment = await ctx.db.insert(blogComments).values({
          postId: input.postId,
          userId: ctx.session.user.id,
          content: input.content,
          parentId: input.parentId,
          isDraft: !user.canComment,
          isApproved: ctx.session.user.role === "admin",
        });
        return comment;
      },
    ),

  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.db.query.blogComments.findMany({
        where: and(
          eq(blogComments.postId, input.postId),
          or(
            eq(blogComments.isApproved, true),
            and(
              eq(blogComments.userId, ctx.session?.user?.id ?? ""),
              eq(blogComments.isApproved, false),
            ),
          ),
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
        orderBy: (comments) => [desc(comments.createdAt)],
      });
      return comments;
    }),

  getPendingComments: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
      return []; // Return empty array instead of throwing error for non-admin users
    }

    const comments = await ctx.db.query.blogComments.findMany({
      where: eq(blogComments.isApproved, false),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        post: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: (comments) => [desc(comments.createdAt)],
    });
    return comments;
  }),

  updateComment: publicProcedure
    .input(blogCommentUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.role || ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can update comments",
        });
      }

      const comment = await ctx.db
        .update(blogComments)
        .set({ isApproved: input.isApproved })
        .where(eq(blogComments.id, input.id));
      return comment;
    }),

  editComment: publicProcedure
    .input(editCommentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to edit comments",
        });
      }

      const comment = await ctx.db.query.blogComments.findFirst({
        where: eq(blogComments.id, input.commentId),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (comment.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }

      // Check if comment is within edit window
      if (
        differenceInMinutes(new Date(), comment.createdAt) >
        BLOG_CONFIG.comments.editTimeWindow
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Comments can only be edited within ${BLOG_CONFIG.comments.editTimeWindow} minutes of posting`,
        });
      }

      await ctx.db
        .update(blogComments)
        .set({
          content: input.content,
          updatedAt: new Date(),
        })
        .where(eq(blogComments.id, input.commentId));

      return { success: true };
    }),
});
