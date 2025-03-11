"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { type Product, type ProductVariant } from "~/types/store";
import Cookies from "js-cookie";

const CART_COOKIE_KEY = "store-cart";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface StoreContextType {
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: {
    product: Product;
    selectedVariant: ProductVariant;
    quantity: number;
  }) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Type guard for CartItem
  function isValidCartItem(item: unknown): item is CartItem {
    const cartItem = item as CartItem;
    return (
      typeof item === "object" &&
      item !== null &&
      typeof cartItem.id === "string" &&
      typeof cartItem.productId === "string" &&
      typeof cartItem.productName === "string" &&
      typeof cartItem.quantity === "number" &&
      typeof cartItem.variant === "object" &&
      cartItem.variant !== null &&
      typeof cartItem.variant.id === "string" &&
      typeof cartItem.variant.name === "string" &&
      typeof cartItem.variant.price === "number" &&
      typeof cartItem.variant.isDigital === "boolean" &&
      (cartItem.variant.stock === -1 ||
        typeof cartItem.variant.stock === "number") &&
      (typeof cartItem.variant.stripeProductId === "string" ||
        cartItem.variant.stripeProductId === undefined) &&
      typeof cartItem.variant.isLive === "boolean"
    );
  }

  // Load cart from cookies on mount
  useEffect(() => {
    const savedCart = Cookies.get(CART_COOKIE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsedCart) && parsedCart.every(isValidCartItem)) {
          // Add empty product object if it's missing (from simplified format)
          const cartWithProducts = parsedCart.map((item) => ({
            ...item,
            product: item.product ?? {
              id: item.productId,
              name: item.productName,
              variants: [item.variant],
            },
          }));
          setCart(cartWithProducts);
        }
      } catch (error) {
        console.error("Failed to parse cart from cookie:", error);
        Cookies.remove(CART_COOKIE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to cookies whenever it changes, but only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    try {
      if (cart.length === 0) {
        Cookies.remove(CART_COOKIE_KEY);
      } else {
        // Simplify the cart data before storing in cookie
        const simplifiedCart = cart.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          variant: {
            id: item.variant.id,
            name: item.variant.name,
            price: item.variant.price,
            images: item.variant.images,
            isDigital: item.variant.isDigital,
            stock: item.variant.stock,
            stripeProductId: item.variant.stripeProductId,
            isLive: item.variant.isLive,
          },
          quantity: item.quantity,
        }));
        Cookies.set(CART_COOKIE_KEY, JSON.stringify(simplifiedCart), {
          expires: 7,
          path: "/",
          sameSite: "strict",
        });
      }
    } catch (error) {
      console.error("Failed to save cart to cookie:", error);
    }
  }, [cart, isInitialized]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = ({
    product,
    selectedVariant,
    quantity,
  }: {
    product: Product;
    selectedVariant: ProductVariant;
    quantity: number;
  }) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.variant.id === selectedVariant.id,
      );
      if (existingItem) {
        return prev.map((item) =>
          item.variant.id === selectedVariant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: `${product.id}-${selectedVariant.id}`,
          productId: product.id,
          productName: product.name,
          product,
          variant: selectedVariant,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = useCallback(() => {
    setCart([]);
    Cookies.remove(CART_COOKIE_KEY);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
