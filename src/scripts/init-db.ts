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
  `);

  console.log("Database initialized successfully!");
}

main().catch((e) => {
  console.error("Error initializing database:", e);
  process.exit(1);
});
