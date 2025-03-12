"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { InferModel } from "drizzle-orm";
import {
  type subscriptionProducts,
  type subscriptionPrices,
  type subscriptions,
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
  products: SubscriptionProductWithPrices[];
  subscription:
    | (InferModel<typeof subscriptions> & {
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

export default function Pricing({
  user,
  products,
  subscription,
}: PricingProps) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product.prices.map((price) => price.interval),
      ),
    ),
  ) as BillingInterval[];
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    intervals[0] ?? "month",
  );
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push(
        `/signin?redirectTo=${encodeURIComponent(`/api/stripe/create-subscription-session?priceId=${priceId}`)}`,
      );
      return;
    }

    try {
      setPriceIdLoading(priceId);
      const response = await fetch("/api/stripe/create-subscription-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          returnUrl: pathname,
        }),
      });
      const data = (await response.json()) as CheckoutResponse;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new CheckoutError("Invalid response from server");
      }
    } catch (error: unknown) {
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

  if (!products?.length) {
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

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              T3 MEGA
            </Link>
            <div className="ml-8 flex items-center gap-6">
              <Link href="/blog" className="hover: text-sm text-zinc-400">
                Blog
              </Link>
              <Link href="/about" className="hover: text-sm text-zinc-400">
                About
              </Link>
              <Link href="/shop" className="hover: text-sm text-zinc-400">
                Store
              </Link>
              <Link
                href={user ? "/dashboard" : "/signin?redirectTo=/dashboard"}
                className="hover: text-sm text-zinc-400"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href={`/users/${user.id}`}
                  className="dark:hover: cursor-pointer text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                >
                  {user.email}
                </Link>
                <form action="/api/auth/signout" method="post">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className=""
                  >
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/signin">
                <Button variant="outline" size="sm" className="">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="bg-black pt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
              Pricing Plans
            </h1>
            <p className="m-auto mt-5 max-w-2xl text-xl text-zinc-200 sm:text-center sm:text-2xl">
              Start building for free, then add a site plan to go live. Account
              plans unlock additional features.
            </p>
            <div className="relative mt-6 flex self-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 sm:mt-8">
              {intervals.includes("month") && (
                <button
                  onClick={() => setBillingInterval("month")}
                  type="button"
                  className={cn(
                    billingInterval === "month"
                      ? "relative w-1/2 border-zinc-800 bg-zinc-700 shadow-sm"
                      : "relative ml-0.5 w-1/2 border border-transparent text-zinc-400",
                    "m-1 whitespace-nowrap rounded-md py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 sm:w-auto sm:px-8",
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
                      : "relative ml-0.5 w-1/2 border border-transparent text-zinc-400",
                    "m-1 whitespace-nowrap rounded-md py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 sm:w-auto sm:px-8",
                  )}
                >
                  Yearly billing
                </button>
              )}
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 space-y-0 sm:mt-16 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none">
            {products.map((product) => {
              const price = product.prices.find(
                (p) => p.interval === billingInterval,
              );
              if (!price) return null;

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
                          className="h-32 w-32 rounded-full object-cover"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-semibold leading-6">
                      {product.name}
                    </h2>
                    <p className="mt-4 text-zinc-300">{product.description}</p>
                    <p className="mt-8">
                      <span className="white text-5xl font-extrabold">
                        {priceString}
                      </span>
                      <span className="text-base font-medium text-zinc-100">
                        /{billingInterval}
                      </span>
                    </p>
                    <Button
                      type="button"
                      disabled={priceIdLoading === price.id}
                      onClick={() => handleSubscribe(price.id)}
                      className="mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold hover:bg-zinc-900"
                    >
                      {priceIdLoading === price.id
                        ? "Loading..."
                        : subscription?.price?.productId === product.id
                          ? "Manage"
                          : "Subscribe"}
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
