"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Package,
  Settings,
  FileText,
  MessageSquare,
  CheckSquare,
  Users,
  CreditCard,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Suspense } from "react";
import { api } from "~/trpc/react";
import { NotificationBadge } from "~/components/ui/notification-badge";
import { useAuth } from "~/hooks/use-auth";
import { Navigation } from "~/components/navigation";

const navigation = [
  {
    name: "Blog",
    href: "/dashboard/blog",
    icon: FileText,
  },
  {
    name: "Store",
    href: "/dashboard/store",
    icon: Store,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: Package,
    showBadge: true,
    badgeType: "orders",
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const approvalNavigation = [
  {
    name: "Pending Comments",
    href: "/dashboard/approvals/comments",
    icon: MessageSquare,
    showBadge: true,
    badgeType: "comments",
  },
  {
    name: "Pending Reviews",
    href: "/dashboard/approvals/reviews",
    icon: CheckSquare,
    showBadge: true,
    badgeType: "reviews",
  },
];

function DashboardNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getBadgeCount = (type: "comments" | "reviews" | "orders") => {
    return 0;
  };

  return (
    <div className="">
      <nav className="space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-colors",
                  isActive
                    ? "bg-zinc-800"
                    : "hover: text-zinc-400 hover:bg-zinc-800",
                )}
              >
                <span className="relative inline-block pr-2">
                  <item.icon className="h-6 w-6" />
                  {item.showBadge && (
                    <NotificationBadge
                      count={getBadgeCount(
                        item.badgeType as "comments" | "reviews" | "orders",
                      )}
                    />
                  )}
                </span>
                {item.name}
              </Link>
            </div>
          );
        })}

        <div className="my-4 border-t border-zinc-800" />

        {approvalNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-colors",
                  isActive
                    ? "bg-zinc-800"
                    : "hover: text-zinc-400 hover:bg-zinc-800",
                )}
              >
                <span className="relative inline-block">
                  <item.icon className="h-6 w-6" />
                  {item.showBadge && (
                    <NotificationBadge
                      count={getBadgeCount(
                        item.badgeType as "comments" | "reviews" | "orders",
                      )}
                    />
                  )}
                </span>
                {item.name}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div id="sidebar" className="w-64 bg-zinc-900 print:!hidden">
          <div className="flex h-16 items-center px-6">
            <Link href="/dashboard" className="text-lg font-semibold">
              Dashboard
            </Link>
          </div>
          <Suspense fallback={<div className="px-3 py-2">Loading...</div>}>
            <DashboardNav />
          </Suspense>
        </div>

        {/* Main content */}
        <div className="flex-1 border-none print:m-0 print:w-full">
          {children}
        </div>
      </div>
    </>
  );
}
