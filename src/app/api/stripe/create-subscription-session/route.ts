import { cookies } from "next/headers";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { users, subscriptionPrices } from "@/server/db/schema";
import { stripe } from "@/lib/stripe";
import { env } from "~/env.js";
import { NextResponse } from "next/server";

interface CheckoutBody {
  priceId: string;
  returnUrl: string;
}

export async function POST(request: Request) {
  try {
    console.log("Creating subscription checkout session...");
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
      console.log("No userId found in cookies");
      return NextResponse.json(
        { error: "You must be signed in to subscribe" },
        { status: 401 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId.value),
    });

    if (!user) {
      console.log("No user found for userId:", userId.value);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as CheckoutBody;
    const { priceId, returnUrl } = body;

    if (!priceId) {
      console.log("No priceId provided in request body");
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 },
      );
    }

    console.log("Looking up price:", priceId);
    const price = await db.query.subscriptionPrices.findFirst({
      where: eq(subscriptionPrices.id, priceId),
    });

    if (!price) {
      console.log("Price not found:", priceId);
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    if (!price.stripePriceId) {
      console.log("No Stripe price ID found for price:", priceId);
      return NextResponse.json(
        { error: "Price not configured in Stripe" },
        { status: 400 },
      );
    }

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      billing_address_collection: "required",
      payment_method_collection: "if_required",
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}${returnUrl}`,
      mode: "subscription",
      line_items: [
        {
          price: price.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data:
        price.includesTrial && price.trialLength
          ? {
              trial_period_days: price.trialLength,
            }
          : undefined,
      metadata: {
        userId: user.id,
        priceId: price.id,
      },
    });

    console.log("Checkout session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating subscription checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create subscription checkout session" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log("GET: Creating subscription checkout session...");
    const { searchParams } = new URL(request.url);
    const priceId = searchParams.get("priceId");
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
      console.log("No userId found in cookies");
      return NextResponse.json(
        { error: "You must be signed in to subscribe" },
        { status: 401 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId.value),
    });

    if (!user) {
      console.log("No user found for userId:", userId.value);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!priceId) {
      console.log("No priceId provided in query params");
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 },
      );
    }

    console.log("Looking up price:", priceId);
    const price = await db.query.subscriptionPrices.findFirst({
      where: eq(subscriptionPrices.id, priceId),
    });

    if (!price) {
      console.log("Price not found:", priceId);
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    if (!price.stripePriceId) {
      console.log("No Stripe price ID found for price:", priceId);
      return NextResponse.json(
        { error: "Price not configured in Stripe" },
        { status: 400 },
      );
    }

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      billing_address_collection: "required",
      payment_method_collection: "if_required",
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/`,
      mode: "subscription",
      line_items: [
        {
          price: price.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data:
        price.includesTrial && price.trialLength
          ? {
              trial_period_days: price.trialLength,
            }
          : undefined,
      metadata: {
        userId: user.id,
        priceId: price.id,
      },
    });

    console.log("Checkout session created:", session.id);
    return NextResponse.redirect(session.url!, 303);
  } catch (error) {
    console.error("Error creating subscription checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create subscription checkout session" },
      { status: 500 },
    );
  }
}
