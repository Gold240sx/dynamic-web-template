"use client";

import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useNuqsString } from "~/lib/hooks/useNuqs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { CartButton } from "./cart-button";
import { api } from "~/trpc/react";
import Link from "next/link";

interface TopBarProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => Promise<void>;
  selectedCategory?: string;
  showFilters?: boolean;
}

export function TopBar({ cartItemCount = 0, onCartClick }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useNuqsString("q", "");
  const [category, setCategory] = useNuqsString("category", "all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { data: categories = [] } = api.category.all.useQuery();

  const isShopPage = pathname === "/shop";
  const isProductPage = pathname.startsWith("/shop/") && pathname !== "/shop";

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    },
    [],
  );

  const handleSearchChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      await setSearchQuery(value || "");
    },
    [setSearchQuery],
  );

  const handleClearSearch = useCallback(async () => {
    await setSearchQuery("");
    setIsSearchOpen(false);
  }, [setSearchQuery]);

  const handleCategoryClick = useCallback(
    async (newCategory: string) => {
      await setCategory(newCategory);
    },
    [setCategory],
  );

  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/shop" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Shop</span>
          </Link>
          {isShopPage && (
            <nav className="flex items-center space-x-2">
              <Button
                variant={category === "all" ? "default" : "ghost"}
                onClick={() => void handleCategoryClick("all")}
                className="h-8"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "ghost"}
                  onClick={() => void handleCategoryClick(cat.id)}
                  className="h-8"
                >
                  {cat.name}
                </Button>
              ))}
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center space-x-2">
            {isShopPage && (
              <div className="relative">
                {isSearchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center"
                  >
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="h-9 w-[200px] pr-12"
                      value={searchQuery}
                      onChange={(e) => void handleSearchChange(e)}
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void handleClearSearch()}
                        className="absolute right-0 top-0 h-9 w-9 px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    className="h-9 w-9"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <CartButton count={cartItemCount} onClick={onCartClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
