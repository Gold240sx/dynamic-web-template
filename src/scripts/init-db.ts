import { db } from "../server/db";
import * as schema from "../server/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Initializing database...");

  // Create tables directly
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_product_category" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "category_name_idx" ON "server-client-t3-blog_product_category" ("name");
    
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_product" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category_id" TEXT NOT NULL,
      "is_live" INTEGER NOT NULL DEFAULT 0,
      "stripe_product_id" TEXT DEFAULT '',
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER,
      FOREIGN KEY ("category_id") REFERENCES "server-client-t3-blog_product_category" ("id")
    );
    
    CREATE INDEX IF NOT EXISTS "category_idx" ON "server-client-t3-blog_product" ("category_id");
    CREATE INDEX IF NOT EXISTS "name_idx" ON "server-client-t3-blog_product" ("name");
    
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_post" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "excerpt" TEXT,
      "published" INTEGER NOT NULL DEFAULT 0,
      "author_id" TEXT NOT NULL,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "slug_idx" ON "server-client-t3-blog_post" ("slug");
    CREATE INDEX IF NOT EXISTS "title_idx" ON "server-client-t3-blog_post" ("title");
    CREATE INDEX IF NOT EXISTS "author_idx" ON "server-client-t3-blog_post" ("author_id");
    
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_product_variants" (
      "id" TEXT PRIMARY KEY,
      "product_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "price" INTEGER NOT NULL,
      "stock" INTEGER NOT NULL DEFAULT -1,
      "is_digital" INTEGER NOT NULL DEFAULT 0,
      "is_live" INTEGER NOT NULL DEFAULT 0,
      "stripe_product_id" TEXT,
      "attributes" TEXT NOT NULL,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER,
      "is_physical" INTEGER NOT NULL DEFAULT 0,
      "weight_in_grams" INTEGER DEFAULT 0,
      "length_in_mm" INTEGER DEFAULT 0,
      "width_in_mm" INTEGER DEFAULT 0,
      "height_in_mm" INTEGER DEFAULT 0,
      "requires_shipping" INTEGER NOT NULL DEFAULT 0,
      "flat_rate_shipping_cents" INTEGER DEFAULT 0,
      FOREIGN KEY ("product_id") REFERENCES "server-client-t3-blog_product" ("id") ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "server-client-t3-blog_product_variants" ("product_id");
    
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_variant_image" (
      "id" TEXT PRIMARY KEY,
      "variant_id" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY ("variant_id") REFERENCES "server-client-t3-blog_product_variants" ("id") ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS "variant_id_idx" ON "server-client-t3-blog_variant_image" ("variant_id");
    
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_shipping_estimates" (
      "id" TEXT PRIMARY KEY,
      "variant_id" TEXT NOT NULL,
      "estimated_days" INTEGER NOT NULL,
      "created_at" INTEGER NOT NULL,
      "updated_at" INTEGER NOT NULL,
      FOREIGN KEY ("variant_id") REFERENCES "server-client-t3-blog_product_variants" ("id") ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS "shipping_estimates_variant_id_idx" ON "server-client-t3-blog_shipping_estimates" ("variant_id");
    
    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_site_settings" (
      "id" TEXT PRIMARY KEY,
      "shipment_grouping_days" INTEGER NOT NULL DEFAULT 7,
      "updated_at" INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS "site_settings_id_idx" ON "server-client-t3-blog_site_settings" ("id");

    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_users" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "password" TEXT,
      "role" TEXT NOT NULL DEFAULT 'user',
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER
    );

    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_subscription_products" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "active" INTEGER NOT NULL DEFAULT 1,
      "image" TEXT,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER
    );

    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_subscription_prices" (
      "id" TEXT PRIMARY KEY,
      "product_id" TEXT NOT NULL,
      "active" INTEGER NOT NULL DEFAULT 1,
      "currency" TEXT NOT NULL DEFAULT 'usd',
      "interval" TEXT NOT NULL,
      "interval_count" INTEGER NOT NULL DEFAULT 1,
      "trial_period_days" INTEGER,
      "type" TEXT NOT NULL,
      "unit_amount" INTEGER NOT NULL,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER,
      FOREIGN KEY ("product_id") REFERENCES "server-client-t3-blog_subscription_products" ("id")
    );

    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_orders" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT,
      "stripe_session_id" TEXT,
      "customer_email" TEXT NOT NULL,
      "customer_name" TEXT,
      "customer_phone" TEXT,
      "requires_shipping" INTEGER NOT NULL DEFAULT 0,
      "shipping_name" TEXT,
      "shipping_address_line1" TEXT,
      "shipping_address_line2" TEXT,
      "shipping_city" TEXT,
      "shipping_state" TEXT,
      "shipping_postal_code" TEXT,
      "shipping_country" TEXT,
      "billing_address_line1" TEXT,
      "billing_address_line2" TEXT,
      "billing_city" TEXT,
      "billing_state" TEXT,
      "billing_postal_code" TEXT,
      "billing_country" TEXT,
      "currency" TEXT NOT NULL DEFAULT 'usd',
      "amount_subtotal" REAL NOT NULL,
      "amount_total" REAL NOT NULL,
      "amount_tax" REAL,
      "amount_shipping" REAL,
      "payment_status" TEXT NOT NULL DEFAULT 'pending',
      "shipping_status" TEXT NOT NULL DEFAULT 'pending',
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER,
      FOREIGN KEY ("user_id") REFERENCES "server-client-t3-blog_users" ("id")
    );

    CREATE TABLE IF NOT EXISTS "server-client-t3-blog_order_items" (
      "id" TEXT PRIMARY KEY,
      "order_id" TEXT NOT NULL,
      "variant_id" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "price" REAL NOT NULL,
      "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
      "updated_at" INTEGER,
      FOREIGN KEY ("order_id") REFERENCES "server-client-t3-blog_orders" ("id"),
      FOREIGN KEY ("variant_id") REFERENCES "server-client-t3-blog_product_variants" ("id")
    );
  `);

  console.log("Database initialized successfully!");
}

main().catch((e) => {
  console.error("Error initializing database:", e);
  process.exit(1);
});
