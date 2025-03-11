import { Suspense } from "react";
import { formatDate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ShippingStatusDropdown } from "~/components/myComponents/shipping-status-dropdown";

interface OrderDetailsProps {
  order: {
    id: string;
    createdAt: Date;
    paymentStatus: string;
    shippingStatus: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    requiresShipping: boolean;
    shippingName: string | null;
    shippingAddressLine1: string | null;
    shippingAddressLine2: string | null;
    shippingCity: string | null;
    shippingState: string | null;
    shippingPostalCode: string | null;
    shippingCountry: string | null;
    billingAddressLine1: string | null;
    billingAddressLine2: string | null;
    billingCity: string | null;
    billingState: string | null;
    billingPostalCode: string | null;
    billingCountry: string | null;
    items: Array<{
      id: string;
      name: string;
      variantName: string;
      quantity: number;
      subtotal: number;
    }>;
    amountSubtotal: number;
    amountTax: number;
    amountShipping: number;
    amountTotal: number;
    shippingCarrier: string | null;
    trackingNumber: string | null;
  };
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <p className="text-zinc-500">Order #{order.id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Order Date</p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Payment Status</p>
              <Badge
                variant={
                  order.paymentStatus === "paid"
                    ? "success"
                    : order.paymentStatus === "pending"
                      ? "warning"
                      : "destructive"
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Shipping Status</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    order.shippingStatus === "delivered"
                      ? "success"
                      : order.shippingStatus === "shipped"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {order.shippingStatus}
                </Badge>
                <Suspense>
                  <ShippingStatusDropdown orderId={order.id} />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Name</p>
              <p>{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Email</p>
              <p>{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-sm text-zinc-500">Phone</p>
                <p>{order.customerPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {order.requiresShipping && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic">
                  <p>{order.shippingName}</p>
                  <p>{order.shippingAddressLine1}</p>
                  {order.shippingAddressLine2 && (
                    <p>{order.shippingAddressLine2}</p>
                  )}
                  <p>
                    {order.shippingCity}, {order.shippingState}{" "}
                    {order.shippingPostalCode}
                  </p>
                  <p>{order.shippingCountry}</p>
                </address>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic">
                  <p>{order.customerName}</p>
                  <p>{order.billingAddressLine1}</p>
                  {order.billingAddressLine2 && (
                    <p>{order.billingAddressLine2}</p>
                  )}
                  <p>
                    {order.billingCity}, {order.billingState}{" "}
                    {order.billingPostalCode}
                  </p>
                  <p>{order.billingCountry}</p>
                </address>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500">
                      {item.variantName} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.subtotal / 100).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${(order.amountSubtotal / 100).toFixed(2)}</p>
              </div>
              {order.amountTax > 0 && (
                <div className="flex justify-between">
                  <p>Tax</p>
                  <p>${(order.amountTax / 100).toFixed(2)}</p>
                </div>
              )}
              {order.amountShipping > 0 && (
                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p>${(order.amountShipping / 100).toFixed(2)}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <p>Total</p>
                <p>${(order.amountTotal / 100).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.shippingStatus === "shipped" && order.trackingNumber && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-zinc-500">Carrier</p>
                <p>{order.shippingCarrier}</p>
                <p className="text-sm text-zinc-500">Tracking Number</p>
                <p>{order.trackingNumber}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
