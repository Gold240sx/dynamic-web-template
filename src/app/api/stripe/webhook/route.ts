import { NextResponse } from "next/server";
import { stripe, webhookSecret } from "~/lib/stripe";
import type Stripe from "stripe";
import { db } from "~/server/db";
import { orders } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// AI DONT TOUCH THIS FILE

// This is the handler for the webhook endpoint
export async function POST(request: Request) {
  const body = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signatureHeader,
      webhookSecret,
    );

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Received checkout.session.completed event:", session.id);

        // Update order status to paid
        if (session.id) {
          console.log("Updating order status to paid for session:", session.id);
          await db
            .update(orders)
            .set({
              paymentStatus: "paid",
              updatedAt: new Date(),
            })
            .where(eq(orders.stripeSessionId, session.id));
          console.log("Successfully updated order status to paid");
        }

        if (session.customer_email && session.payment_intent) {
          try {
            // Ensure payment_intent is a string
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent.id;

            if (paymentIntentId) {
              await stripe.paymentIntents.update(paymentIntentId, {
                receipt_email: session.customer_email,
              });
            }
          } catch (error) {
            console.error("Failed to send receipt:", error);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        // Add your business logic here
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        // Update order status to failed
        if (paymentIntent.metadata.orderId) {
          await db
            .update(orders)
            .set({
              paymentStatus: "failed",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, paymentIntent.metadata.orderId));
        }
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      case "charge.dispute.created":
        const dispute = event.data.object;
        console.log(`Dispute created: ${dispute.id}`);
        // Add your business logic here
        break;

      case "charge.refunded":
        const refund = event.data.object;
        console.log(`Charge refunded: ${refund.id}`);
        // Add your business logic here
        break;

      case "customer.subscription.created":
        const subscription = event.data.object;
        console.log(`Subscription created: ${subscription.id}`);
        // Add your business logic here
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        console.log(`Subscription updated: ${updatedSubscription.id}`);
        // Add your business logic here
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        console.log(`Subscription deleted: ${deletedSubscription.id}`);
        // Add your business logic here
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }
}
