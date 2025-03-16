import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { subscriptionPrices, subscriptionProducts } from "./schema";
import { eq } from "drizzle-orm";

// Create a direct database connection without going through the environment validation
const sqlite = new Database("src/server/db/sqlite.db");
const db = drizzle(sqlite);

async function seedSubscriptionPrices() {
  console.log("Setting existing prices to inactive...");
  await db
    .update(subscriptionPrices)
    .set({ active: false })
    .where(eq(subscriptionPrices.active, true));

  console.log("Fetching active subscription products...");
  const products = await db
    .select()
    .from(subscriptionProducts)
    .where(eq(subscriptionProducts.active, true));

  console.log(`Found ${products.length} active products`);

  for (const product of products) {
    console.log(`Creating prices for product: ${product.name}`);

    // Monthly price with trial
    await db.insert(subscriptionPrices).values({
      productId: product.id,
      active: true,
      currency: "usd",
      interval: "month",
      type: "recurring",
      unitAmount: product.name.includes("Premium +") ? 1500 : 1000,
      includesTrial: true,
      trialLength: 14,
      trialUnit: "day",
      requires_cc: false,
      stripePriceId: product.name.includes("Premium +")
        ? "price_1QCs89Bwx0wSGNq2Av4glMtP"
        : "price_1QCs6GBwx0wSGNq2dcjZZZJQ",
    });

    // Yearly price with trial (20% discount)
    const yearlyAmount = product.name.includes("Premium +") ? 14400 : 9600;
    await db.insert(subscriptionPrices).values({
      productId: product.id,
      active: true,
      currency: "usd",
      interval: "year",
      type: "recurring",
      unitAmount: yearlyAmount,
      includesTrial: true,
      trialLength: 14,
      trialUnit: "day",
      requires_cc: false,
      stripePriceId: product.name.includes("Premium +")
        ? "price_1QCsAzBwx0wSGNq2mXYLYtpI"
        : "price_1QCs9iBwx0wSGNq2STYaEoM2",
    });
  }

  console.log("Subscription prices seeded successfully!");
}

seedSubscriptionPrices()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
