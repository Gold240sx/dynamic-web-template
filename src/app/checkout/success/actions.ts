"use server";

import { stripe } from "~/lib/stripe";

export async function getCheckoutSession(sessionId: string) {
  if (!sessionId) {
    throw new Error("Please provide a valid session_id (`cs_test_...`)");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent", "customer_details"],
  });

  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
  };
}
