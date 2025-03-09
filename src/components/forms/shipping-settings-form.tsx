import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { type SiteSettings } from "~/server/db/schema";

const shippingSettingsSchema = z.object({
  shipmentGroupingDays: z.number().min(1).max(30).default(7),
});

type ShippingSettingsValues = z.infer<typeof shippingSettingsSchema>;

interface ShippingSettingsFormProps {
  settings?: SiteSettings;
  onSubmit: (data: ShippingSettingsValues) => void;
}

export function ShippingSettingsForm({
  settings,
  onSubmit,
}: ShippingSettingsFormProps) {
  const form = useForm<ShippingSettingsValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      shipmentGroupingDays: settings?.shipmentGroupingDays ?? 7,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="shipmentGroupingDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipment Grouping Days</FormLabel>
              <FormDescription>
                The maximum number of days between estimated delivery dates to
                group items into a single shipment. Orders with delivery
                estimates within this window will be shipped together.
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Settings</Button>
      </form>
    </Form>
  );
}
