import { updateStripePriceIds } from "../src/server/db/update-stripe-ids";

updateStripePriceIds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error updating Stripe price IDs:", error);
    process.exit(1);
  });
