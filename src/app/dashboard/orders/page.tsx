"use client";

// import { type inferRouterOutputs } from "@trpc/server";
// import { type AppRouter } from "~/server/api/root";
import { Suspense } from "react";
import OrdersContent from "./orders-content";

// type RouterOutputs = inferRouterOutputs<AppRouter>;
// type Order = NonNullable<RouterOutputs["order"]["getAll"]>[number];

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="mb-4 text-2xl font-bold">Orders</h1>
            <div className="bg-muted h-10 w-80 animate-pulse rounded-md" />
          </div>
          <div className="rounded-md border">
            <div className="bg-muted h-96 animate-pulse" />
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
