import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { slugify } from "~/lib/utils";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3).max(256),
        content: z.string().min(10),
        excerpt: z.string().max(512).optional(),
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
          published: input.published,
          slug,
          authorId: "system", // TODO: Replace with actual user ID when auth is implemented
        })
        .returning();

      return post[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(posts).orderBy(desc(posts.createdAt));
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
        .where(eq(posts.slug, input.slug));
      return post[0];
    }),
});
