import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { productCategories } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3).max(256),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await ctx.db
        .insert(productCategories)
        .values({
          id: nanoid(),
          ...input,
        })
        .returning();

      if (!category) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        });
      }

      return category;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(256).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [category] = await ctx.db
        .update(productCategories)
        .set(updateData)
        .where(eq(productCategories.id, id))
        .returning();

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.db
      .delete(productCategories)
      .where(eq(productCategories.id, input));
    return true;
  }),

  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const category = await ctx.db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, input))
      .limit(1);

    return category[0];
  }),

  all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(productCategories)
      .orderBy(desc(productCategories.createdAt));
  }),
});
