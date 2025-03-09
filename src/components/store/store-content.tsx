"use client";

import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { StoreHeader } from "./store-header";
import { ProductGrid } from "~/components/myComponents/product-grid";
import { api } from "~/trpc/react";
import { useCallback, useEffect } from "react";

export function StoreContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    history: "push",
    parse: (value) => value || null,
    serialize: (value) => value || "",
  });
  const [selectedCategory, setSelectedCategory] = useQueryState("category", {
    history: "push",
    parse: (value) => value || null,
    serialize: (value) => value || "",
  });

  const { data: products = [] } = api.product.getAll.useQuery({
    onlyLive: false,
  });
  console.log("Raw products:", products);

  const { data: categories = [] } = api.category.all.useQuery();
  console.log("Categories:", categories);

  const handleSearch = useCallback(
    async (query: string) => {
      try {
        await setSearchQuery(query || null);
      } catch (error) {
        console.error("Error setting search query:", error);
      }
    },
    [setSearchQuery],
  );

  const handleCategoryChange = useCallback(
    async (category: string) => {
      try {
        await setSelectedCategory(category === "all" ? null : category);
      } catch (error) {
        console.error("Error setting category:", error);
      }
    },
    [setSelectedCategory],
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.variants.some((variant) =>
        variant.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "all" ||
      product.category ===
        categories.find((c) => c.id === selectedCategory)?.name;

    return matchesSearch && matchesCategory;
  });
  console.log("Filtered products:", filteredProducts);

  const productsWithVariants = filteredProducts.filter(
    (p) => p.variants.length > 0,
  );
  console.log("Products with variants:", productsWithVariants);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <StoreHeader
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory ?? "all"}
      />
      <main className="container mx-auto px-4 py-8">
        {productsWithVariants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">No products found</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <ProductGrid products={productsWithVariants} />
        )}
      </main>
    </div>
  );
}
