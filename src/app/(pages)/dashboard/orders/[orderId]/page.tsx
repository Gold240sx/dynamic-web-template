"use client";
import { notFound } from "next/navigation";
import { api } from "~/trpc/react";
import { OrderDetails } from "../../../../../components/pages/orders/order-details";
import { useParams } from "next/navigation";

type OrderDetailsType = React.ComponentProps<typeof OrderDetails>["order"];

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { data: orderData, isLoading } = api.order.getById.useQuery({
    id: orderId as string,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!orderData) {
    notFound();
  }

  // Transform the order data to match the expected type
  const order: OrderDetailsType = {
    id: orderData.id,
    createdAt: orderData.createdAt,
    paymentStatus: orderData.paymentStatus,
    shippingStatus: orderData.shippingStatus,
    customerName: orderData.customerName,
    customerEmail: orderData.customerEmail,
    customerPhone: orderData.customerPhone,
    requiresShipping: orderData.requiresShipping,
    shippingName: orderData.shippingName,
    shippingAddressLine1: orderData.shippingAddressLine1,
    shippingAddressLine2: orderData.shippingAddressLine2,
    shippingCity: orderData.shippingCity,
    shippingState: orderData.shippingState,
    shippingPostalCode: orderData.shippingPostalCode,
    shippingCountry: orderData.shippingCountry,
    billingAddressLine1: orderData.billingAddressLine1,
    billingAddressLine2: orderData.billingAddressLine2,
    billingCity: orderData.billingCity,
    billingState: orderData.billingState,
    billingPostalCode: orderData.billingPostalCode,
    billingCountry: orderData.billingCountry,
    items: orderData.items.map((item) => ({
      id: item.id,
      name: item.name,
      variantName: item.variantName,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    amountSubtotal: orderData.amountSubtotal,
    amountTax: orderData.amountTax,
    amountShipping: orderData.amountShipping,
    amountTotal: orderData.amountTotal,
    shippingCarrier: orderData.shippingCarrier,
    trackingNumber: orderData.trackingNumber,
  };

  return <OrderDetails order={order} />;
}
