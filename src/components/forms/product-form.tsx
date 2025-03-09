import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
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
import { type Product } from "~/types/store";
import { ShippingForm } from "./shipping-form";

const productFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  categoryId: z.string(),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      stock: z.number().min(0),
      attributes: z.record(z.union([z.string(), z.number(), z.boolean()])),
      isLive: z.boolean().default(false),
      stripeProductId: z.string().optional(),
      isPhysical: z.boolean().default(false),
      requiresShipping: z.boolean().default(false),
      weight: z.number().min(0).nullable(),
      length: z.number().min(0).nullable(),
      width: z.number().min(0).nullable(),
      height: z.number().min(0).nullable(),
      flatRateShipping: z.number().min(0).nullable(),
    }),
  ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const defaultVariant = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  attributes: {},
  isLive: false,
  isPhysical: false,
  requiresShipping: false,
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  flatRateShipping: 0,
};

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.category ?? "",
      variants: product?.variants.map((variant) => ({
        name: variant.name,
        description: variant.description ?? "",
        price: variant.price,
        stock: variant.stock,
        attributes: variant.attributes,
        isLive: variant.isLive,
        stripeProductId: variant.stripeProductId,
        isPhysical: variant.isPhysical,
        requiresShipping: variant.requiresShipping,
        weight: variant.weight,
        length: variant.length,
        width: variant.width,
        height: variant.height,
        flatRateShipping: variant.flatRateShipping,
      })) ?? [defaultVariant],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Variants</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4">
              <FormField
                control={form.control}
                name={`variants.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`variants.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${index}.stock`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <h3 className="mb-4 text-base font-medium">
                  Shipping Information
                </h3>
                <ShippingForm
                  variant={product?.variants[index]}
                  onSubmit={(data) => {
                    form.setValue(
                      `variants.${index}.isPhysical`,
                      data.isPhysical,
                    );
                    form.setValue(
                      `variants.${index}.requiresShipping`,
                      data.requiresShipping,
                    );
                    form.setValue(`variants.${index}.weight`, data.weight);
                    form.setValue(`variants.${index}.length`, data.length);
                    form.setValue(`variants.${index}.width`, data.width);
                    form.setValue(`variants.${index}.height`, data.height);
                    form.setValue(
                      `variants.${index}.flatRateShipping`,
                      data.flatRateShipping,
                    );
                  }}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append(defaultVariant)}
          >
            Add Variant
          </Button>
        </div>

        <Button type="submit">Save Product</Button>
      </form>
    </Form>
  );
}
