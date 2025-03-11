import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { subscriptions } from "../../db/schema";

export const subscriptionRouter = createTRPCRouter({
  getProducts: publicProcedure.query(async () => {
    const products = await db.query.subscriptionProducts.findMany({
      with: {
        prices: true,
      },
    });

    return products.filter((product) => product.active);
  }),

  getAll: publicProcedure.query(async () => {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
      return null;
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId.value),
      with: {
        price: {
          columns: {
            productId: true,
          },
        },
      },
    });

    return subscription;
  }),
});
