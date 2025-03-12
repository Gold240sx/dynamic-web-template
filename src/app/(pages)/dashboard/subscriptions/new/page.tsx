"use client";

import { SubscriptionProductForm } from "~/components/forms/subscription-product-form";

export default function NewSubscriptionProductPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-4xl font-bold">New Subscription Product</h1>
      <SubscriptionProductForm />
    </div>
  );
}
