"use client";

import React from "react";
import PublicNavbar from "~/components/PublicNavbar";
import Link from "next/link";
import Subscriptions from "~/components/subscription/Subscriptions";
import { ReviewsSection } from "@/components/pages/home/reviews-section";
import type { SubscriptionProductWithPrices } from "@/server/db/types";
import { Skeleton } from "~/components/ui/skeleton";

const HomeContent = ({
  subscriptions,
}: {
  subscriptions: SubscriptionProductWithPrices[];
}) => {
  console.log("HomeContent received subscriptions:", {
    length: subscriptions?.length ?? 0,
    subscriptions: subscriptions?.map((s) => ({
      id: s.id,
      name: s.name,
      pricesCount: s.prices?.length ?? 0,
      prices: s.prices?.map((p) => ({
        id: p.id,
        interval: p.interval,
        unitAmount: p.unitAmount,
        includesTrial: p.includesTrial,
        trialLength: p.trialLength,
        trialUnit: p.trialUnit,
      })),
    })),
  });

  return (
    <>
      <PublicNavbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container mt-10 flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">T3 MEGA</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold text-white">First Steps →</h3>
              <div className="text-lg text-zinc-400">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold text-white">Documentation →</h3>
              <div className="text-lg text-zinc-400">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          {!subscriptions ? (
            <div className="w-full max-w-6xl space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[400px] w-full" />
                ))}
              </div>
            </div>
          ) : (
            <Subscriptions
              subscriptions={subscriptions}
              subscription={null}
              user={null}
            />
          )}
          <ReviewsSection />
        </div>
      </main>
    </>
  );
};

export default HomeContent;
