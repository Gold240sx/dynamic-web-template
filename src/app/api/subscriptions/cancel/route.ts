import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { subscriptions } from "~/server/db/schema";
import { stripe } from "@/server/stripe/client";
import { getCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  // Get the user ID from cookies
  const userId = await getCookie("userId");

  if (!userId?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { subscriptionId } = await req.json();

  try {
    // Get the subscription from our database
    const dbSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
      with: {
        user: true,
      },
    });

    if (!dbSubscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    // Verify the user owns this subscription
    if (dbSubscription.userId !== userId.value) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Cancel the subscription in Stripe if we have a Stripe subscription ID
    if (dbSubscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(dbSubscription.stripeSubscriptionId);
    }

    // Update our database
    await db
      .update(subscriptions)
      .set({
        status: "canceled",
        canceledAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
