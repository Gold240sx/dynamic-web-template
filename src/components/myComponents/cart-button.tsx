"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";

interface CartButtonProps {
  count?: number;
  onClick?: () => void;
}

export function CartButton({ count = 0, onClick }: CartButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
          {count}
        </span>
      )}
    </Button>
  );
}
