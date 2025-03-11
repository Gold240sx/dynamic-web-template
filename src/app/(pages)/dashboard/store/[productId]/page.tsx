"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { z } from "zod";
import { useEffect, useState } from "react";
import { use } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";
import { nanoid } from "nanoid";

const variantImageSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  url: z.string().url(),
  title: z.string().min(3).max(256),
  order: z.number().default(0),
});

const variantSchema = z
  .object({
    id: z.string(),
    productId: z.string().optional(),
    name: z.string().min(3).max(256),
    description: z.string().optional(),
    price: z.number().min(0),
    stock: z.number().default(-1),
    isDigital: z.boolean().default(false),
    isLive: z.boolean().default(false),
    stripeProductId: z.string().optional(),
    requiresShipping: z.boolean().default(false),
    attributes: z
      .record(z.union([z.string(), z.number(), z.boolean()]))
      .default({}),
    images: z.array(variantImageSchema).default([]),
  })
  .refine(
    (data) => {
      // If the variant is live, require a stripeProductId
      if (data.isLive) {
        return !!data.stripeProductId && data.stripeProductId.trim().length > 0;
      }
      return true;
    },
    {
      message: "Stripe Product ID is required for live products",
      path: ["stripeProductId"],
    },
  );

const productFormSchema = z.object({
  name: z.string().min(3).max(256),
  description: z.string().min(10),
  categoryId: z.string(),
  variants: z.array(variantSchema).min(1),
});

type ProductFormData = z.infer<typeof productFormSchema>;
type VariantData = z.infer<typeof variantSchema>;
type VariantImage = z.infer<typeof variantImageSchema>;

interface ProductFormPageProps {
  params: Promise<{ productId: string }>;
}

const defaultVariant: VariantData = {
  id: nanoid(),
  productId: undefined,
  name: "",
  description: "",
  price: 0,
  stock: -1,
  isDigital: false,
  isLive: false,
  stripeProductId: "",
  requiresShipping: false,
  attributes: {},
  images: [],
};

function ProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const isNew = productId === "new";
  const [newCategory, setNewCategory] = useState("");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      variants: [defaultVariant],
    },
  });

  const utils = api.useUtils();

  const { mutate: createProduct, isPending: isCreating } =
    api.product.create.useMutation({
      onSuccess: async () => {
        await utils.product.getAll.invalidate();
        router.push("/dashboard/store");
        router.refresh();
      },
    });

  const { mutate: updateProduct, isPending: isUpdating } =
    api.product.update.useMutation({
      onSuccess: async () => {
        await utils.product.getAll.invalidate();
        router.push("/dashboard/store");
        router.refresh();
      },
    });

  const { mutate: createCategory } = api.category.create.useMutation({
    onSuccess: async (category) => {
      await utils.category.all.invalidate();
      form.setValue("categoryId", category.id);
      setNewCategory("");
    },
  });

  const { data: categories } = api.category.all.useQuery();

  const { data: product } = api.product.byId.useQuery(productId, {
    enabled: !isNew,
  });

  const { data: allProducts } = api.product.getAll.useQuery(
    { onlyLive: false },
    { enabled: !isNew && !!product },
  );

  const { mutate: deleteProduct, isPending: isDeleting } =
    api.product.delete.useMutation({
      onSuccess: async () => {
        await utils.product.getAll.invalidate();
        router.push("/dashboard/store");
        router.refresh();
        console.log("Product deleted successfully");
      },
      onError: (error) => {
        console.error(error.message);
      },
    });

  useEffect(() => {
    if (!isNew && product && allProducts) {
      const productWithVariants = allProducts.find((p) => p.id === product.id);

      if (!productWithVariants || !product.categoryId) return;

      const variants = productWithVariants.variants.map((variant) => ({
        id: variant.id,
        productId: variant.productId,
        name: variant.name ?? "",
        description: variant.description ?? "",
        price: variant.price ?? 0,
        stock: variant.stock ?? -1,
        isDigital: variant.isDigital ?? false,
        requiresShipping: variant.requiresShipping ?? true,
        attributes: variant.attributes ?? {},
        images: variant.images.map((img) => ({
          id: img.id,
          variantId: variant.id,
          url: img.url,
          title: img.title,
          order: img.order,
        })),
        isLive: variant.isLive ?? false,
        stripeProductId: variant.stripeProductId ?? "",
      }));

      form.reset({
        name: productWithVariants.name,
        description: productWithVariants.description,
        categoryId: product.categoryId,
        variants,
      });
    }
  }, [form, isNew, product, allProducts]);

  const onSubmit = (data: ProductFormData) => {
    // Ensure all variants have the correct shipping requirement based on digital status
    const processedData = {
      ...data,
      variants: data.variants.map((variant) => ({
        ...variant,
        requiresShipping: !variant.isDigital,
      })),
    };

    if (isNew) {
      createProduct(processedData);
    } else {
      updateProduct({
        id: productId,
        ...processedData,
      });
    }
  };

  const addVariant = () => {
    const currentVariants = form.getValues("variants");
    form.setValue("variants", [...currentVariants, defaultVariant], {
      shouldValidate: true,
    });
  };

  const removeVariant = (index: number) => {
    const currentVariants = form.getValues("variants");
    if (currentVariants.length > 1) {
      form.setValue(
        "variants",
        currentVariants.filter((_: VariantData, i: number) => i !== index),
        { shouldValidate: true },
      );
    }
  };

  const updateVariant = (index: number, updates: Partial<VariantData>) => {
    const currentVariants = form.getValues("variants");
    const currentVariant = currentVariants[index] ?? defaultVariant;
    const updatedVariant = {
      ...currentVariant,
      ...updates,
    };
    const updatedVariants = [...currentVariants];
    updatedVariants[index] = updatedVariant;
    form.setValue("variants", updatedVariants, { shouldValidate: true });
  };

  const handleDelete = async (skipStripe = false) => {
    const productData = allProducts?.find((p) => p.id === productId);

    if (
      skipStripe ||
      !productData?.variants?.some((variant) => variant.stripeProductId)
    ) {
      deleteProduct(productId);
      return;
    }

    try {
      // Delete from Stripe first
      const stripeDeletePromises = productData.variants
        .filter((variant) => variant.stripeProductId)
        .map(async (variant) => {
          const response = await fetch(
            `/api/checkout_sessions?productId=${variant.stripeProductId}`,
            {
              method: "DELETE",
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as { error?: string };
            throw new Error(errorData.error ?? "Failed to delete from Stripe");
          }

          const data = (await response.json()) as { success: boolean };
          if (!data.success) {
            throw new Error("Failed to delete from Stripe");
          }
        });

      await Promise.all(stripeDeletePromises);

      // Then delete from our database
      deleteProduct(productId);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isNew ? "Add Product" : "Edit Product"}
        </h1>
        <div className="flex gap-4">
          <Link
            href="/dashboard/store"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Back to Store
          </Link>
          {!isNew && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(true)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete (Frontend Only)"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(false)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete (Including Stripe)"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Product description"
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <div className="flex gap-2">
                  {field.value === "new" ? (
                    <div className="flex w-full gap-2">
                      <Input
                        placeholder="New category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newCategory) {
                            createCategory({ name: newCategory });
                          }
                        }}
                        disabled={!newCategory}
                      >
                        Add Category
                      </Button>
                    </div>
                  ) : (
                    <FormControl className="w-full">
                      <select
                        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        {...field}
                        onChange={(e) => {
                          if (e.target.value === "new") {
                            field.onChange("new");
                            setNewCategory("");
                          } else {
                            field.onChange(e.target.value);
                          }
                        }}
                      >
                        <option value="">Select a category</option>
                        {categories?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                        <option value="new">+ Create new category</option>
                      </select>
                    </FormControl>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Variants</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </div>

            {form
              .watch("variants")
              .map((variant: VariantData, index: number) => (
                <div key={index} className="mb-8 rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Variant {index + 1}</h3>
                    {form.watch("variants").length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(index, { name: e.target.value })
                        }
                        placeholder="Variant name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={variant.description}
                        onChange={(e) =>
                          updateVariant(index, { description: e.target.value })
                        }
                        placeholder="Variant description"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Price</label>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, {
                            price: parseFloat(e.target.value),
                          })
                        }
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Stock</label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(index, {
                            stock: parseInt(e.target.value),
                          })
                        }
                        placeholder="-1 for unlimited"
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">
                          Variant Status
                        </label>
                        <div className="text-[0.8rem] text-zinc-500 dark:text-zinc-400">
                          {variant.isLive
                            ? "Variant is live and purchasable"
                            : "Variant is in draft mode"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          updateVariant(index, { isLive: !variant.isLive });
                          toast.success(
                            variant.isLive
                              ? "Variant is now in draft mode"
                              : "Variant is now live and purchasable",
                          );
                        }}
                        className={`rounded-md px-3 py-1 text-sm transition-colors ${
                          variant.isLive
                            ? "bg-white text-black dark:bg-zinc-950 dark:text-white"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        }`}
                      >
                        Live
                      </button>
                    </div>

                    <div className="flex items-center justify-between space-x-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">
                          Product Type
                        </label>
                        <div className="text-[0.8rem] text-zinc-500 dark:text-zinc-400">
                          {variant.isDigital
                            ? "Digital product (no shipping required)"
                            : "Physical product (requires shipping)"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const isDigital = !variant.isDigital;
                          updateVariant(index, {
                            isDigital,
                            requiresShipping: !isDigital,
                          });
                          toast.success(
                            isDigital
                              ? "Changed to digital product"
                              : "Changed to physical product",
                          );
                        }}
                        className={`rounded-md px-3 py-1 text-sm transition-colors ${
                          variant.isDigital
                            ? "bg-white text-black dark:bg-zinc-950 dark:text-white"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        }`}
                      >
                        {variant.isDigital ? "Digital" : "Physical"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Images</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentImages = variant.images ?? [];
                            updateVariant(index, {
                              images: [
                                ...currentImages,
                                {
                                  id: nanoid(),
                                  variantId: variant.id,
                                  url: "",
                                  title: "",
                                  order: currentImages.length,
                                },
                              ],
                            });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Image
                        </Button>
                      </div>

                      {variant.images?.map((image, imageIndex) => (
                        <div
                          key={imageIndex}
                          className="flex items-start gap-4 rounded-lg border p-4"
                        >
                          <div className="flex-1 space-y-4">
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">URL</label>
                              <Input
                                value={image.url}
                                onChange={(e) => {
                                  const updatedImages = [
                                    ...(variant.images ?? []),
                                  ];
                                  updatedImages[imageIndex] = {
                                    ...image,
                                    url: e.target.value,
                                  };
                                  updateVariant(index, {
                                    images: updatedImages,
                                  });
                                }}
                                placeholder="Image URL"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Title
                              </label>
                              <Input
                                value={image.title}
                                onChange={(e) => {
                                  const updatedImages = [
                                    ...(variant.images ?? []),
                                  ];
                                  updatedImages[imageIndex] = {
                                    ...image,
                                    title: e.target.value,
                                  };
                                  updateVariant(index, {
                                    images: updatedImages,
                                  });
                                }}
                                placeholder="Image title"
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Order
                              </label>
                              <Input
                                type="number"
                                value={image.order}
                                onChange={(e) => {
                                  const updatedImages = [
                                    ...(variant.images ?? []),
                                  ];
                                  updatedImages[imageIndex] = {
                                    ...image,
                                    order: parseInt(e.target.value),
                                  };
                                  updateVariant(index, {
                                    images: updatedImages,
                                  });
                                }}
                                placeholder="Display order"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updatedImages = variant.images?.filter(
                                (_, i) => i !== imageIndex,
                              );
                              updateVariant(index, { images: updatedImages });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isCreating || isUpdating || isDeleting}
          >
            {isCreating || isUpdating ? "Saving..." : "Save Product"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function ProductFormPage({ params }: ProductFormPageProps) {
  const resolvedParams = use(params);
  return <ProductForm productId={resolvedParams.productId} />;
}
