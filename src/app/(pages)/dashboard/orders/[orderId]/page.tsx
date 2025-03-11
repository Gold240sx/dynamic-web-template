"use client";
import { notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { OrderDetails } from "../../../../../components/pages/orders/order-details";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { data: order, isLoading } = api.order.getById.useQuery({
    id: orderId as string,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    notFound();
  }

  return <OrderDetails order={order} />;
}
