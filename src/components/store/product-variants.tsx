"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { type Product, type ProductVariant } from "~/types/store";
import { useStore } from "~/context/store-context";
import { formatCurrency } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MinusIcon, PlusIcon } from "lucide-react";

interface ProductVariantsProps {
  product: Product;
}

export function ProductVariants({ product }: ProductVariantsProps) {
  const store = useStore();
  if (!store) {
    throw new Error("ProductVariants must be used within a StoreProvider");
  }
  const { addToCart } = store;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product?.variants?.[0]) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (!product?.variants?.length || !selectedVariant) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-zinc-500">
          Product not found or no variants available
        </p>
      </div>
    );
  }

  const handleQuantityChange = (value: number) => {
    if (selectedVariant.stock === -1) {
      // Unlimited stock, just enforce min/max limits
      setQuantity(Math.max(1, Math.min(99, value)));
      return;
    }
    // Limited stock, enforce stock limit
    setQuantity(Math.max(1, Math.min(selectedVariant.stock, value)));
  };

  const handleAddToCart = () => {
    if (selectedVariant.stock !== -1 && quantity > selectedVariant.stock) {
      return; // Don't add if quantity exceeds stock
    }
    addToCart({
      product,
      selectedVariant,
      quantity,
    });
    setQuantity(1); // Reset quantity after adding to cart
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {selectedVariant.images[0] ? (
            <Image
              src={selectedVariant.images[0].url}
              alt={selectedVariant.images[0].title}
              width={500}
              height={500}
              className="h-full w-full object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-zinc-500">No image available</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {product.variants.flatMap((variant) =>
            variant.images
              .filter((img): img is NonNullable<typeof img> => Boolean(img))
              .map((image, idx) => (
                <button
                  key={`${variant.id}-${idx}`}
                  className={`group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 transition-all hover:ring-2 hover:ring-zinc-900 dark:bg-zinc-800 dark:hover:ring-white ${
                    selectedVariant.id === variant.id &&
                    selectedVariant.images[0]?.url === image.url
                      ? "ring-2 ring-zinc-900 dark:ring-white"
                      : ""
                  }`}
                  onClick={() => {
                    if (variant.id === selectedVariant.id) {
                      // If same variant, just swap images
                      const currentIdx = selectedVariant.images.findIndex(
                        (img) => img?.url === image.url,
                      );
                      if (currentIdx === -1) return;
                      const newImages = [...selectedVariant.images];
                      const temp = newImages[0];
                      newImages[0] = newImages[currentIdx]!;
                      newImages[currentIdx] = temp!;
                      setSelectedVariant({
                        ...selectedVariant,
                        images: newImages,
                      });
                    } else {
                      // If different variant, select it and make this image primary
                      const newVariant = { ...variant };
                      const currentIdx = newVariant.images.findIndex(
                        (img) => img?.url === image.url,
                      );
                      if (currentIdx === -1) return;
                      const newImages = [...newVariant.images];
                      const temp = newImages[0];
                      newImages[0] = newImages[currentIdx]!;
                      newImages[currentIdx] = temp!;
                      newVariant.images = newImages;
                      setSelectedVariant(newVariant);
                    }
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 768px) 25vw, 100px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="px-2 text-center text-sm text-white">
                      {variant.name}
                    </span>
                  </div>
                </button>
              )),
          )}
        </div>
      </div>

      {/* Product Info and Variant Selection */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {formatCurrency(selectedVariant.price)}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Select Variant</h3>
          <div className="grid gap-3">
            {product.variants.map((variant) => (
              <button
                key={variant.name}
                onClick={() => setSelectedVariant(variant)}
                className={`flex items-center justify-between rounded-lg border p-4 text-left ${
                  selectedVariant.name === variant.name
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-white"
                }`}
              >
                <div>
                  <div className="font-medium">{variant.name}</div>
                  <div className="mt-1 text-sm opacity-90">
                    {formatCurrency(variant.price)}
                  </div>
                </div>
                {variant.stock > -1 && (
                  <div className="text-sm opacity-90">
                    {variant.stock} available
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Quantity</h3>
          <div className="flex w-32 items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min="1"
              max={selectedVariant.stock === -1 ? 99 : selectedVariant.stock}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
              className="text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={selectedVariant.stock === 0}
        >
          {selectedVariant.stock === 0
            ? "Out of Stock"
            : `Add to Cart - ${formatCurrency(selectedVariant.price * quantity)}`}
        </Button>

        <div className="prose prose-zinc dark:prose-invert">
          <h3>Description</h3>
          <p>{selectedVariant.description ?? product.description}</p>
          {selectedVariant.isDigital && (
            <p className="text-sm text-zinc-500">
              This is a digital product. You will receive download instructions
              after purchase.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
