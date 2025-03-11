import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { stripe } from "~/lib/stripe";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "~/server/db";
import { orders, orderItems } from "~/server/db/schema";
import { createId } from "@paralleldrive/cuid2";

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
  address: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
      phone: z.string().optional(),
    })
    .optional(),
});

type CheckoutBody = z.infer<typeof checkoutSchema>;

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();
    const origin = headersList.get("origin") ?? "http://localhost:3000";
    const userId = cookieStore.get("userId")?.value;
    const body = (await request.json()) as CheckoutBody;

    // Validate the request body
    const { items, email, address } = checkoutSchema.parse(body);

    // Validate that all items have Stripe product IDs
    const invalidItems = items.filter((item) => !item.stripeProductId);
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: "Some items are not available for purchase" },
        { status: 400 },
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = subtotal; // Add tax/shipping calculation if needed

    // Create order in database
    const orderId = createId();
    const requiresShipping = items.some((item) => !item.isDigital);

    // Create Checkout Sessions from body params
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
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
      shipping_address_collection: requiresShipping
        ? {
            allowed_countries: ["US", "CA"],
          }
        : undefined,
      billing_address_collection: items.some((item) => item.price > 0)
        ? "required"
        : "auto",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?canceled=true`,
      metadata: {
        orderId,
        requires_shipping: requiresShipping.toString(),
        has_paid_items: items.some((item) => item.price > 0).toString(),
      },
    });

    // Create order in database
    await db.insert(orders).values({
      id: orderId,
      userId: userId,
      stripeSessionId: session.id,
      customerEmail: email,
      customerName: address
        ? `${address.firstName} ${address.lastName}`
        : "Guest User",
      customerPhone: address?.phone ?? null,
      requiresShipping: requiresShipping,
      shippingName: address ? `${address.firstName} ${address.lastName}` : null,
      shippingAddressLine1: address?.line1 ?? null,
      shippingAddressLine2: address?.line2 ?? null,
      shippingCity: address?.city ?? null,
      shippingState: address?.state ?? null,
      shippingPostalCode: address?.postalCode ?? null,
      shippingCountry: address?.country ?? null,
      billingAddressLine1: address?.line1 ?? "Not provided",
      billingAddressLine2: address?.line2 ?? null,
      billingCity: address?.city ?? "Not provided",
      billingState: address?.state ?? "Not provided",
      billingPostalCode: address?.postalCode ?? "Not provided",
      billingCountry: address?.country ?? "US",
      currency: "usd",
      amountSubtotal: Math.round(subtotal * 100), // Store in cents
      amountTotal: Math.round(total * 100), // Store in cents
      amountTax: 0, // Add tax calculation if needed
      amountShipping: 0, // Add shipping calculation if needed
      paymentStatus: "pending",
      shippingStatus: "pending",
    });

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        id: createId(),
        orderId,
        variantId: item.id,
        quantity: item.quantity,
        name: item.name,
        unitPrice: Math.round(item.price * 100), // Store in cents
        subtotal: Math.round(item.price * item.quantity * 100), // Store in cents
        variantName: item.name,
      });
    }

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
