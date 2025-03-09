"use client";

import { type Product } from "~/types/store";
import { useStore } from "~/context/store-context";
import { formatCurrency } from "~/lib/utils";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useStore();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {product.name}
        </h1>
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {formatCurrency(product.price)}
        </p>
        <div className="mt-4 space-y-6">
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="mt-8 w-full rounded-md bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
