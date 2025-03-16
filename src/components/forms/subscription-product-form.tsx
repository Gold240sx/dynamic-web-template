"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  type SubscriptionProduct,
  subscriptionProductSchema,
} from "~/lib/validations/subscription";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SubscriptionProductFormProps {
  initialData?: SubscriptionProduct;
  productId?: string;
}

export function SubscriptionProductForm({
  initialData,
  productId,
}: SubscriptionProductFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<SubscriptionProduct>({
    resolver: zodResolver(subscriptionProductSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      image: initialData?.image ?? "",
      active: initialData?.active ?? true,
      prices: initialData?.prices?.map((price) => ({
        active: price.active,
        currency: price.currency,
        interval: price.interval,
        type: price.type,
        unitAmount: price.unitAmount / 100,
        includesTrial: price.includesTrial ?? false,
        trialLength: price.trialLength,
        trialUnit: price.trialUnit,
        requires_cc: price.requires_cc ?? true,
      })) ?? [
        {
          active: true,
          currency: "usd",
          interval: "month",
          type: "recurring",
          unitAmount: 0,
          includesTrial: false,
          trialLength: undefined,
          trialUnit: undefined,
          requires_cc: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prices",
  });

  const { mutate: createProduct, isPending: isCreating } =
    api.subscription.createProduct.useMutation({
      onSuccess: () => {
        toast.success("Product created successfully");
        // Invalidate the products query
        void utils.subscription.getAllProducts.invalidate();
        router.push("/dashboard/subscriptions");
      },
      onError: (error) => {
        console.error("Error creating product:", error);
        toast.error(`Error creating product: ${error.message}`);
      },
    });

  const { mutate: updateProduct, isPending: isUpdating } =
    api.subscription.updateProduct.useMutation({
      onSuccess: () => {
        toast.success("Product updated successfully");
        // Invalidate both the single product and all products queries
        void utils.subscription.getAllProducts.invalidate();
        if (productId) {
          void utils.subscription.getProduct.invalidate({ id: productId });
        }
        router.push("/dashboard/subscriptions");
      },
      onError: (error) => {
        console.error("Error updating product:", error);
        toast.error(`Error updating product: ${error.message}`);
      },
    });

  const isLoading = isCreating || isUpdating;

  async function onSubmit(data: SubscriptionProduct) {
    try {
      console.log("onSubmit function called with data:", data);

      // Convert dollar amounts to cents before submitting
      const formattedData = {
        ...data,
        prices: data.prices.map((price) => ({
          ...price,
          unitAmount: Math.round(price.unitAmount * 100),
        })),
      };

      console.log("Formatted data (after cents conversion):", formattedData);

      if (productId) {
        console.log("Updating product with ID:", productId);
        console.log("Update payload:", { id: productId, ...formattedData });
        updateProduct({
          id: productId,
          name: formattedData.name,
          description: formattedData.description,
          image: formattedData.image,
          active: formattedData.active,
          prices: formattedData.prices,
        });
      } else {
        console.log("Creating new product with data:", formattedData);
        createProduct(formattedData);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Form submit event triggered");
          console.log("Current form values:", form.getValues());

          // Handle submission directly
          const formData = form.getValues();
          console.log("Form data before submission:", formData);
          onSubmit(formData).catch((error) => {
            console.error("Form submission error:", error);
          });
        }}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Premium Plan" {...field} />
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
                  placeholder="Access to premium features..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Disable to hide this product from customers
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Prices</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  active: true,
                  currency: "usd",
                  interval: "month",
                  type: "recurring",
                  unitAmount: 0,
                  includesTrial: false,
                  trialLength: undefined,
                  trialUnit: undefined,
                  requires_cc: true,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Price
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`prices.${index}.unitAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (in dollars)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="9.99"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the price in dollars (e.g., 9.99)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`prices.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="one_time">One-time</SelectItem>
                              <SelectItem value="recurring">
                                Recurring
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name={`prices.${index}.interval`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an interval" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="month">Monthly</SelectItem>
                              <SelectItem value="year">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`prices.${index}.includesTrial`}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Include Trial</FormLabel>
                          <FormDescription>
                            Enable to offer a trial period for this price
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch(`prices.${index}.includesTrial`) && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`prices.${index}.trialLength`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trial Length</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="14"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prices.${index}.trialUnit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trial Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hour">Hours</SelectItem>
                                <SelectItem value="day">Days</SelectItem>
                                <SelectItem value="week">Weeks</SelectItem>
                                <SelectItem value="month">Months</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch(`prices.${index}.includesTrial`) && (
                    <FormField
                      control={form.control}
                      name={`prices.${index}.requires_cc`}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Require Credit Card</FormLabel>
                            <FormDescription>
                              If enabled, users must provide a credit card to
                              start the trial
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`prices.${index}.active`}
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Disable to hide this price from customers
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Price
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
