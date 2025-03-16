"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { InferModel } from "drizzle-orm";
import {
  type subscriptionProducts,
  type subscriptionPrices,
  type subscriptions as SubscriptionsType,
  type users,
} from "@/server/db/schema";
import { type SubscriptionProductWithPrices } from "@/server/db/types";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/use-auth";
import Link from "next/link";
import Image from "next/image";

type BillingInterval = "month" | "year";

interface CheckoutResponse {
  url?: string;
  error?: string;
}

interface PricingProps {
  user: InferModel<typeof users> | null;
  subscriptions: SubscriptionProductWithPrices[];
  subscription:
    | (InferModel<typeof SubscriptionsType> & {
        price?: {
          productId: string;
        } | null;
      })
    | null;
}

class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

export default function Subscriptions({
  user,
  subscriptions = [],
  subscription,
}: PricingProps) {
  console.log("Subscriptions component received:", {
    subscriptionsLength: subscriptions.length,
    subscriptions: JSON.stringify(subscriptions, null, 2),
  });

  // Add useEffect to handle priceId in URL after sign-in
  useEffect(() => {
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPriceId = urlParams.get("priceId");

      if (urlPriceId) {
        console.log(
          "Found priceId in URL after sign-in, creating checkout session",
        );
        window.location.href = `/api/stripe/create-subscription-session?priceId=${urlPriceId}`;
      }
    }
  }, [user]);

  const intervals = Array.from(
    new Set(
      subscriptions.flatMap((product) =>
        product.prices.map((price) => price.interval),
      ),
    ),
  ) as BillingInterval[];
  console.log("Available intervals:", intervals);

  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    intervals[0] ?? "month",
  );
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams();
      searchParams.set("priceId", priceId);
      const returnUrl = `${currentPath}?${searchParams.toString()}`;
      router.push(`/signin?redirectTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setPriceIdLoading(priceId);
      console.log("Creating subscription session for price:", priceId);

      // If we have a priceId in the URL, use it instead of the passed priceId
      const urlParams = new URLSearchParams(window.location.search);
      const urlPriceId = urlParams.get("priceId");

      console.log("URL parameters:", {
        urlPriceId,
        passedPriceId: priceId,
        fullUrl: window.location.href,
      });

      // Use the URL priceId if it exists, otherwise use the passed priceId
      const finalPriceId = urlPriceId ?? priceId;
      console.log("Using priceId:", finalPriceId);

      // Always use the GET endpoint for simplicity
      console.log("Redirecting to GET endpoint");
      window.location.href = `/api/stripe/create-subscription-session?priceId=${finalPriceId}`;
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      if (error instanceof CheckoutError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred during checkout");
      }
      setPriceIdLoading(undefined);
    }
  };

  if (!subscriptions?.length) {
    console.log("No subscriptions found");
    return (
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <p className="text-4xl font-extrabold sm:text-center sm:text-6xl">
              No subscription pricing plans found.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const aPrice =
      a.prices.find((p) => p.interval === billingInterval)?.unitAmount ?? 0;
    const bPrice =
      b.prices.find((p) => p.interval === billingInterval)?.unitAmount ?? 0;
    return aPrice - bPrice;
  });

  console.log("Sorted subscriptions:", {
    billingInterval,
    subscriptions: sortedSubscriptions.map((s) => ({
      id: s.id,
      name: s.name,
      prices: s.prices.map((p) => ({
        id: p.id,
        interval: p.interval,
        unitAmount: p.unitAmount,
      })),
    })),
  });

  return (
    <>
      <section className="bg-black pt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Subscription Options
            </h1>
            <p className="m-auto mt-5 max-w-2xl text-xl text-zinc-200 sm:text-center sm:text-2xl">
              Start building for free, then add a site plan to go live. Account
              plans unlock additional features.
            </p>
            {intervals.length > 0 && (
              <div className="relative mt-6 flex self-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 sm:mt-8">
                {intervals.includes("month") && (
                  <button
                    onClick={() => setBillingInterval("month")}
                    type="button"
                    className={cn(
                      billingInterval === "month"
                        ? "relative w-1/2 border-zinc-800 bg-zinc-700 shadow-sm"
                        : "relative ml-0.5 w-1/2 border border-transparent",
                      "m-1 whitespace-nowrap rounded-md py-2 text-sm font-medium text-white focus:z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 sm:w-auto sm:px-8",
                    )}
                  >
                    Monthly billing
                  </button>
                )}
                {intervals.includes("year") && (
                  <button
                    onClick={() => setBillingInterval("year")}
                    type="button"
                    className={cn(
                      billingInterval === "year"
                        ? "relative w-1/2 border-zinc-800 bg-zinc-700 shadow-sm"
                        : "relative ml-0.5 w-1/2 border border-transparent",
                      "m-1 whitespace-nowrap rounded-md py-2 text-sm font-medium text-white focus:z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 sm:w-auto sm:px-8",
                    )}
                  >
                    Yearly billing
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 space-y-0 sm:mt-16 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none">
            {sortedSubscriptions.map((product) => {
              const price = product.prices.find(
                (p) => p.interval === billingInterval,
              );

              console.log("Rendering product:", {
                productId: product.id,
                productName: product.name,
                price,
                billingInterval,
                availablePrices: product.prices,
              });

              if (!price) {
                console.log(
                  `No price found for interval ${billingInterval} in product ${product.id}`,
                );
                return null;
              }

              const priceString = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: price.currency,
                minimumFractionDigits: 0,
              }).format(price.unitAmount / 100);

              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex flex-col divide-y divide-zinc-600 rounded-lg bg-zinc-900 shadow-sm",
                    {
                      "border border-pink-500": subscription
                        ? product.id === subscription.price?.productId
                        : product.name === "Freelancer",
                    },
                    "flex-1",
                    "basis-1/3",
                    "max-w-xs",
                  )}
                >
                  <div className="p-6">
                    {product.image && (
                      <div className="mb-4 flex justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="h-32 w-32 object-cover"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-semibold leading-6 text-white">
                      {product.name}
                    </h2>
                    <p className="mt-4 text-zinc-400">{product.description}</p>
                    <p className="mt-8">
                      <span className="text-5xl font-extrabold text-white">
                        {priceString}
                      </span>
                      <span className="text-base font-medium text-zinc-400">
                        /{billingInterval}
                      </span>
                    </p>
                    {price.includesTrial ? (
                      <p className="mt-4 text-sm text-zinc-400">
                        Includes a {price.trialLength}-{price.trialUnit} free
                        trial
                      </p>
                    ) : (
                      <p className="mt-[4.3rem] text-sm text-zinc-400"></p>
                    )}
                    <Button
                      type="button"
                      disabled={priceIdLoading === price.id}
                      onClick={() => handleSubscribe(price.id)}
                      className={cn(
                        "mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold",
                        {
                          "bg-white text-black hover:bg-zinc-100":
                            !subscription?.price?.productId,
                          "bg-zinc-800 text-white hover:bg-zinc-700":
                            subscription?.price?.productId === product.id,
                        },
                      )}
                    >
                      {priceIdLoading === price.id
                        ? "Loading..."
                        : subscription?.price?.productId === product.id
                          ? "Manage"
                          : price.includesTrial
                            ? price.requires_cc
                              ? "Start Trial (Card Required)"
                              : "Start Free Trial"
                            : "Subscribe Now"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
