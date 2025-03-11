"use server";

import Stripe from "stripe";
import { stripe } from "~/utils/stripe/config";
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
} from "~/utils/helpers";

type Price = {
  id: string;
  type: "recurring" | "one_time";
  trial_period_days?: number;
};

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function checkoutWithStripe(
  price: Price,
  redirectPath = "/account",
): Promise<CheckoutResponse> {
  try {
    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
      },
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      cancel_url: getURL("/"),
      success_url: getURL(redirectPath),
    };

    if (price.type === "recurring") {
      params = {
        ...params,
        mode: "subscription",
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
        },
      };
    } else if (price.type === "one_time") {
      params = {
        ...params,
        mode: "payment",
      };
    }

    // Create a checkout session in Stripe
    const session = await stripe.checkout.sessions.create(params);

    if (!session) {
      throw new Error("Unable to create checkout session.");
    }

    return { sessionId: session.id };
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          "Please try again later or contact a system administrator.",
        ),
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator.",
        ),
      };
    }
  }
}

export async function createStripePortal(
  currentPath: string,
  customerId: string,
): Promise<string> {
  try {
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getURL("/account"),
    });

    if (!url) {
      throw new Error("Could not create billing portal");
    }

    return url;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        "Please try again later or contact a system administrator.",
      );
    } else {
      return getErrorRedirect(
        currentPath,
        "An unknown error occurred.",
        "Please try again later or contact a system administrator.",
      );
    }
  }
}
