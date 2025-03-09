"use client";

import { Search, ShoppingBag, X } from "lucide-react";
import { useState, useEffect, useRef, type FC } from "react";
import { motion, useIsomorphicLayoutEffect } from "framer-motion";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useSearchParams, usePathname } from "next/navigation";
import { useNuqs } from "~/lib/hooks/useNuqs";
import { LinkComponent } from "./link-component";
import { useCallback } from "react";
import { useQueryState } from "nuqs";

interface TopBarProps {
  cartItemCount: number;
  onCartClick: () => void;
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  showFilters?: boolean;
}

export const TopBar: FC<TopBarProps> = ({
  cartItemCount,
  onCartClick,
  onSearch,
  onCategoryChange,
  selectedCategory = "all",
  showFilters = false,
}) => {
  const searchParams = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("q");
  const [searchValue, setSearchValue] = useState(searchQuery ?? "");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useNuqs<boolean>("isClient", false);
  const [isCartOpen] = useQueryState("cart");

  const { data: categories } = api.category.all.useQuery();

  // Focus input when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // Sync with URL params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setIsSearchOpen(true);
      setSearchValue(q);
    } else {
      setSearchValue("");
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useIsomorphicLayoutEffect(() => {
    setIsClient(true);
  }, [setIsClient]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
      onSearch?.("");
    } else if (e.key === "Enter") {
      onSearch?.(searchValue);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    void setSearchQuery(value || null);
    onSearch?.(value);
  };

  const clearSearch = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSearchValue("");
    void setSearchQuery(null);
    onSearch?.("");
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Check if the related target is the search button or clear button
    const isSearchButton = (e.relatedTarget as HTMLElement)?.closest(
      "[data-search-button]",
    );
    const isClearButton = (e.relatedTarget as HTMLElement)?.closest(
      "[data-clear-button]",
    );

    if (!isSearchButton && !isClearButton) {
      setIsSearchOpen(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div
      className={`sticky top-0 z-40 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950`}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <Link
          href="/shop"
          className="text-lg font-semibold tracking-tight hover:opacity-80"
        >
          Store
        </Link>
        {showFilters && (
          <div className="scrollbar-none flex flex-1 items-center justify-center gap-6 overflow-x-auto px-8">
            <button
              type="button"
              className={`whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "text-sm font-medium text-zinc-900 dark:text-white"
                  : "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
              onClick={() => handleCategoryClick("all")}
            >
              All
            </button>
            {categories?.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "text-sm font-medium text-zinc-900 dark:text-white"
                    : "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-4">
          {onSearch && (
            <div className="relative">
              {isSearchOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchValue}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyPress}
                      onBlur={handleBlur}
                      placeholder="Search products..."
                      className="w-[460px] rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus:ring-white"
                    />
                    {searchValue && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur from firing before click
                          clearSearch();
                        }}
                        data-clear-button
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              <button
                type="button"
                data-search-button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={onCartClick}
              className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ShoppingBag className="h-4 w-4" />
              <span
                className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-white dark:text-zinc-900 ${cartItemCount > 0 ? "scale-100 opacity-100" : "scale-50 opacity-0"} transition-all duration-200`}
              >
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
