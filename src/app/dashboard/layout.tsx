"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, Settings } from "lucide-react";
import { cn } from "~/lib/utils";

const navigation = [
  {
    name: "Store",
    href: "/dashboard/store",
    icon: Store,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 text-white">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            Dashboard
          </Link>
        </div>
        <nav className="space-y-1 px-3 py-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="h-16 border-b bg-white">
          {/* Add header content here if needed */}
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
