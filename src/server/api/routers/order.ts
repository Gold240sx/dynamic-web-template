import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orders } from "~/server/db/schema";
import { desc, eq, like } from "drizzle-orm";

export const orderRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, offset } = input;

      const baseQuery = ctx.db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      if (query) {
        return baseQuery.where(like(orders.customerEmail, `%${query}%`));
      }

      return baseQuery;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id));

      return order[0];
    }),
});
