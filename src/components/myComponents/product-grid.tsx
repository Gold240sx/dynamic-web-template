import { motion } from "framer-motion";
import type { Product } from "~/types/store";
import Image from "next/image";

interface ProductGridProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export function ProductGrid({ products, onProductSelect }: ProductGridProps) {
  console.log("ProductGrid received products:", products);

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {products.map((product) => {
        console.log(
          "Rendering product:",
          product.name,
          "with variants:",
          product.variants,
        );
        const firstVariant = product.variants[0];
        const firstImage = firstVariant?.images[0];

        return (
          <motion.div
            key={product.id}
            layoutId={`product-${product.id}`}
            onClick={() => onProductSelect?.(product)}
            className="group cursor-pointer"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white dark:bg-zinc-900">
              {firstImage ? (
                <Image
                  src={firstImage.url}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  No image
                </div>
              )}
            </div>
            <div className="mt-1.5 space-y-0.5">
              <h3 className="truncate text-xs font-medium">{product.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  ${firstVariant?.price.toFixed(2) ?? "N/A"}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {product.category}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
