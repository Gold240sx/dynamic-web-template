import { stripe } from "~/lib/stripe";
import { db } from "~/server/db";
import { productVariants } from "~/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Creating test mode products in Stripe...");

  // Get all variants from the database
  const variants = await db.query.productVariants.findMany({
    where: eq(productVariants.isLive, true),
  });

  for (const variant of variants) {
    try {
      // Create a test mode product in Stripe
      const product = await stripe.products.create({
        name: variant.name,
        description: variant.description ?? undefined,
        active: true,
      });

      // Create a price for the product
      await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(variant.price * 100),
        currency: "usd",
      });

      // Update the database with the test product ID
      await db
        .update(productVariants)
        .set({
          stripeProductId: product.id,
        })
        .where(eq(productVariants.id, variant.id));

      console.log(`Created test product for variant: ${variant.name}`);
    } catch (error) {
      console.error(
        `Error creating test product for variant: ${variant.name}`,
        error,
      );
    }
  }

  console.log("Done creating test products!");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
