export interface ProductVariantImage {
  id: string;
  variantId: string;
  url: string;
  title: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  attributes: Record<string, string | number | boolean>;
  images: ProductVariantImage[];
  isLive: boolean;
  stripeProductId?: string;
  isDigital: boolean;
  isPhysical: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  requiresShipping: boolean;
  flatRateShipping: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  isLive: boolean;
  stripeProductId: string | null | undefined;
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CartItem {
  id: string;
  quantity: number;
  variant: ProductVariant;
}
