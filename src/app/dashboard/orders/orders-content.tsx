"use client";

import { useQueryState } from "nuqs";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import Link from "next/link";
import { formatDate } from "~/lib/utils";
// import { type inferRouterOutputs } from "@trpc/server";
// import { type AppRouter } from "~/server/api/root";

// type RouterOutputs = inferRouterOutputs<AppRouter>;
// type Order = NonNullable<RouterOutputs["order"]["getAll"]>[number];

export default function OrdersContent() {
  const [search, setSearch] = useQueryState("q");
  const { data: orders, isLoading } = api.order.getAll.useQuery({
    query: search ?? undefined,
    limit: 50,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!orders) return <div>No orders found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">Orders</h1>
        <Input
          type="search"
          placeholder="Search by email..."
          value={search ?? ""}
          onChange={(e) => void setSearch(e.target.value || null)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b text-sm">
              <th className="p-4 text-left font-medium">Order ID</th>
              <th className="p-4 text-left font-medium">Customer</th>
              <th className="p-4 text-left font-medium">Date</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-4">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.id}
                  </Link>
                </td>
                <td className="p-4">{order.customerEmail}</td>
                <td className="p-4">{formatDate(new Date(order.createdAt))}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4">${(order.amountTotal / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
