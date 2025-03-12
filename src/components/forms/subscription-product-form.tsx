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
  const form = useForm<SubscriptionProduct>({
    resolver: zodResolver(subscriptionProductSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      active: true,
      prices: [
        {
          active: true,
          currency: "usd",
          interval: "month",
          intervalCount: 1,
          type: "recurring",
          unitAmount: 0,
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
        router.push("/dashboard/subscriptions");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateProduct, isPending: isUpdating } =
    api.subscription.updateProduct.useMutation({
      onSuccess: () => {
        toast.success("Product updated successfully");
        router.push("/dashboard/subscriptions");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const isLoading = isCreating || isUpdating;

  function onSubmit(data: SubscriptionProduct) {
    if (productId) {
      updateProduct({ id: productId, ...data });
    } else {
      createProduct(data);
    }
  }

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
                  intervalCount: 1,
                  type: "recurring",
                  unitAmount: 0,
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
                          <FormLabel>Amount (in cents)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="999"
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

                  <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="year">Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`prices.${index}.intervalCount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="1"
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
                  </div>

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

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : productId
              ? "Update Product"
              : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
