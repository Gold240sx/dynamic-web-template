"use client";

import { Suspense } from "react";
import { SubscriptionProductForm } from "~/components/forms/subscription-product-form";
import { Loader2 } from "lucide-react";

function NewSubscriptionProductPageContent() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-4xl font-bold">New Subscription Product</h1>
      <SubscriptionProductForm />
    </div>
  );
}

export default function NewSubscriptionProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewSubscriptionProductPageContent />
    </Suspense>
  );
}
