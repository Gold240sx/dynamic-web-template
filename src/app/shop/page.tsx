import { db } from "~/server/db";
import {
  products as productsTable,
  productVariants,
  variantImages,
  productCategories,
} from "~/server/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { StoreContainer } from "~/components/store/store-container";
import { type Product, type ProductVariant } from "~/types/store";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt));

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.isLive, true));

  // Only get products that have live variants
  const productsWithLiveVariants = products.filter((product) =>
    variants.some((v) => v.productId === product.id),
  );

  const categories =
    productsWithLiveVariants.length > 0
      ? await db
          .select()
          .from(productCategories)
          .where(
            inArray(
              productCategories.id,
              productsWithLiveVariants.map((p) => p.categoryId),
            ),
          )
      : [];

  const allVariants =
    productsWithLiveVariants.length > 0
      ? await db
          .select()
          .from(productVariants)
          .where(
            inArray(
              productVariants.productId,
              productsWithLiveVariants.map((p) => p.id),
            ),
          )
      : [];

  const variantIds = allVariants.map((v) => v.id);

  const images =
    variantIds.length > 0
      ? await db
          .select()
          .from(variantImages)
          .where(inArray(variantImages.variantId, variantIds))
      : [];

  const productsWithVariants = productsWithLiveVariants.map((product) => ({
    ...product,
    category:
      categories.find((c) => c.id === product.categoryId)?.name ??
      "Uncategorized",
    variants: allVariants
      .filter((v) => v.productId === product.id)
      .map((variant) => ({
        ...variant,
        stripeProductId: variant.stripeProductId ?? undefined,
        images: images
          .filter((img) => img.variantId === variant.id)
          .map((img) => ({
            id: img.id,
            variantId: img.variantId,
            url: img.url,
            title: img.title,
            order: img.order,
          })),
        attributes: JSON.parse(
          variant.attributes as string,
        ) as ProductVariant["attributes"],
        description: variant.description ?? undefined,
        createdAt: variant.createdAt ?? new Date(),
        updatedAt: variant.updatedAt ?? new Date(),
      })),
  })) satisfies Product[];

  return <StoreContainer products={productsWithVariants} />;
}
