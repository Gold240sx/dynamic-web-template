import { createTRPCRouter } from "~/server/api/trpc";
import { createCallerFactory } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { subscriptionRouter } from "./routers/subscription";
import { productRouter } from "./routers/product";
import { postRouter } from "./routers/post";
import { orderRouter } from "./routers/order";
import { categoryRouter } from "./routers/category";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  subscription: subscriptionRouter,
  product: productRouter,
  post: postRouter,
  order: orderRouter,
  category: categoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
