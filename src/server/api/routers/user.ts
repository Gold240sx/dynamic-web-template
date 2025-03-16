import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { z } from "zod";
import { users, userAddresses } from "~/server/db/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const addressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().optional(),
  type: z.enum(["billing", "shipping", "installation", "service"]),
  name: z.string(),
  isDefault: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const userRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.id),
      });
      return user;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, page, limit } = input;
      const offset = (page - 1) * limit;

      // Build the base query
      const baseQuery = ctx.db.select().from(users);
      if (search) {
        baseQuery.where(
          or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)),
        );
      }

      // Get total count for pagination
      const countResult = await ctx.db
        .select({ total: sql<number>`count(*)` })
        .from(users)
        .where(
          search
            ? or(
                like(users.name, `%${search}%`),
                like(users.email, `%${search}%`),
              )
            : undefined,
        );

      const totalCount = countResult[0]?.total ?? 0;

      // Get paginated results
      const results = await baseQuery
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));

      return {
        users: results,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  updateContactInfo: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;

      if (!currentUserId || currentUserId !== input.userId) {
        throw new Error("Unauthorized");
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name) {
        updateData.name = input.name;
      }

      await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  getAddresses: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;

      if (!currentUserId || currentUserId !== input.userId) {
        throw new Error("Unauthorized");
      }

      const addresses = await db.query.userAddresses.findMany({
        where: (userAddresses, { eq }) =>
          eq(userAddresses.userId, input.userId),
        orderBy: (userAddresses, { desc }) => [desc(userAddresses.isDefault)],
      });
      return addresses;
    }),

  addAddress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        address: addressSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;

      if (!currentUserId || currentUserId !== input.userId) {
        throw new Error("Unauthorized");
      }

      // If this is set as default, unset other defaults of the same type
      if (input.address.isDefault) {
        await db
          .update(userAddresses)
          .set({ isDefault: false })
          .where(
            and(
              eq(userAddresses.userId, input.userId),
              eq(userAddresses.type, input.address.type),
            ),
          );
      }

      await db.insert(userAddresses).values({
        ...input.address,
        userId: input.userId,
      });

      return { success: true };
    }),

  deleteAddress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        addressId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;

      if (!currentUserId || currentUserId !== input.userId) {
        throw new Error("Unauthorized");
      }

      await db
        .delete(userAddresses)
        .where(
          and(
            eq(userAddresses.id, input.addressId),
            eq(userAddresses.userId, input.userId),
          ),
        );

      return { success: true };
    }),

  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user roles",
        });
      }

      await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(["active", "suspended"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user status",
        });
      }

      await ctx.db
        .update(users)
        .set({ status: input.status })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});
