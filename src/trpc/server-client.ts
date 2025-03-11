import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "~/server/api/root";
import superjson from "superjson";

export const serverClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_APP_URL + "/api/trpc",
      headers() {
        return {
          "x-trpc-source": "rsc",
        };
      },
      transformer: superjson,
    }),
  ],
});
