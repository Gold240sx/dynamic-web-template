import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/admin"
        className="hover:text-primary text-sm font-medium transition-colors"
      >
        Dashboard
      </Link>
      <Link
        href="/admin/products"
        className="hover:text-primary text-sm font-medium transition-colors"
      >
        Products
      </Link>
      <Link
        href="/admin/categories"
        className="hover:text-primary text-sm font-medium transition-colors"
      >
        Categories
      </Link>
      <Link
        href="/admin/settings/shipping"
        className="hover:text-primary text-sm font-medium transition-colors"
      >
        Shipping Settings
      </Link>
    </nav>
  );
}
