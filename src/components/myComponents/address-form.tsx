import { AddressElement } from "@stripe/react-stripe-js";
import type { StripeAddressElementChangeEvent } from "@stripe/stripe-js";
import { env } from "~/env.js";

interface AddressFormProps {
  onAddressChange: (event: StripeAddressElementChangeEvent) => void;
}

export function AddressForm({ onAddressChange }: AddressFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Shipping Address</h3>
      <div className="[&_.StripeElement--invalid]:bg-red-900/50 [&_.StripeElement]:bg-zinc-800 [&_input]:border-zinc-700 [&_input]:bg-zinc-800 [&_input]:text-zinc-100 [&_input]:placeholder-zinc-500 [&_select]:border-zinc-700 [&_select]:bg-zinc-800 [&_select]:text-zinc-100 [&_select]:placeholder-zinc-500">
        <AddressElement
          options={{
            mode: "shipping",
            autocomplete: {
              mode: "google_maps_api",
              apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
            display: {
              name: "split",
            },
            fields: {
              phone: "always",
            },
            validation: {
              phone: {
                required: "always",
              },
            },
          }}
          onChange={onAddressChange}
        />
      </div>
    </div>
  );
}
