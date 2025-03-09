"use client";

import { TopBar } from "~/components/myComponents/top-bar";
import { CartDrawer } from "~/components/myComponents/cart-drawer";
import { useStore } from "~/context/store-context";
import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";

interface StoreHeaderProps {
  onSearch: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

export function StoreHeader({
  onSearch,
  onCategoryChange,
  selectedCategory = "all",
}: StoreHeaderProps) {
  const { cart, cartCount, removeFromCart, updateQuantity } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isStoreRoute = pathname === "/shop" || pathname === "/dashboard/store";
  const [category, setCategory] = useQueryState("category");

  const handleSearch = useCallback(
    (query: string) => {
      onSearch(query);
    },
    [onSearch],
  );

  const handleCategoryChange = useCallback(
    async (categoryId: string) => {
      if (onCategoryChange) {
        onCategoryChange(categoryId);
      }
      await setCategory(categoryId === "all" ? null : categoryId);
    },
    [onCategoryChange, setCategory],
  );

  return (
    <>
      <TopBar
        cartItemCount={cartCount}
        onCartClick={() => setIsOpen(true)}
        onSearch={isStoreRoute ? handleSearch : undefined}
        onCategoryChange={isStoreRoute ? handleCategoryChange : undefined}
        selectedCategory={category ?? "all"}
        showFilters={isStoreRoute}
      />
      {isOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsOpen(false)}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </>
  );
}
