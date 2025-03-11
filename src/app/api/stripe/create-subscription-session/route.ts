import { cookies } from "next/headers";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
import { stripe } from "@/lib/stripe";

interface CheckoutBody {
  priceId: string;
  returnUrl: string;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
      return Response.json(
        { error: "You must be signed in to subscribe" },
        { status: 401 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId.value),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as CheckoutBody;
    const { priceId, returnUrl } = body;

    if (!priceId) {
      return Response.json({ error: "Price ID is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      billing_address_collection: "required",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnUrl}`,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Error creating subscription checkout session:", error);
    return Response.json(
      { error: "Failed to create subscription checkout session" },
      { status: 500 },
    );
  }
}
