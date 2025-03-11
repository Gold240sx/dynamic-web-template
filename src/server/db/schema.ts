// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  int,
  sqliteTableCreator,
  text,
  integer,
  type SQLiteTableFn,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { type InferModel } from "drizzle-orm";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `server-client-t3-blog_${name}`,
);

export const productCategories = createTable(
  "product_category",
  {
    id: text("id").primaryKey(),
    name: text("name", { length: 256 }).notNull().unique(),
    description: text("description"),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (category) => ({
    nameIndex: index("category_name_idx").on(category.name),
  }),
);

export const products = createTable(
  "product",
  {
    id: text("id").primaryKey(),
    name: text("name", { length: 256 }).notNull(),
    description: text("description").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => productCategories.id),
    isLive: int("is_live", { mode: "boolean" }).notNull().default(false),
    stripeProductId: text("stripe_product_id").default(""),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (product) => ({
    categoryIndex: index("category_idx").on(product.categoryId),
    nameIndex: index("name_idx").on(product.name),
  }),
);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    title: text("title", { length: 256 }).notNull(),
    slug: text("slug", { length: 256 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt", { length: 512 }),
    published: int("published", { mode: "boolean" }).notNull().default(false),
    authorId: text("author_id").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (post) => ({
    slugIndex: index("slug_idx").on(post.slug),
    titleIndex: index("title_idx").on(post.title),
    authorIndex: index("author_idx").on(post.authorId),
  }),
);

export const shippingEstimates = createTable(
  "shipping_estimates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    estimatedDays: integer("estimated_days").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    variantIdIdx: index("shipping_estimates_variant_id_idx").on(
      table.variantId,
    ),
  }),
);

export const siteSettings = createTable(
  "site_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    shipmentGroupingDays: integer("shipment_grouping_days")
      .notNull()
      .default(7),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    idIdx: index("site_settings_id_idx").on(table.id),
  }),
);

export type ShippingEstimate = InferModel<typeof shippingEstimates>;
export type SiteSettings = InferModel<typeof siteSettings>;

export const productVariants = createTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name", { length: 256 }).notNull(),
    description: text("description"),
    price: int("price", { mode: "number" }).notNull(),
    stock: int("stock", { mode: "number" }).notNull().default(-1),
    isDigital: int("is_digital", { mode: "boolean" }).notNull().default(false),
    isLive: int("is_live", { mode: "boolean" }).notNull().default(false),
    stripeProductId: text("stripe_product_id"),
    attributes: text("attributes", { mode: "json" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
    isPhysical: integer("is_physical", { mode: "boolean" })
      .notNull()
      .default(false),
    weight: integer("weight_in_grams").default(0),
    length: integer("length_in_mm").default(0),
    width: integer("width_in_mm").default(0),
    height: integer("height_in_mm").default(0),
    requiresShipping: integer("requires_shipping", { mode: "boolean" })
      .notNull()
      .default(false),
    flatRateShipping: integer("flat_rate_shipping_cents").default(0),
  },
  (table) => ({
    productIdIdx: index("product_variants_product_id_idx").on(table.productId),
  }),
);

export const variantImages = createTable(
  "variant_image",
  {
    id: text("id").primaryKey(),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title", { length: 256 }).notNull(),
    order: int("order", { mode: "number" }).notNull().default(0),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (image) => ({
    variantIdIndex: index("variant_id_idx").on(image.variantId),
  }),
);

export const orders = createTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id),
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    // Shipping details
    requiresShipping: integer("requires_shipping", {
      mode: "boolean",
    }).notNull(),
    shippingName: text("shipping_name"),
    shippingAddressLine1: text("shipping_address_line1"),
    shippingAddressLine2: text("shipping_address_line2"),
    shippingCity: text("shipping_city"),
    shippingState: text("shipping_state"),
    shippingPostalCode: text("shipping_postal_code"),
    shippingCountry: text("shipping_country"),
    // Billing details
    billingAddressLine1: text("billing_address_line1").notNull(),
    billingAddressLine2: text("billing_address_line2"),
    billingCity: text("billing_city").notNull(),
    billingState: text("billing_state").notNull(),
    billingPostalCode: text("billing_postal_code").notNull(),
    billingCountry: text("billing_country").notNull(),
    // Payment details
    currency: text("currency").notNull(),
    amountSubtotal: integer("amount_subtotal").notNull(),
    amountTotal: integer("amount_total").notNull(),
    amountTax: integer("amount_tax").notNull(),
    amountShipping: integer("amount_shipping").notNull(),
    paymentStatus: text("payment_status").notNull(),
    // Shipping status
    shippingStatus: text("shipping_status").notNull().default("pending"),
    shippingCarrier: text("shipping_carrier"),
    trackingNumber: text("tracking_number"),
    // Metadata
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    stripeSessionIdIdx: index("orders_stripe_session_id_idx").on(
      table.stripeSessionId,
    ),
    customerEmailIdx: index("orders_customer_email_idx").on(
      table.customerEmail,
    ),
    userIdIdx: index("orders_user_id_idx").on(table.userId),
  }),
);

export const orderItems = createTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    subtotal: integer("subtotal").notNull(),
    name: text("name").notNull(),
    variantName: text("variant_name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
    variantIdIdx: index("order_items_variant_id_idx").on(table.variantId),
  }),
);

export const users = createTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    password: text("password"),
    avatarUrl: text("avatar_url"),
    billingAddress: text("billing_address", { mode: "json" }),
    paymentMethod: text("payment_method", { mode: "json" }),
    role: text("role", { enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  }),
);

export const subscriptionProducts = createTable(
  "subscription_products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    description: text("description"),
    active: int("active", { mode: "boolean" }).notNull().default(true),
    image: text("image"),
    metadata: text("metadata", { mode: "json" }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    nameIdx: index("subscription_products_name_idx").on(table.name),
  }),
);

export const subscriptionPrices = createTable(
  "subscription_prices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => subscriptionProducts.id),
    active: int("active", { mode: "boolean" }).notNull().default(true),
    currency: text("currency").notNull().default("usd"),
    interval: text("interval", {
      enum: ["day", "week", "month", "year"],
    }).notNull(),
    intervalCount: int("interval_count").notNull().default(1),
    trialPeriodDays: int("trial_period_days"),
    type: text("type", {
      enum: ["one_time", "recurring"],
    }).notNull(),
    unitAmount: int("unit_amount").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    productIdx: index("subscription_prices_product_idx").on(table.productId),
  }),
);

export const subscriptions = createTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    priceId: text("price_id")
      .notNull()
      .references(() => subscriptionPrices.id),
    status: text("status", {
      enum: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
    }).notNull(),
    metadata: text("metadata", { mode: "json" }),
    cancelAt: int("cancel_at", { mode: "timestamp" }),
    cancelAtPeriodEnd: int("cancel_at_period_end", { mode: "boolean" })
      .notNull()
      .default(false),
    canceledAt: int("canceled_at", { mode: "timestamp" }),
    currentPeriodStart: int("current_period_start", {
      mode: "timestamp",
    }).notNull(),
    currentPeriodEnd: int("current_period_end", {
      mode: "timestamp",
    }).notNull(),
    endedAt: int("ended_at", { mode: "timestamp" }),
    trialStart: int("trial_start", { mode: "timestamp" }),
    trialEnd: int("trial_end", { mode: "timestamp" }),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    userIdx: index("subscriptions_user_idx").on(table.userId),
    priceIdx: index("subscriptions_price_idx").on(table.priceId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
  }),
);

export const subscriptionProductsRelations = relations(
  subscriptionProducts,
  ({ many }) => ({
    prices: many(subscriptionPrices),
  }),
);

export const subscriptionPricesRelations = relations(
  subscriptionPrices,
  ({ one }) => ({
    product: one(subscriptionProducts, {
      fields: [subscriptionPrices.productId],
      references: [subscriptionProducts.id],
    }),
  }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  price: one(subscriptionPrices, {
    fields: [subscriptions.priceId],
    references: [subscriptionPrices.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));
