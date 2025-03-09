import { db, client } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Checking database connection...");

  try {
    // Check if the database is accessible
    const result = await client.execute("SELECT sqlite_version()");
    console.log("Database connection successful:", result);

    // Check if the product_variants table exists
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='server-client-t3-blog_product_variants'",
    );

    console.log("Tables check:", tables);

    if (tables.rows.length === 0) {
      console.log("The product_variants table does not exist!");

      // List all tables
      const allTables = await client.execute(
        "SELECT name FROM sqlite_master WHERE type='table'",
      );

      console.log("Available tables:", allTables.rows);
    } else {
      console.log("The product_variants table exists!");

      // Check the structure of the table
      const columns = await client.execute(
        "PRAGMA table_info('server-client-t3-blog_product_variants')",
      );

      console.log("Table structure:", columns.rows);
    }
  } catch (error) {
    console.error("Error checking database:", error);
  }
}

main().catch((e) => {
  console.error("Error in main function:", e);
  process.exit(1);
});
