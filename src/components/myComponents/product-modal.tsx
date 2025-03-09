"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import type { Product } from "@/types/store";
import Image from "next/image";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductModal({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const firstVariant = product.variants[0];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black"
        onClick={onClose}
      />
      <motion.div
        layoutId={`product-${product.id}`}
        className="fixed inset-x-4 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-xl bg-white md:inset-[25%] md:max-h-[500px] md:rounded-xl dark:bg-zinc-900"
      >
        <div className="h-full md:flex">
          <div className="relative h-[200px] md:h-full md:w-2/5">
            {firstVariant?.images[0] && (
              <Image
                src={firstVariant.images[0].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm dark:bg-black/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col p-3 md:w-3/5">
            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-medium">{product.name}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {product.category}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  ${firstVariant?.price.toFixed(2) ?? "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {product.description}
                </p>
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-500">SKU: {product.id}</p>
                  <p className="text-zinc-500">
                    Stock:{" "}
                    {firstVariant?.stock === -1
                      ? "Unlimited"
                      : (firstVariant?.stock ?? "N/A")}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => onAddToCart(product)}
              className="mt-3 w-full rounded-md bg-zinc-900 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
