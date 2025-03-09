"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = api.order.getById.useQuery({ id });

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/orders"
          className="text-blue-600 hover:underline"
        >
          ← Back to Orders
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Order Details</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {order.customerName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.customerEmail}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {order.customerPhone ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Payment Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <span className="font-medium">Subtotal:</span> $
                {(order.amountSubtotal / 100).toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Tax:</span> $
                {(order.amountTax / 100).toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Shipping:</span> $
                {(order.amountShipping / 100).toFixed(2)}
              </p>
              <p className="font-semibold">
                <span className="font-medium">Total:</span> $
                {(order.amountTotal / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {order.requiresShipping && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h2 className="mb-4 text-lg font-semibold">
                Shipping Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      order.shippingStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.shippingStatus === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.shippingStatus}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.shippingName}
                </p>
                <p>
                  <span className="font-medium">Address:</span>
                  <br />
                  {order.shippingAddressLine1}
                  {order.shippingAddressLine2 && (
                    <>
                      <br />
                      {order.shippingAddressLine2}
                    </>
                  )}
                  <br />
                  {order.shippingCity}, {order.shippingState}{" "}
                  {order.shippingPostalCode}
                  <br />
                  {order.shippingCountry}
                </p>
                {order.shippingCarrier && (
                  <p>
                    <span className="font-medium">Carrier:</span>{" "}
                    {order.shippingCarrier}
                  </p>
                )}
                {order.trackingNumber && (
                  <p>
                    <span className="font-medium">Tracking:</span>{" "}
                    {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h2 className="mb-4 text-lg font-semibold">Billing Address</h2>
              <div className="space-y-2">
                <p>
                  {order.billingAddressLine1}
                  {order.billingAddressLine2 && (
                    <>
                      <br />
                      {order.billingAddressLine2}
                    </>
                  )}
                  <br />
                  {order.billingCity}, {order.billingState}{" "}
                  {order.billingPostalCode}
                  <br />
                  {order.billingCountry}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Order placed on {formatDate(new Date(order.createdAt))}
        </p>
      </div>
    </div>
  );
}
