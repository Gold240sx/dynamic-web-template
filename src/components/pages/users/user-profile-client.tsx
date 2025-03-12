"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { formatDate } from "~/lib/utils";
import { ContactInfoForm } from "~/components/forms/contact-info-form";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface UserProfileClientProps {
  userId: string;
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const utils = api.useUtils();

  const { data: user, isLoading } = api.user.getById.useQuery({ id: userId });

  const { data: orders, isLoading: ordersLoading } =
    api.order.getByUserId.useQuery({
      userId: userId,
    });

  const { mutate: updateRole } = api.user.updateRole.useMutation({
    onSuccess: () => {
      startTransition(() => {
        void utils.user.getById.invalidate({ id: userId });
      });
      toast.success("User role updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateStatus } = api.user.updateStatus.useMutation({
    onSuccess: () => {
      startTransition(() => {
        void utils.user.getById.invalidate({ id: userId });
      });
      toast.success("User status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updatePermissions } =
    api.userPermissions.updatePermissions.useMutation({
      onSuccess: () => {
        startTransition(() => {
          void utils.user.getById.invalidate({ id: userId });
        });
        toast.success("User permissions updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {user.name?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span>
                  {formatDistanceToNow(new Date(user.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Role</p>
                <p className="text-muted-foreground text-sm">
                  Current role:{" "}
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </p>
              </div>
              <Button
                variant={user.role === "admin" ? "destructive" : "default"}
                onClick={() =>
                  updateRole({
                    userId: user.id,
                    role: user.role === "admin" ? "user" : "admin",
                  })
                }
                disabled={isPending}
              >
                Make {user.role === "admin" ? "User" : "Admin"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-muted-foreground text-sm">
                  Current status:{" "}
                  <Badge
                    variant={
                      user.status === "active" ? "success" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </p>
              </div>
              <Button
                variant={user.status === "active" ? "destructive" : "default"}
                onClick={() =>
                  updateStatus({
                    userId: user.id,
                    status: user.status === "active" ? "suspended" : "active",
                  })
                }
                disabled={isPending}
              >
                {user.status === "active" ? "Suspend" : "Activate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Can Comment</p>
                <p className="text-muted-foreground text-sm">
                  Allow user to comment on blog posts
                </p>
              </div>
              <Switch
                checked={user.canComment ?? false}
                onCheckedChange={(checked) =>
                  updatePermissions({
                    userId: user.id,
                    canComment: checked,
                  })
                }
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Can Review</p>
                <p className="text-muted-foreground text-sm">
                  Allow user to review products and services
                </p>
              </div>
              <Switch
                checked={user.canReview ?? false}
                onCheckedChange={(checked) =>
                  updatePermissions({
                    userId: user.id,
                    canReview: checked,
                  })
                }
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Can Respond</p>
                <p className="text-muted-foreground text-sm">
                  Allow user to respond to comments and reviews
                </p>
              </div>
              <Switch
                checked={user.canRespond ?? false}
                onCheckedChange={(checked) =>
                  updatePermissions({
                    userId: user.id,
                    canRespond: checked,
                  })
                }
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
