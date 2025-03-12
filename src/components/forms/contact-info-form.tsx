"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { AddressForm } from "../myComponents/address-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const ADDRESS_TYPES = [
  { value: "billing", label: "Billing" },
  { value: "shipping", label: "Shipping" },
  { value: "installation", label: "Installation" },
  { value: "service", label: "Service" },
] as const;

interface AddressInput {
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

interface ContactInfoFormProps {
  initialName?: string;
  userId: string;
  className?: string;
}

export function ContactInfoForm({
  initialName,
  userId,
  className,
}: ContactInfoFormProps) {
  const [name, setName] = useState(initialName ?? "");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedType, setSelectedType] =
    useState<(typeof ADDRESS_TYPES)[number]["value"]>("billing");

  const { data: addresses, refetch: refetchAddresses } =
    api.user.getAddresses.useQuery(
      { userId },
      {
        enabled: !!userId,
      },
    );

  const { mutate: updateUser, isPending: isUpdatingUser } =
    api.user.updateContactInfo.useMutation({
      onSuccess: () => {
        toast.success("Contact information updated successfully");
      },
      onError: () => {
        toast.error("Failed to update contact information", {
          description: "Please try again later",
        });
      },
    });

  const { mutate: addAddress, isPending: isAddingAddress } =
    api.user.addAddress.useMutation({
      onSuccess: () => {
        toast.success("Address added successfully");
        setShowAddressForm(false);
        void refetchAddresses();
      },
      onError: () => {
        toast.error("Failed to add address", {
          description: "Please try again later",
        });
      },
    });

  const { mutate: deleteAddress } = api.user.deleteAddress.useMutation({
    onSuccess: () => {
      toast.success("Address deleted successfully");
      void refetchAddresses();
    },
    onError: () => {
      toast.error("Failed to delete address", {
        description: "Please try again later",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      userId,
      name,
    });
  };

  const handleAddressSubmit = (address: AddressInput) => {
    addAddress({
      userId,
      address: {
        ...address,
        type: selectedType,
        name: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Address`,
        isDefault: true,
      },
    });
  };

  return (
    <div className={`space-y-8 ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            className="border-none"
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <Button type="submit" disabled={isUpdatingUser} className="w-full">
          {isUpdatingUser ? "Saving..." : "Save Contact Information"}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Addresses</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddressForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>

        {showAddressForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Address Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    setSelectedType(
                      value as (typeof ADDRESS_TYPES)[number]["value"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDRESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AddressForm
                onAddressChange={handleAddressSubmit}
                className="[&_input]: [&_select]: [&_*]:border-none [&_input]:border-none [&_select]:border-none"
              />
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {addresses?.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {address.name}{" "}
                    {address.isDefault && (
                      <span className="ml-2 text-xs text-zinc-500">
                        (Default)
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      deleteAddress({ userId, addressId: address.id })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <address className="not-italic">
                  <p>
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && <p>{address.phone}</p>}
                </address>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
