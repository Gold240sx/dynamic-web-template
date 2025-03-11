import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { cookies } from "next/headers";
import { z } from "zod";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const addressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
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
        billingAddress: addressSchema.optional(),
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

      if (input.billingAddress) {
        updateData.billingAddress = input.billingAddress;
      }

      if (input.name) {
        updateData.name = input.name;
      }

      await db.update(users).set(updateData).where(eq(users.id, input.userId));

      return { success: true };
    }),
});
