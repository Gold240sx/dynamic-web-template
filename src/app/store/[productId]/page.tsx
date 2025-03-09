import { Suspense } from "react";
import { StoreProvider } from "~/context/store-context";
import { ProductHeader } from "~/components/store/product-header";
import { ProductVariants } from "~/components/store/product-variants";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import {
  products as productsTable,
  productVariants,
  variantImages,
  productCategories,
} from "~/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { Product } from "~/types/store";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

async function ProductContent({ productId }: { productId: string }) {
  const product = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .then((res) => res[0]);

  if (!product) {
    notFound();
  }

  const category = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, product.categoryId))
    .then((res) => res[0]);

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const hasLiveVariants = variants.some((v) => v.isLive);
  if (!hasLiveVariants) {
    notFound();
  }

  const variantIds = variants.map((v) => v.id);

  const images =
    variantIds.length > 0
      ? await db
          .select()
          .from(variantImages)
          .where(inArray(variantImages.variantId, variantIds))
      : [];

  const productWithVariants: Product = {
    ...product,
    category: category?.name ?? "Uncategorized",
    variants: variants
      .filter((v) => v.isLive)
      .map((variant) => {
        const variantImages = images.filter(
          (img) => img.variantId === variant.id,
        );
        return {
          ...variant,
          stripeProductId: variant.stripeProductId ?? undefined,
          description: variant.description ?? undefined,
          isLive: variant.isLive ?? false,
          createdAt: variant.createdAt ?? new Date(),
          updatedAt: variant.updatedAt ?? new Date(),
          attributes: JSON.parse(variant.attributes as string) as Record<
            string,
            string | number | boolean
          >,
          images: variantImages.map((img) => ({
            id: img.id,
            url: img.url,
            title: img.title,
            order: img.order,
            variantId: img.variantId,
            createdAt: img.createdAt ?? new Date(),
          })),
        };
      }),
  };

  return <ProductVariants product={productWithVariants} />;
}

async function ProductPage({ params }: ProductPageProps) {
  const productId = params.productId;

  return (
    <StoreProvider>
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <main className="container mx-auto px-4 py-8">
          <ProductHeader />
          <Suspense fallback={<div>Loading...</div>}>
            <ProductContent productId={productId} />
          </Suspense>
        </main>
      </div>
    </StoreProvider>
  );
}

export default ProductPage;
