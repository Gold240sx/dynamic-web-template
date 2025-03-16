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
      interval: price.interval,
      type: price.type,
      unitAmount: price.unitAmount,
      includesTrial: price.includesTrial ?? false,
      requires_cc: price.requires_cc ?? true,
      trialLength: price.trialLength,
      trialUnit: price.trialUnit,
    })),
  };

  return (
    <SubscriptionProductForm
      initialData={formattedData}
      productId={initialData.id}
    />
  );
}
