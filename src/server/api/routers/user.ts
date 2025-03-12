import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { cookies } from "next/headers";
import { z } from "zod";
import { users, userAddresses } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

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

  getAll: publicProcedure.query(async () => {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId.value),
    });

    return user;
  }),

  updateContactInfo: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const cookieStore = await cookies();
      const currentUserId = cookieStore.get("userId");

      if (!currentUserId || currentUserId.value !== input.userId) {
        throw new Error("Unauthorized");
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name) {
        updateData.name = input.name;
      }

      await db.update(users).set(updateData).where(eq(users.id, input.userId));

      return { success: true };
    }),

  getAddresses: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
      const cookieStore = await cookies();
      const currentUserId = cookieStore.get("userId");

      if (!currentUserId || currentUserId.value !== input.userId) {
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
    .mutation(async ({ input }) => {
      const cookieStore = await cookies();
      const currentUserId = cookieStore.get("userId");

      if (!currentUserId || currentUserId.value !== input.userId) {
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
});
