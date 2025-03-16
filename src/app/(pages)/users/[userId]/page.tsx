import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getInitials } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getUserProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      subscriptions: {
        with: {
          price: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserProfile(userId);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name} - Profile`,
    description: `Profile page for ${user.name}`,
  };
}

export default async function UserPage({ params }: PageProps) {
  const { userId } = await params;
  const user = await getUserProfile(userId);

  if (!user) {
    notFound();
  }

  const activeSubscription = user.subscriptions?.find(
    (sub) => sub.status === "active",
  );

  return (
    <div className="container mx-auto py-24">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Profile</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={activeSubscription ? "success" : "secondary"}>
                {activeSubscription ? "Currently Subscribed" : "Not Subscribed"}
              </Badge>
              {activeSubscription && (
                <Badge variant="outline">
                  {activeSubscription.price.product.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          {user.subscriptions && user.subscriptions.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold">Subscriptions</h3>
              <div className="space-y-4">
                {user.subscriptions.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {subscription.price.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {(
                              subscription.price.unitAmount / 100
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: subscription.price.currency,
                            })}{" "}
                            / {subscription.price.interval}
                          </p>
                        </div>
                        <div className="text-sm">
                          Status:{" "}
                          <span
                            className={
                              subscription.status === "active"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }
                          >
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add other user details as needed */}
        </CardContent>
      </Card>
    </div>
  );
}
