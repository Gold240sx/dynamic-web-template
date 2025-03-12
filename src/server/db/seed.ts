"use client";

import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  productCategories,
  products,
  productVariants,
  variantImages,
  posts,
  subscriptionProducts,
  subscriptionPrices,
  users,
  orders,
  orderItems,
  companyReviews,
} from "./schema";
import type { InferInsertModel } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Create a direct database connection without going through the environment validation
const sqlite = new Database("src/server/db/sqlite.db");
const db = drizzle(sqlite);

async function main() {
  // Clear existing data - we want to delete all rows
  /* eslint-disable drizzle/enforce-delete-with-where */
  await db.delete(variantImages);
  await db.delete(productVariants);
  await db.delete(products);
  await db.delete(productCategories);
  await db.delete(posts);
  await db.delete(subscriptionPrices);
  await db.delete(subscriptionProducts);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(companyReviews);
  await db.delete(users);
  /* eslint-enable drizzle/enforce-delete-with-where */

  // Create admin user with hashed password
  const hashedPassword = await bcrypt.hash("admin123!@#", 10);
  const adminUser = await db
    .insert(users)
    .values({
      id: createId(),
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
    })
    .returning();

  if (!adminUser[0]) {
    throw new Error("Failed to create admin user");
  }

  // Create some regular users for reviews
  const regularUsers = await db
    .insert(users)
    .values([
      {
        id: createId(),
        email: "john.doe@example.com",
        name: "John Doe",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
      {
        id: createId(),
        email: "jane.smith@example.com",
        name: "Jane Smith",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
      {
        id: createId(),
        email: "mike.wilson@example.com",
        name: "Mike Wilson",
        password: await bcrypt.hash("password123", 10),
        role: "user",
      },
      {
        id: createId(),
        email: "240designworks@gmail.com",
        name: "240 Design Works",
        password: await bcrypt.hash("12345678", 10),
        role: "user",
      },
    ])
    .returning();

  if (
    !regularUsers[0] ||
    !regularUsers[1] ||
    !regularUsers[2] ||
    !regularUsers[3]
  ) {
    throw new Error("Failed to create regular users");
  }

  // Subscription product IDs
  const premiumPlusId = "prod_RutfTUnFkw67zg"; // prod: "prod_R52C1XYtD5aP4S";
  const premiumId = "prod_RuteFP2jutz0uX"; // prod: "prod_R52A5IvfX4FoOe";

  // Seed subscription products
  await db.insert(subscriptionProducts).values([
    {
      id: premiumPlusId,
      name: "Baruchu Premium +",
      description:
        "For $15/month, You have access to unlimited subscription notifications, access to create groups.",
      active: true,
      image:
        "https://stripe-camo.global.ssl.fastly.net/5968a64198e1ed2787f067da1eb4dfa9d6f5b19828a2e0ae322d824a29537391/68747470733a2f2f66696c65732e7374726970652e636f6d2f6c696e6b732f4d44423859574e6a64463878547a4a3656304e436433677764314e48546e457966475a7358327870646d5666547a4a346358553361446431596b67315a32387757456c51646d78454e6b39453030666271446e433032",
    },
    {
      id: premiumId,
      name: "Baruchu Premium",
      description:
        "Support this platform and the channels that you subscribe to for a monthly donation of $10",
      active: true,
      image:
        "https://d1wqzb5bdbcre6.cloudfront.net/304262e169aa76763cb6678b1a4934d69385ca4230fd425f3288fdd72c46429d/68747470733a2f2f66696c65732e7374726970652e636f6d2f6c696e6b732f4d44423859574e6a64463878547a4a3656304e436433677764314e48546e457966475a7358327870646d56664e6e6c5a5647383154485a4753456c51636d64704d586c715358684965564179303033626d3963567867",
    },
  ]);

  // Seed subscription prices with existing Stripe price IDs
  await db.insert(subscriptionPrices).values([
    // Premium Plus Monthly
    {
      id: "price_1R13sCBwx0wSGNq2j2FCNmmR", // prod: "price_1QCs89Bwx0wSGNq2Av4glMtP",
      productId: premiumPlusId,
      currency: "usd",
      type: "recurring",
      unitAmount: 1500,
      interval: "month",
      intervalCount: 1,
      active: true,
    },
    // Premium Plus Yearly
    {
      id: "price_1R13smBwx0wSGNq2cB4HtkHr", // prod: "price_1QCsAzBwx0wSGNq2mXYLYtpI",
      productId: premiumPlusId,
      currency: "usd",
      type: "recurring",
      unitAmount: 11000,
      interval: "year",
      intervalCount: 1,
      active: true,
    },
    // Premium Monthly
    {
      id: "price_1R13r5Bwx0wSGNq23HRrgseL", // prod: "price_1QCs6GBwx0wSGNq2dcjZZZJQ",
      productId: premiumId,
      currency: "usd",
      type: "recurring",
      unitAmount: 1000,
      interval: "month",
      intervalCount: 1,
      active: true,
    },
    // Premium Yearly
    {
      id: "price_1R13r5Bwx0wSGNq2zjDYYhBy", // prod: "price_1QCs9iBwx0wSGNq2STYaEoM2",
      productId: premiumId,
      currency: "usd",
      type: "recurring",
      unitAmount: 7500,
      interval: "year",
      intervalCount: 1,
      active: true,
    },
    // Premium Lifetime
    {
      id: "price_1R13r5Bwx0wSGNq2dH2awX3d", // prod: "price_1R0xK7Bwx0wSGNq2OwFTY3I4",
      productId: premiumId,
      currency: "usd",
      type: "one_time",
      unitAmount: 30000,
      interval: "year",
      intervalCount: 1,
      active: true,
    },
  ]);

  // Add company reviews
  await db.insert(companyReviews).values([
    {
      id: createId(),
      userId: regularUsers[0].id,
      content:
        "Amazing service and quality products! The customer support team went above and beyond to help me with my order. Will definitely be shopping here again.",
      rating: 5,
      isApproved: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: createId(),
      userId: regularUsers[1].id,
      content:
        "Great selection of products and fast shipping. The website is easy to navigate, and I love the new digital goods section. The prices are competitive too!",
      rating: 4,
      isApproved: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: createId(),
      userId: regularUsers[2].id,
      content:
        "Exceptional experience from start to finish. The quality of their fruits is outstanding, and their subscription service is a game-changer. Highly recommend!",
      rating: 5,
      isApproved: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Seed product categories
  const categories = await db
    .insert(productCategories)
    .values([
      { id: createId(), name: "Software", description: "Software products" },
      { id: createId(), name: "Fruits", description: "Fresh fruits" },
    ])
    .returning();

  const softwareCategory = categories.find((c) => c.name === "Software");
  const fruitsCategory = categories.find((c) => c.name === "Fruits");

  if (!softwareCategory || !fruitsCategory) {
    throw new Error("Failed to create required categories");
  }

  // Seed products
  const orangesProductResult = await db
    .insert(products)
    .values({
      id: createId(),
      name: "Oranges",
      description: "Many kinds of delicious juicy oranges",
      categoryId: fruitsCategory.id,
      isLive: true,
    })
    .returning();

  const demoProductResult = await db
    .insert(products)
    .values({
      id: createId(),
      name: "Digital Goods - Free Demo",
      description: "Demo",
      categoryId: softwareCategory.id,
      isLive: true,
    })
    .returning();

  if (!orangesProductResult[0] || !demoProductResult[0]) {
    throw new Error("Failed to create products");
  }

  const orangesProduct = orangesProductResult[0];
  const demoProduct = demoProductResult[0];

  // Seed variants for oranges
  const orangeVariantsResult = await db
    .insert(productVariants)
    .values([
      {
        id: createId(),
        productId: orangesProduct.id,
        name: "Mandarin",
        description: "small, with big flavor!",
        price: 4.99,
        stock: -1,
        isDigital: false,
        isLive: true,
        stripeProductId: "prod_RutTKypkW9mJpm", // prod: "prod_RuGIZSP89oRjML"
        attributes: JSON.stringify({}),
      },
      {
        id: createId(),
        productId: orangesProduct.id,
        name: "Blood Orange",
        description: "Unique tart taste",
        price: 8.99,
        stock: 5,
        isDigital: false,
        isLive: true,
        stripeProductId: "prod_RutTrx9D5dTTx3", // prod: "prod_RuGHAsspDNY6q6"
        attributes: JSON.stringify({}),
      },
      {
        id: createId(),
        productId: orangesProduct.id,
        name: "Free Oranges",
        description: "Free oranges for the needy",
        price: 0,
        stock: -1,
        isDigital: false,
        isLive: true,
        stripeProductId: "prod_RutWcHVdRMDarp", // prod: "prod_RuM5Kf2ftqdp7A"
        attributes: JSON.stringify({}),
      },
    ])
    .returning();

  // Seed variant for demo product
  const demoVariantResult = await db
    .insert(productVariants)
    .values({
      id: createId(),
      productId: demoProduct.id,
      name: "Demo",
      description: "Demo digital product",
      price: 0,
      stock: -1,
      isDigital: true,
      isLive: true,
      stripeProductId: "prod_RutX085K8SAIyv", // prod: "prod_RuUpEz67o5neJz"
      attributes: JSON.stringify({}),
    })
    .returning();

  if (!orangeVariantsResult[0] || !demoVariantResult[0]) {
    throw new Error("Failed to create variants");
  }

  const orangeVariants = orangeVariantsResult;
  const demoVariant = demoVariantResult[0];

  // Verify we have all orange variants
  if (!orangeVariants[0] || !orangeVariants[1] || !orangeVariants[2]) {
    throw new Error("Failed to create all orange variants");
  }

  // Seed images for orange variants
  await db.insert(variantImages).values([
    {
      id: createId(),
      variantId: orangeVariants[0].id,
      url: "https://www.shutterstock.com/shutterstock/photos/2053015835/display_1500/stock-photo-orange-with-sliced-and-green-leaves-isolated-on-white-background-2053015835.jpg",
      title: "Mandarin",
      order: 0,
    },
    {
      id: createId(),
      variantId: orangeVariants[1].id,
      url: "https://motherwouldknow.com/wp-content/uploads/2014/01/20140127bloodorangecut.jpg",
      title: "Blood Orange",
      order: 0,
    },
    {
      id: createId(),
      variantId: orangeVariants[2].id,
      url: "https://www.gardenzeus.com/wp-content/uploads/GZctorange-2.jpg",
      title: "Free Oranges",
      order: 0,
    },
  ]);

  // Seed image for demo variant
  await db.insert(variantImages).values({
    id: createId(),
    variantId: demoVariant.id,
    url: "https://www.shutterstock.com/image-photo/igniting-innovation-harnessing-power-coding-600w-2425426569.jpg",
    title: "Demo",
    order: 0,
  });

  // Seed blog posts
  await db.insert(posts).values([
    {
      title: "Welcome to Our Store",
      slug: "welcome",
      image:
        "https://thumbs.dreamstime.com/b/blogging-blog-concepts-ideas-worktable-blogging-blog-concepts-ideas-white-worktable-110423482.jpg",
      content:
        "Welcome to our store! We're excited to serve you with the best products.",
      excerpt: "A warm welcome to all our customers",
      published: true,
      authorId: adminUser[0].id,
    },
  ]);

  console.log("Database has been seeded");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
