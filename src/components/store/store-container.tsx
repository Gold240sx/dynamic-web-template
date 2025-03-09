"use client";

import { useQueryState } from "nuqs";
import { StoreHeader } from "./store-header";
import { Suspense } from "react";
import { ProductList } from "./product-list";
import { type Product } from "~/types/store";
import { api } from "~/trpc/react";

interface StoreContainerProps {
  products: Product[];
}

export function StoreContainer({ products }: StoreContainerProps) {
  const [searchQuery, setSearchQuery] = useQueryState("q");
  const [selectedCategory, setSelectedCategory] = useQueryState("category");
  const { data: categories = [] } = api.category.all.useQuery();

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

  const handleSearch = async (query: string) => {
    await setSearchQuery(query || null);
  };

  const handleCategoryChange = async (category: string) => {
    await setSelectedCategory(category === "all" ? null : category);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <StoreHeader
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory ?? "all"}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <ProductList
          products={filteredProducts}
          searchQuery={searchQuery ?? ""}
        />
      </Suspense>
    </div>
  );
}
