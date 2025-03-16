import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:src/server/db/sqlite.db",
  },
  tablesFilter: ["server-client-t3-blog_*"],
} satisfies Config;
