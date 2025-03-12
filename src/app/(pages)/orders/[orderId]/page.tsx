"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import OrderDetailsClient from "~/components/pages/orders/order-details-client";

export default function OrderDetailsPage() {
  const { orderId } = useParams();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetailsClient orderId={orderId as string} />
    </Suspense>
  );
}
