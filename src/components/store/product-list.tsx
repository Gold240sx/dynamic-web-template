"use client";

import { type Product } from "~/types/store";
import { ProductGrid } from "./product-grid";
import { useState, useEffect } from "react";

interface ProductListProps {
  products: Product[];
  searchQuery: string;
}

export function ProductList({ products, searchQuery }: ProductListProps) {
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      {filteredProducts.length === 0 ? (
        <div className="text-center">
          <h2 className="text-xl font-medium">No products found</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </main>
  );
}
