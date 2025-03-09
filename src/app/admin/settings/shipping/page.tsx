"use client";

import { toast } from "sonner";
import { ShippingSettingsForm } from "~/components/forms/shipping-settings-form";
import { api } from "~/trpc/react";

export default function ShippingSettingsPage() {
  const utils = api.useUtils();

  const { data: settings, isLoading } =
    api.settings.getShippingSettings.useQuery();

  const { mutate: updateSettings } =
    api.settings.updateShippingSettings.useMutation({
      onSuccess: () => {
        toast.success("Shipping settings updated successfully");
        void utils.settings.getShippingSettings.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">Shipping Settings</h1>
        <div className="rounded-lg border p-6">
          <ShippingSettingsForm
            settings={settings}
            onSubmit={(data) => {
              updateSettings(data);
            }}
          />
        </div>
      </div>
    </div>
  );
}
