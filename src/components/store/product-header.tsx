"use client";

import { TopBar } from "~/components/myComponents/top-bar";
import { useState } from "react";
import { CartDrawer } from "~/components/myComponents/cart-drawer";
import { useStore } from "~/context/store-context";

interface ProductHeaderProps {
  onSearch?: (query: string) => void;
}

export function ProductHeader({
  onSearch = (_query: string) => null,
}: ProductHeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, cartCount, removeFromCart, updateQuantity } = useStore();

  return (
    <>
      <TopBar
        cartItemCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onSearch={onSearch}
      />
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </>
  );
}
