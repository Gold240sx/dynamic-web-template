"use client";

import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { DataTable } from "~/components/ui/data-table";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: Date;
}

export default function OrdersContent() {
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [paymentStatus, setPaymentStatus] = useQueryState("payment", {
    defaultValue: "all",
  });
  const [shippingStatus, setShippingStatus] = useQueryState("shipping", {
    defaultValue: "all",
  });

  const { data: orders, isLoading } = api.order.getAll.useQuery({
    search: search ?? "",
    paymentStatus: paymentStatus ?? "all",
    shippingStatus: shippingStatus ?? "all",
  });

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span
          className="cursor-pointer text-blue-500 hover:underline"
          onClick={() =>
            void router.push(`/dashboard/orders/${row.original.id}`)
          }
        >
          {row.original.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div>{row.original.customerName}</div>
          <div className="text-sm text-zinc-500">
            {row.original.customerEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amountTotal",
      header: "Total",
      cell: ({ row }) => (
        <span>${(row.original.amountTotal / 100).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.paymentStatus === "paid"
              ? "bg-green-100 text-green-800"
              : row.original.paymentStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.paymentStatus}
        </span>
      ),
    },
    {
      accessorKey: "shippingStatus",
      header: "Shipping Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.original.shippingStatus === "delivered"
              ? "bg-green-100 text-green-800"
              : row.original.shippingStatus === "shipped"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.original.shippingStatus}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-4xl font-bold">Orders</h1>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search orders..."
          value={search ?? ""}
          onChange={(e) => void setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={paymentStatus ?? "all"}
          onValueChange={(value) => void setPaymentStatus(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={shippingStatus ?? "all"}
          onValueChange={(value) => void setShippingStatus(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Shipping Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={orders ?? []} isLoading={isLoading} />
    </div>
  );
}
