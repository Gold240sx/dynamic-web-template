"use client";

import { type Product, type ProductVariant } from "~/types/store";
import { useStore } from "~/context/store-context";
import { formatCurrency } from "~/lib/utils";
import { useState } from "react";
import Image from "next/image";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useStore();
  const defaultVariant = product.variants[0];
  const [selectedVariant] = useState<ProductVariant | null>(
    defaultVariant ?? null,
  );

  if (!selectedVariant) {
    return (
      <div className="p-4 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          This product is currently unavailable.
        </p>
      </div>
    );
  }

  const firstImage = selectedVariant.images[0];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.title || product.name}
            className="h-full w-full object-cover"
            width={500}
            height={500}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {product.name}
        </h1>
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {formatCurrency(selectedVariant.price)}
        </p>
        <div className="mt-4 space-y-6">
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>
        </div>
        <button
          onClick={() => addToCart({ product, selectedVariant, quantity: 1 })}
          className="mt-8 w-full rounded-md bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
