import { type Metadata } from "next";
import { Suspense } from "react";
import { StoreProvider } from "~/context/store-context";
import { ProductHeader } from "~/components/store/product-header";
import { ProductVariants } from "~/components/store/product-variants";
import { ShareButton } from "~/components/store/share-button";
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
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .then((res) => res[0]);

  if (!product) return { title: "Product Not Found" };

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const firstVariant = variants[0];
  const images = firstVariant
    ? await db
        .select()
        .from(variantImages)
        .where(eq(variantImages.variantId, firstVariant.id))
        .then((res) => res[0])
    : null;

  return {
    title: product.name,
    description: product.description || `${product.name} - Shop now`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - Shop now`,
      images: images ? [images.url] : [],
      type: "website",
      ...(firstVariant && {
        price: {
          amount: (firstVariant.price / 100).toString(),
          currency: "USD",
        },
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || `${product.name} - Shop now`,
      images: images ? [images.url] : [],
    },
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <ShareButton
          title={product.name}
          text={product.description || `Check out ${product.name}`}
        />
      </div>
      <ProductVariants product={productWithVariants} />
    </div>
  );
}

async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

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
