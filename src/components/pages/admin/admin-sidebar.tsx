import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Star,
  FileText,
  Package,
  ShoppingCart,
} from "lucide-react";

export function AdminSidebar() {
  return (
    <div className="bg-background flex h-full w-64 flex-col border-r">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <Link
          href="/admin"
          className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/admin/users"
          className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <Users className="h-4 w-4" />
          Users
        </Link>
        <Link
          href="/admin/pending-reviews"
          className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <Star className="h-4 w-4" />
          Pending Reviews
        </Link>
        <Link
          href="/admin/posts"
          className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <FileText className="h-4 w-4" />
          Posts
        </Link>
        <Link
          href="/admin/products"
          className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <Package className="h-4 w-4" />
          Products
        </Link>
        <Link
          href="/admin/orders"
          className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
        >
          <ShoppingCart className="h-4 w-4" />
          Orders
        </Link>
      </nav>
    </div>
  );
}
