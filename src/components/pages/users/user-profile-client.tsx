"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { ContactInfoForm } from "~/components/forms/contact-info-form";

interface UserProfileClientProps {
  userId: string;
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const router = useRouter();

  const { data: user, isLoading: userLoading } = api.user.getById.useQuery({
    id: userId,
  });

  const { data: orders, isLoading: ordersLoading } =
    api.order.getByUserId.useQuery({
      userId: userId,
    });

  if (userLoading || ordersLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-64 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-4xl font-bold">User Profile</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-xl font-semibold">User Information</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Name</dt>
                <dd className="font-medium">{user.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Role</dt>
                <dd>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Member Since</dt>
                <dd className="font-medium">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
            <ContactInfoForm userId={user.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-6 dark:border-zinc-800">
            <h2 className="mb-4 text-xl font-semibold">Order History</h2>
            <div className="space-y-4">
              {orders?.length === 0 ? (
                <p className="text-zinc-500">No orders found</p>
              ) : (
                orders?.map((order) => (
                  <div
                    key={order.id}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-lg bg-zinc-50 p-4 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          Order #{order.id.slice(0, 8)}...
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : order.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(order.amountTotal / 100).toFixed(2)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {order.items?.length} items
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
