import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running database migration...");

  try {
    // Drop existing trial_usage table if it exists (since we're changing the structure)
    await db.run(
      sql`DROP TABLE IF EXISTS "server-client-t3-blog_trial_usage";`,
    );

    // Create trial_usage table to track trials by email with cascade delete and status
    await db.run(sql`
      CREATE TABLE "server-client-t3-blog_trial_usage" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "trial_started_at" integer NOT NULL,
        "trial_ended_at" integer,
        "subscription_price_id" text NOT NULL,
        "status" text NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        "created_at" integer DEFAULT (unixepoch()) NOT NULL,
        "updated_at" integer,
        FOREIGN KEY ("subscription_price_id") 
          REFERENCES "server-client-t3-blog_subscription_prices"("id") 
          ON DELETE CASCADE 
          ON UPDATE NO ACTION
      );

      -- Create indexes for better query performance
      CREATE INDEX "trial_usage_email_idx" ON "server-client-t3-blog_trial_usage" ("email");
      CREATE INDEX "trial_usage_status_idx" ON "server-client-t3-blog_trial_usage" ("status");
      CREATE INDEX "trial_usage_price_idx" ON "server-client-t3-blog_trial_usage" ("subscription_price_id");
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
