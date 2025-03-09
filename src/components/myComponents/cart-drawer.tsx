import { motion } from "motion/react";
import { ArrowLeft, Minus, Plus, X } from "lucide-react";
import type { CartItem } from "~/context/store-context";
import Image from "next/image";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeAddressElementChangeEvent } from "@stripe/stripe-js";
import { AddressForm } from "./address-form";
import { env } from "~/env.js";

// Initialize Stripe outside of component
const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export function CartDrawer({
  cart,
  onClose,
  onRemoveFromCart,
  onUpdateQuantity,
}: CartDrawerProps) {
  const router = useRouter();
  const { mutateAsync: createCheckoutSession } =
    api.checkout.createSession.useMutation();

  const [checkoutStep, setCheckoutStep] = useQueryState("checkoutStep", {
    defaultValue: "cart",
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });
  const [email, setEmail] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  );

  const hasPhysicalItems = cart.some((item) => !item.variant.isDigital);

  const canIncreaseQuantity = (item: CartItem) => {
    return item.variant.stock === -1 || item.quantity < item.variant.stock;
  };

  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    if (event.complete) {
      const address = event.value.address;
      setShippingAddress({
        line1: address?.line1 ?? "",
        line2: address?.line2 ?? undefined,
        city: address?.city ?? "",
        state: address?.state ?? "",
        postal_code: address?.postal_code ?? "",
        country: address?.country ?? "US",
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

      // For physical items, move to shipping step
      if (hasPhysicalItems && checkoutStep === "cart") {
        void setCheckoutStep("shipping");
        return;
      }

      // For digital items, collect email first
      if (!hasPhysicalItems && !email) {
        void setCheckoutStep("shipping");
        return;
      }

      // Validate email format
      const emailRegex = new RegExp(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      );
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Check if shipping address is needed and valid
      if (hasPhysicalItems && !shippingAddress.line1) {
        toast.error("Please enter a valid shipping address");
        return;
      }

      const session = await createCheckoutSession({
        items: cart.map((item) => ({
          id: item.variant.id,
          quantity: item.quantity,
          price: item.variant.price,
          name: `${item.productName} - ${item.variant.name}`,
          stripeProductId: item.variant.stripeProductId!,
          isDigital: item.variant.isDigital,
        })),
        shippingAddress: hasPhysicalItems ? shippingAddress : undefined,
        email,
      });

      if (session?.url) {
        router.push(session.url);
      } else {
        toast("Checkout Failed", {
          description: "Failed to create checkout session",
          action: {
            label: "Try Again",
            onClick: () => void handleCheckout(),
          },
        });
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast("Checkout Error", {
        description:
          err instanceof Error
            ? err.message
            : "Failed to create checkout session",
        action: {
          label: "Try Again",
          onClick: () => void handleCheckout(),
        },
      });
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
              {checkoutStep === "shipping" && (
                <button
                  onClick={() => void setCheckoutStep("cart")}
                  className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h2 className="text-lg font-medium">
                {checkoutStep === "cart"
                  ? "Shopping Cart"
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

          {checkoutStep === "cart" ? (
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
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email for Receipt</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Elements stripe={stripePromise}>
                  <AddressForm onAddressChange={handleAddressChange} />
                </Elements>
              </div>
            </div>
          )}

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
            <button
              onClick={handleCheckout}
              disabled={
                cart.length === 0 || (checkoutStep === "shipping" && !email)
              }
              className="w-full rounded-lg bg-zinc-900 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {cart.length === 0
                ? "Cart is empty"
                : checkoutStep === "cart"
                  ? "Checkout"
                  : "Payment"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
