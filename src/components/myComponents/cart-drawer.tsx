"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Minus, Plus, X } from "lucide-react";
import type { CartItem } from "~/context/store-context";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { AddressForm } from "./address-form";
import { env } from "~/env.js";
import { useAuth } from "~/hooks/use-auth";
import { api } from "~/trpc/react";
import { useNameFormatter } from "~/hooks/use-name-formatter";

const US_STATES = [
  /* ... state list ... */
];

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

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

type CheckoutStep = "cart" | "auth" | "shipping";

interface CheckoutResponse {
  url?: string;
  error?: string;
}

export function CartDrawer({
  cart,
  onClose,
  onRemoveFromCart,
  onUpdateQuantity,
}: CartDrawerProps) {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const formattedName = useNameFormatter(user?.name);
  const [firstName, lastName] = useMemo(() => {
    if (!formattedName) return ["", ""];
    const parts = formattedName.split(" ");
    return [parts[0] ?? "", parts.slice(1).join(" ") ?? ""];
  }, [formattedName]);

  const [checkoutStep, setCheckoutStep] = useQueryState<CheckoutStep>(
    "checkoutStep",
    {
      defaultValue: "cart",
      parse: (value) => {
        if (value === "cart" || value === "auth" || value === "shipping") {
          return value;
        }
        return "cart";
      },
    },
  );
  const [isGuest, setIsGuest] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [originalAddress, setOriginalAddress] = useState<BillingAddress | null>(
    null,
  );
  const [address, setAddress] = useState<BillingAddress>(() => ({
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  }));
  const [email, setEmail] = useState("");

  const { mutate: updateUser } = api.user.updateContactInfo.useMutation({
    onSuccess: () => {
      toast.success("Contact information saved");
    },
  });

  const total = cart.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  );

  const hasPhysicalItems = cart.some((item) => !item.variant.isDigital);

  const canIncreaseQuantity = (item: CartItem) => {
    if (item.variant.isDigital) {
      return item.quantity < 1;
    }
    return item.variant.stock === -1 || item.quantity < item.variant.stock;
  };

  // Load user's name and email if available
  useEffect(() => {
    if (!user) return;

    if (firstName || lastName) {
      setAddress((prev) => ({
        ...prev,
        firstName: firstName ?? prev.firstName,
        lastName: lastName ?? prev.lastName,
      }));
    }

    if (user.email) {
      setEmail(user.email);
    }
  }, [user, firstName, lastName]);

  const handleAddressChange = (newAddress: BillingAddress) => {
    setAddress(newAddress);
  };

  const hasAddressChanged = useMemo(() => {
    return false; // Address changes are now handled per-order
  }, []);

  const proceedToCheckout = async (shouldSave = false) => {
    try {
      // If user is signed in and shouldSave is true, save the address
      if (user && !isGuest && shouldSave) {
        updateUser({
          userId: user.id,
          name: `${address.firstName} ${address.lastName}`,
        });
      }

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.variant.id,
            quantity: item.quantity,
            price: item.variant.price,
            name: `${item.productName} - ${item.variant.name}`,
            stripeProductId: item.variant.stripeProductId!,
            isDigital: item.variant.isDigital,
          })),
          email,
          address: hasPhysicalItems ? address : undefined,
        }),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create checkout session");
      }

      if (result.url) {
        router.push(result.url);
      } else {
        toast("Checkout Failed", {
          description: "Failed to create checkout session",
          action: {
            label: "Try Again",
            onClick: () => void proceedToCheckout(),
          },
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast("Checkout Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
        action: {
          label: "Try Again",
          onClick: () => void proceedToCheckout(),
        },
      });
    }
  };

  const handleCheckout = async () => {
    try {
      // Validate all items have Stripe product IDs
      const invalidItems = cart.filter(
        (item) => !item.variant.stripeProductId || !item.variant.isLive,
      );

      if (invalidItems.length > 0) {
        toast(
          "Some items in your cart are not available for purchase. Please remove them to continue.",
          {
            description: "Please remove unavailable items",
            action: {
              label: "Close",
              onClick: () => onClose(),
            },
          },
        );
        return;
      }

      // If at cart step, determine next step
      if (checkoutStep === "cart") {
        // If user is loading, wait
        if (userLoading) return;

        // If user is signed in or already chose guest checkout, go to shipping
        if (user || isGuest) {
          void setCheckoutStep("shipping");
          return;
        }

        // Otherwise, go to auth step
        void setCheckoutStep("auth");
        return;
      }

      // If at auth step, user needs to choose sign in or guest
      if (checkoutStep === "auth") {
        return;
      }

      // At shipping step, validate information
      const emailRegex = new RegExp(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      );
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (hasPhysicalItems) {
        if (
          !address.firstName ||
          !address.lastName ||
          !address.line1 ||
          !address.city ||
          !address.state ||
          !address.postalCode
        ) {
          toast.error("Please enter a complete shipping address");
          return;
        }
      }

      // If user is signed in and address has changed, show save prompt
      if (user && !isGuest && hasAddressChanged) {
        setShowSavePrompt(true);
        return;
      }

      // Otherwise proceed directly to checkout
      await proceedToCheckout(false);
    } catch (error) {
      console.error("Checkout error:", error);
      toast("Checkout Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
        action: {
          label: "Try Again",
          onClick: () => void handleCheckout(),
        },
      });
    }
  };

  const renderShippingStep = () => (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email for Receipt</Label>
          <Input
            id="email"
            type="email"
            value={email}
            className="border-none"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={!isGuest && !!user}
          />
        </div>
        {hasPhysicalItems && (
          <AddressForm
            onAddressChange={handleAddressChange}
            initialAddress={address}
            firstName={firstName}
            lastName={lastName}
            className="[&_input]: [&_select]: [&_*]:border-none [&_input]:border-none [&_select]:border-none"
          />
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    // If we're at auth step but user is signed in, redirect to shipping
    if (checkoutStep === "auth" && user) {
      void setCheckoutStep("shipping");
      return null;
    }

    switch (checkoutStep) {
      case "auth":
        return (
          <div className="flex flex-col gap-4 p-4">
            <h2 className="text-lg font-medium">Continue as...</h2>
            <Button
              onClick={() => {
                const currentPath = window.location.pathname;
                const searchParams = new URLSearchParams(
                  window.location.search,
                );
                searchParams.set("cartOpen", "true");
                const returnUrl = `${currentPath}?${searchParams.toString()}`;
                router.push(
                  `/signin?redirectTo=${encodeURIComponent(returnUrl)}`,
                );
              }}
              className="w-full"
              variant="outline"
            >
              Sign In
            </Button>
            <p className="text-sm text-zinc-500">
              If you sign in, you&apos;ll be directed right back here.
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500">or</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsGuest(true);
                void setCheckoutStep("shipping");
              }}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </div>
        );

      case "shipping":
        return renderShippingStep();

      default:
        return (
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50"
              >
                <div className="relative h-24 w-24">
                  <Image
                    src={item.variant.images?.[0]?.url ?? "/placeholder.jpg"}
                    alt={item.variant.name ?? "Product image"}
                    fill
                    sizes="(max-width: 768px) 96px, 96px"
                    priority={false}
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="truncate text-base font-medium">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {item.variant.name}
                      </p>
                      {item.variant.stock !== -1 && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {item.variant.stock} in stock
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="ml-2 rounded-full p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      className="rounded-md p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        canIncreaseQuantity(item) &&
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={!canIncreaseQuantity(item)}
                      className={`rounded-md p-1 ${
                        canIncreaseQuantity(item)
                          ? "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                          : "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-base font-medium">
                    ${(item.variant.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="fixed right-0 top-0 z-40 h-full w-full bg-white shadow-xl sm:w-[400px] dark:bg-zinc-900"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              {checkoutStep !== "cart" && (
                <button
                  onClick={() =>
                    void setCheckoutStep(
                      checkoutStep === "shipping"
                        ? isGuest
                          ? "auth"
                          : "cart"
                        : "cart",
                    )
                  }
                  className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h2 className="text-lg font-medium">
                {checkoutStep === "cart"
                  ? "Shopping Cart"
                  : checkoutStep === "auth"
                    ? "Checkout"
                    : "Shipping Information"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {renderStepContent()}

          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-4 flex justify-between">
              <span className="text-base">Subtotal</span>
              <span className="text-base font-medium">${total.toFixed(2)}</span>
            </div>
            {hasPhysicalItems && checkoutStep === "cart" && (
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Shipping costs will be calculated at checkout
              </p>
            )}
            {showSavePrompt ? (
              <div className="mb-4 space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <p className="text-sm">
                  Would you like to save your shipping information for future
                  orders?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => void proceedToCheckout(false)}
                  >
                    No, Continue
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => void proceedToCheckout(true)}
                  >
                    Yes, Save
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full"
              >
                {checkoutStep === "cart"
                  ? "Proceed to Checkout"
                  : checkoutStep === "auth"
                    ? "Continue"
                    : "Proceed to Payment"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
