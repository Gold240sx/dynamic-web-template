"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface CartItemButtonProps {
  cartItemCount: number;
  onCartClick: () => void;
}

const CartItemButton = ({
  cartItemCount,
  onCartClick,
}: CartItemButtonProps) => {
  return (
    <div>
      <button
        type="button"
        onClick={onCartClick}
        className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <ShoppingBag className="h-4 w-4" />
        <div
          className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white dark:bg-white dark:text-zinc-900 ${cartItemCount > 0 ? "scale-100 opacity-100" : "scale-50 opacity-0"} transition-all duration-200`}
        >
          {cartItemCount}
        </div>
      </button>
    </div>
  );
};

export default CartItemButton;
