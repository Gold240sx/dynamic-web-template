"use client";

import React from "react";
import { SubscriptionProductForm } from "@/components/forms/subscription-product-form";
import type { RouterOutputs } from "@/trpc/shared";

interface FormWrapperProps {
  initialData: RouterOutputs["subscription"]["getProduct"];
}

export function SubscriptionProductFormWrapper({
  initialData,
}: FormWrapperProps) {
  const formattedData = {
    name: initialData.name,
    description: initialData.description ?? undefined,
    active: initialData.active,
    image: initialData.image ?? undefined,
    metadata:
      typeof initialData.metadata === "object"
        ? (initialData.metadata as Record<string, string>)
        : undefined,
    prices: initialData.prices.map((price) => ({
      active: price.active,
      currency: price.currency,
      interval: price.interval as "month" | "year",
      type: price.type as "one_time" | "recurring",
      unitAmount: price.unitAmount,
      includesTrial: price.trialPeriodDays ? true : false,
      requires_cc: true,
      trialLength: price.trialPeriodDays ?? undefined,
      trialUnit: (price.trialPeriodDays ? "day" : undefined) as
        | "hour"
        | "day"
        | "week"
        | "month"
        | undefined,
    })),
  };

  return <SubscriptionProductForm initialData={formattedData} />;
}
