import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "~/lib/stripe";
import { z } from "zod";
import Stripe from "stripe";

// Define the expected request body schema
const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number(),
      price: z.number(),
      name: z.string(),
      stripeProductId: z.string(),
      isDigital: z.boolean(),
    }),
  ),
  email: z.string().email(),
});

type CheckoutBody = z.infer<typeof checkoutSchema>;

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin") ?? "http://localhost:3000";
    const body = (await request.json()) as CheckoutBody;

    // Validate the request body
    const { items } = checkoutSchema.parse(body);

    // Validate that all items have Stripe product IDs
    const invalidItems = items.filter((item) => !item.stripeProductId);
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: "Some items are not available for purchase" },
        { status: 400 },
      );
    }

    // Create Checkout Sessions from body params
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: body.email,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product: item.stripeProductId,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      phone_number_collection: {
        enabled: true,
      },
      // Only collect shipping address if any item requires shipping
      shipping_address_collection: items.some((item) => !item.isDigital)
        ? {
            allowed_countries: ["US", "CA"],
          }
        : undefined,
      // Only collect billing address if any item has a price greater than 0
      billing_address_collection: items.some((item) => item.price > 0)
        ? "required"
        : "auto",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?canceled=true`,
      metadata: {
        requires_shipping: items.some((item) => !item.isDigital).toString(),
        has_paid_items: items.some((item) => item.price > 0).toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error in checkout session creation:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode ?? 500 },
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    await stripe.products.update(productId, { active: false });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode ?? 500 },
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
