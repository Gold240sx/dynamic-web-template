import { drizzle } from "drizzle-orm/better-sqlite3";
import { subscriptionPrices } from "./schema";
import { eq } from "drizzle-orm";
import { db } from "./index";

const PRICE_ID_MAP = {
  // Premium Plus Monthly
  jk4kh6zh28yrp4910bt5619r: "price_1R13sCBwx0wSGNq2j2FCNmmR",
  // Premium Plus Yearly
  ajq4l18ofpj5q31oawbuwv8c: "price_1R13smBwx0wSGNq2cB4HtkHr",
  // Premium Monthly
  czhqyeppi0s9se5b3k15n7sq: "price_1R13r5Bwx0wSGNq2zjDYYhBy",
  // Premium Yearly
  uhanhc216kds0j8re6vz3tps: "price_1R13r5Bwx0wSGNq23HRrgseL",
};

export async function updateStripePriceIds() {
  console.log("Updating Stripe price IDs...");

  try {
    for (const [priceId, stripePriceId] of Object.entries(PRICE_ID_MAP)) {
      console.log(`Updating price ${priceId} with Stripe ID ${stripePriceId}`);

      await db
        .update(subscriptionPrices)
        .set({ stripePriceId })
        .where(eq(subscriptionPrices.id, priceId));
    }

    console.log("Stripe price IDs updated successfully!");
  } catch (error) {
    console.error("Error updating prices:", error);
    throw error;
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  updateStripePriceIds()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error updating Stripe price IDs:", error);
      process.exit(1);
    });
}
