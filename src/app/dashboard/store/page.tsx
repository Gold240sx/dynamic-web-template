"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { formatCurrency } from "~/lib/utils";

export default function DashboardStorePage() {
  const { data: stats } = api.product.getStats.useQuery();
  const { data: products } = api.product.getAll.useQuery({ onlyLive: false });

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Store Dashboard</h1>
        <Link
          href="/dashboard/store/new"
          className="rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
        >
          Add Product
        </Link>
      </div>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white/5 p-6">
            <h3 className="text-sm font-medium text-zinc-400">
              Total Products
            </h3>
            <p className="mt-2 text-3xl font-bold">{stats.totalProducts}</p>
          </div>
          <div className="rounded-lg border bg-white/5 p-6">
            <h3 className="text-sm font-medium text-zinc-400">Live Products</h3>
            <p className="mt-2 text-3xl font-bold">{stats.liveProducts}</p>
          </div>
          <div className="rounded-lg border bg-white/5 p-6">
            <h3 className="text-sm font-medium text-zinc-400">
              Digital Products
            </h3>
            <p className="mt-2 text-3xl font-bold">{stats.digitalProducts}</p>
          </div>
          <div className="rounded-lg border bg-white/5 p-6">
            <h3 className="text-sm font-medium text-zinc-400">
              Physical Products
            </h3>
            <p className="mt-2 text-3xl font-bold">{stats.physicalProducts}</p>
          </div>
        </div>
      )}

      {products && (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-white/5">
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-800">
                    <td className="whitespace-nowrap px-4 py-3">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatCurrency(product.variants[0]?.price ?? 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {product.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {product.variants[0]?.isDigital ? "Digital" : "Physical"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {product.variants[0]?.stock === -1
                        ? "∞"
                        : (product.variants[0]?.stock ?? 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          product.isLive
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.isLive ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/dashboard/store/${product.id}`}
                        className="text-sm text-zinc-400 hover:text-white"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
