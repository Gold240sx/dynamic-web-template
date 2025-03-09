import { NextResponse } from "next/server";
import { stripe } from "~/lib/stripe";
import { z } from "zod";
import Stripe from "stripe";

const productSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  images: z.array(z.string().url()).optional(),
});

type ProductInput = z.infer<typeof productSchema>;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductInput;
    const validatedData = productSchema.parse(body);

    // Create the product in Stripe
    const product = await stripe.products.create({
      name: validatedData.name,
      description: validatedData.description,
      images: validatedData.images,
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(validatedData.price * 100), // Convert to cents
      currency: "usd",
    });

    return NextResponse.json({
      productId: product.id,
      priceId: price.id,
    });
  } catch (err) {
    console.error("Error creating Stripe product:", err);
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

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as ProductInput;
    const validatedData = productSchema.parse(body);

    // Update the product in Stripe
    const product = await stripe.products.update(productId, {
      name: validatedData.name,
      description: validatedData.description,
      images: validatedData.images,
    });

    // Create a new price if the price has changed
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(validatedData.price * 100),
      currency: "usd",
    });

    return NextResponse.json({
      productId: product.id,
      priceId: price.id,
    });
  } catch (err) {
    console.error("Error updating Stripe product:", err);
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
