import Link from "next/link";
import { api } from "@/trpc/server";
import Subscriptions from "~/components/subscription/Subscriptions";
import { ReviewsSection } from "@/components/pages/home/reviews-section";
import type { SubscriptionProductWithPrices } from "@/server/db/types";
import PublicNavbar from "~/components/PublicNavbar";
import HomeContent from "./homeContent";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  console.log("Fetching subscription products...");
  try {
    const subscriptions =
      (await api.subscription.getAllProducts()) as SubscriptionProductWithPrices[];
    console.log("Fetched subscriptions:", {
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

    return <HomeContent subscriptions={subscriptions} />;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return <HomeContent subscriptions={[]} />;
  }
}
