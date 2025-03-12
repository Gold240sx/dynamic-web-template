"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "~/components/ui/button";
import { UserNav } from "./myComponents/user-nav";
import { api } from "~/trpc/react";
import { NotificationBadge } from "./ui/notification-badge";

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: notifications } = api.notifications.getUnviewedCounts.useQuery(
    undefined,
    { refetchInterval: 30000 }, // Refetch every 30 seconds
  );

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
    {
      href: "/dashboard",
      label: "Dashboard",
      showBadge: user?.role === "admin" && (notifications?.total ?? 0) > 0,
    },
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 print:!hidden">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 dark:text-white"
        >
          T3 Store
        </Link>
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <div key={link.href} className="relative">
              <Link
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {link.label}
              </Link>
              {link.showBadge && (
                <NotificationBadge count={notifications?.total} />
              )}
            </div>
          ))}
          <div className="flex items-center space-x-4">
            {user ? (
              <UserNav />
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
