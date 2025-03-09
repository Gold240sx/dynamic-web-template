"use client";

import Link from "next/link";
import Image from "next/image";
import { type Product } from "~/types/store";
import { useStore } from "~/context/store-context";
import { formatCurrency } from "~/lib/utils";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const store = useStore();
  if (!store) {
    throw new Error("ProductGrid must be used within a StoreProvider");
  }
  const { addToCart } = store;

  const getProductPriceDisplay = (product: Product) => {
    const liveVariants = product.variants.filter((v) => v.isLive);
    if (!liveVariants.length) return "Not available";

    const prices = liveVariants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return prices.length > 1
      ? `from ${formatCurrency(minPrice)}`
      : formatCurrency(minPrice);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const liveVariants = product.variants.filter((v) => v.isLive);
        const firstLiveVariant = liveVariants[0];
        return (
          <div
            key={product.id}
            className="group relative rounded-lg border bg-white p-4 transition-shadow hover:shadow-lg dark:bg-zinc-800"
          >
            <Link href={`/store/${product.id}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                {firstLiveVariant?.images[0] ? (
                  <Image
                    src={firstLiveVariant.images[0].url}
                    alt={firstLiveVariant.images[0].title}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                    <span className="text-sm text-zinc-500">No image</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {getProductPriceDisplay(product)}
                </p>
              </div>
            </Link>
            {liveVariants.length > 1 ? (
              <Link href={`/store/${product.id}`}>
                <button className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                  See {liveVariants.length} Options
                </button>
              </Link>
            ) : (
              firstLiveVariant && (
                <button
                  onClick={() => {
                    addToCart({
                      product,
                      quantity: 1,
                      selectedVariant: firstLiveVariant,
                    });
                  }}
                  className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Add to Cart
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
