"use client";

import { useQueryState } from "nuqs";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useToast } from "~/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const generalSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Please enter a valid email"),
  notificationsEnabled: z.boolean().default(true),
});

const shippingSettingsSchema = z.object({
  defaultShippingRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  freeShippingThreshold: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  internationalShipping: z.boolean().default(false),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
type ShippingSettingsFormData = z.infer<typeof shippingSettingsSchema>;

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "general",
  });
  const { toast } = useToast();

  const generalForm = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      storeName: "",
      storeEmail: "",
      notificationsEnabled: true,
    },
  });

  const shippingForm = useForm<ShippingSettingsFormData>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      defaultShippingRate: "0.00",
      freeShippingThreshold: "0.00",
      internationalShipping: false,
    },
  });

  const handleGeneralSubmit = (data: GeneralSettingsFormData) => {
    console.log("General settings:", data);
    toast({
      title: "Settings updated",
      description: "Your general settings have been saved successfully.",
    });
  };

  const handleShippingSubmit = (data: ShippingSettingsFormData) => {
    console.log("Shipping settings:", data);
    toast({
      title: "Settings updated",
      description: "Your shipping settings have been saved successfully.",
    });
  };

  const handleTabChange = (value: string) => {
    void setActiveTab(value);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs value={activeTab ?? "general"} onValueChange={handleTabChange}>
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your store&apos;s basic information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form
                  onSubmit={generalForm.handleSubmit(handleGeneralSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={generalForm.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter store name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your store&apos;s display name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="storeEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter store email"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Used for order notifications and customer support
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="notificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Email Notifications
                          </FormLabel>
                          <FormDescription>
                            Receive email notifications for new orders
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

                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>
                Configure your store&apos;s shipping rates and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...shippingForm}>
                <form
                  onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={shippingForm.control}
                    name="defaultShippingRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Shipping Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Base shipping rate for all orders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={shippingForm.control}
                    name="freeShippingThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Shipping Threshold ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Orders above this amount qualify for free shipping
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={shippingForm.control}
                    name="internationalShipping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            International Shipping
                          </FormLabel>
                          <FormDescription>
                            Enable shipping to international addresses
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

                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
