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
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = Cookies.get(CART_COOKIE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as CartItem[];
    } catch {
      return [];
    }
  });

  // Load cart from cookies on mount
  useEffect(() => {
    const savedCart = Cookies.get(CART_COOKIE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsedCart) && parsedCart.every(isValidCartItem)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error("Failed to parse cart from cookie:", error);
        Cookies.remove(CART_COOKIE_KEY);
      }
    }
  }, []);

  // Type guard for CartItem
  function isValidCartItem(item: unknown): item is CartItem {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "productId" in item &&
      "productName" in item &&
      "variant" in item &&
      "quantity" in item &&
      typeof (item as CartItem).quantity === "number"
    );
  }

  // Save cart to cookies whenever it changes
  useEffect(() => {
    if (cart.length === 0) {
      Cookies.remove(CART_COOKIE_KEY);
    } else {
      Cookies.set(CART_COOKIE_KEY, JSON.stringify(cart), { expires: 7 }); // Expires in 7 days
    }
  }, [cart]);

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
