import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

interface BillingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface AddressFormProps {
  onAddressChange: (address: BillingAddress) => void;
  initialAddress?: BillingAddress;
  className?: string;
  firstName?: string;
  lastName?: string;
}

export function AddressForm({
  onAddressChange,
  initialAddress,
  className,
  firstName = "",
  lastName = "",
}: AddressFormProps) {
  const [address, setAddress] = useState<BillingAddress>({
    firstName: firstName ?? initialAddress?.firstName ?? "",
    lastName: lastName ?? initialAddress?.lastName ?? "",
    line1: initialAddress?.line1 ?? "",
    line2: initialAddress?.line2 ?? "",
    city: initialAddress?.city ?? "",
    state: initialAddress?.state ?? "",
    postalCode: initialAddress?.postalCode ?? "",
    country: "US",
    phone: initialAddress?.phone ?? "",
  });

  const handleChange = (field: keyof BillingAddress, value: string) => {
    const newAddress = {
      ...address,
      [field]: value,
    };
    setAddress(newAddress);
    onAddressChange(newAddress);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Shipping Address</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Please ensure that these shipping details are correct.
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={address.firstName}
              className="border-none !bg-zinc-800"
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="First name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={address.lastName}
              className="border-none !bg-zinc-800"
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={address.phone}
            className="border-none !bg-zinc-800"
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 555-5555"
          />
        </div>
        <div>
          <Label htmlFor="line1">Address Line 1</Label>
          <Input
            id="line1"
            value={address.line1}
            className="border-none !bg-zinc-800"
            onChange={(e) => handleChange("line1", e.target.value)}
            placeholder="Street address"
          />
        </div>
        <div>
          <Label htmlFor="line2">Address Line 2</Label>
          <Input
            id="line2"
            value={address.line2}
            className="border-none !bg-zinc-800"
            onChange={(e) => handleChange("line2", e.target.value)}
            placeholder="Apartment, suite, etc."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              className="border-none !bg-zinc-800"
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select
              value={address.state}
              onValueChange={(value) => handleChange("state", value)}
            >
              <SelectTrigger id="state" className="border-none !bg-zinc-800">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={address.postalCode}
              className="border-none !bg-zinc-800"
              onChange={(e) => handleChange("postalCode", e.target.value)}
              placeholder="Postal code"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={address.country}
              className="border-none !bg-zinc-800"
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Country"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}
