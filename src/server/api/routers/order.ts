import { z } from "zod";
import { desc, eq, like, or } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { orders, orderItems, users } from "~/server/db/schema";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

const searchInput = z.object({
  search: z.string().optional(),
  paymentStatus: z.string().optional(),
  shippingStatus: z.string().optional(),
});

const idInput = z.object({ id: z.string() });
const userIdInput = z.object({ userId: z.string() });

type SearchInput = z.infer<typeof searchInput>;
type IdInput = z.infer<typeof idInput>;
type UserIdInput = z.infer<typeof userIdInput>;

export const orderRouter = createTRPCRouter({
  getAll: publicProcedure.input(searchInput).query(async ({ ctx, input }) => {
    const { search, paymentStatus, shippingStatus } = input;
    const conditions = [];

    if (search) {
      conditions.push(
        like(orders.customerName, `%${search}%`),
        like(orders.customerEmail, `%${search}%`),
        like(orders.id, `%${search}%`),
      );
    }

    if (paymentStatus && paymentStatus !== "all") {
      conditions.push(eq(orders.paymentStatus, paymentStatus));
    }

    if (shippingStatus && shippingStatus !== "all") {
      conditions.push(eq(orders.shippingStatus, shippingStatus));
    }

    return ctx.db.query.orders.findMany({
      where: conditions.length > 0 ? or(...conditions) : undefined,
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });
  }),

  getById: publicProcedure.input(idInput).query(async ({ ctx, input }) => {
    return ctx.db.query.orders.findFirst({
      where: eq(orders.id, input.id),
      with: {
        items: true,
      },
    });
  }),

  getByUserId: publicProcedure
    .input(userIdInput)
    .query(async ({ ctx, input }) => {
      // Get user's email first
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: { email: true },
      });

      if (!user) {
        return [];
      }

      // Get orders where userId matches OR email matches
      return ctx.db.query.orders.findMany({
        where: or(
          eq(orders.userId, input.userId),
          eq(orders.customerEmail, user.email),
        ),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: true,
        },
      });
    }),

  updateShippingStatus: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["pending", "shipped", "delivered"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedOrder] = await ctx.db
        .update(orders)
        .set({ shippingStatus: input.status })
        .where(eq(orders.id, input.orderId))
        .returning();

      return updatedOrder;
    }),
});

export type OrderRouter = typeof orderRouter;
export type OrderRouterInputs = inferRouterInputs<OrderRouter>;
export type OrderRouterOutputs = inferRouterOutputs<OrderRouter>;
