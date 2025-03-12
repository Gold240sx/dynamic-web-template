"use client";

import { LogOut, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";

export function UserNav() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.refresh();
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/signin">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name ?? user.email}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
            {user.status === "suspended" && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>Account Suspended</span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 dark:text-red-400"
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
