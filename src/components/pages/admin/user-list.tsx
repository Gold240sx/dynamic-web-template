"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface UserListProps {
  searchQuery: string;
}

export function UserList({ searchQuery }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: users, isLoading } = api.user.getAll.useQuery({
    search: searchQuery,
  });

  const { mutate: updateUserRole } = api.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      void utils.user.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateUserStatus } = api.user.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated successfully");
      void utils.user.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!users) {
    return <div>No users found</div>;
  }

  return (
    <>
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {users.users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {user.name?.slice(0, 2).toUpperCase() ?? "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {user.name ?? "Unknown User"}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.role === "admin"}
                    onCheckedChange={(checked) =>
                      updateUserRole({
                        userId: user.id,
                        role: checked ? "admin" : "user",
                      })
                    }
                  />
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.status === "active"}
                    onCheckedChange={(checked) =>
                      updateUserStatus({
                        userId: user.id,
                        status: checked ? "active" : "suspended",
                      })
                    }
                  />
                  <Badge
                    variant={
                      user.status === "active" ? "success" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(user.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {users.users.find((u) => u.id === selectedUser) && (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Name:</span>{" "}
                    {users.users.find((u) => u.id === selectedUser)?.name}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    {users.users.find((u) => u.id === selectedUser)?.email}
                  </div>
                  <div>
                    <span className="font-semibold">Role:</span>{" "}
                    {users.users.find((u) => u.id === selectedUser)?.role}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {users.users.find((u) => u.id === selectedUser)?.status}
                  </div>
                  <div>
                    <span className="font-semibold">Joined:</span>{" "}
                    {formatDistanceToNow(
                      new Date(
                        users.users.find((u) => u.id === selectedUser)
                          ?.createdAt ?? "",
                      ),
                      { addSuffix: true },
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
