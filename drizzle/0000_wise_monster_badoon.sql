CREATE TABLE `server-client-t3-blog_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`name` text NOT NULL,
	`variant_name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `server-client-t3-blog_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `server-client-t3-blog_product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`stripe_session_id` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text,
	`requires_shipping` integer NOT NULL,
	`shipping_name` text,
	`shipping_address_line1` text,
	`shipping_address_line2` text,
	`shipping_city` text,
	`shipping_state` text,
	`shipping_postal_code` text,
	`shipping_country` text,
	`billing_address_line1` text NOT NULL,
	`billing_address_line2` text,
	`billing_city` text NOT NULL,
	`billing_state` text NOT NULL,
	`billing_postal_code` text NOT NULL,
	`billing_country` text NOT NULL,
	`currency` text NOT NULL,
	`amount_subtotal` integer NOT NULL,
	`amount_total` integer NOT NULL,
	`amount_tax` integer NOT NULL,
	`amount_shipping` integer NOT NULL,
	`payment_status` text NOT NULL,
	`shipping_status` text DEFAULT 'pending' NOT NULL,
	`shipping_carrier` text,
	`tracking_number` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `server-client-t3-blog_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text(512),
	`published` integer DEFAULT false NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_product_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text(256) NOT NULL,
	`description` text,
	`price` integer NOT NULL,
	`stock` integer DEFAULT -1 NOT NULL,
	`is_digital` integer DEFAULT false NOT NULL,
	`is_live` integer DEFAULT false NOT NULL,
	`stripe_product_id` text,
	`attributes` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`is_physical` integer DEFAULT false NOT NULL,
	`weight_in_grams` integer DEFAULT 0,
	`length_in_mm` integer DEFAULT 0,
	`width_in_mm` integer DEFAULT 0,
	`height_in_mm` integer DEFAULT 0,
	`requires_shipping` integer DEFAULT false NOT NULL,
	`flat_rate_shipping_cents` integer DEFAULT 0,
	FOREIGN KEY (`product_id`) REFERENCES `server-client-t3-blog_product`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text NOT NULL,
	`category_id` text NOT NULL,
	`is_live` integer DEFAULT false NOT NULL,
	`stripe_product_id` text DEFAULT '',
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `server-client-t3-blog_product_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_shipping_estimates` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`estimated_days` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `server-client-t3-blog_product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`shipment_grouping_days` integer DEFAULT 7 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_subscription_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`interval` text NOT NULL,
	`interval_count` integer DEFAULT 1 NOT NULL,
	`trial_period_days` integer,
	`type` text NOT NULL,
	`unit_amount` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `server-client-t3-blog_subscription_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_subscription_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`active` integer DEFAULT true NOT NULL,
	`image` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`price_id` text NOT NULL,
	`status` text NOT NULL,
	`metadata` text,
	`cancel_at` integer,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`canceled_at` integer,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`ended_at` integer,
	`trial_start` integer,
	`trial_end` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `server-client-t3-blog_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`price_id`) REFERENCES `server-client-t3-blog_subscription_prices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text,
	`avatar_url` text,
	`billing_address` text,
	`payment_method` text,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_variant_image` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text(256) NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `server-client-t3-blog_product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `server-client-t3-blog_order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_variant_id_idx` ON `server-client-t3-blog_order_items` (`variant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `server-client-t3-blog_orders_stripe_session_id_unique` ON `server-client-t3-blog_orders` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `orders_stripe_session_id_idx` ON `server-client-t3-blog_orders` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `orders_customer_email_idx` ON `server-client-t3-blog_orders` (`customer_email`);--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `server-client-t3-blog_orders` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `server-client-t3-blog_post_slug_unique` ON `server-client-t3-blog_post` (`slug`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `server-client-t3-blog_post` (`slug`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `server-client-t3-blog_post` (`title`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `server-client-t3-blog_post` (`author_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `server-client-t3-blog_product_category_name_unique` ON `server-client-t3-blog_product_category` (`name`);--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `server-client-t3-blog_product_category` (`name`);--> statement-breakpoint
CREATE INDEX `product_variants_product_id_idx` ON `server-client-t3-blog_product_variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `server-client-t3-blog_product` (`category_id`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `server-client-t3-blog_product` (`name`);--> statement-breakpoint
CREATE INDEX `shipping_estimates_variant_id_idx` ON `server-client-t3-blog_shipping_estimates` (`variant_id`);--> statement-breakpoint
CREATE INDEX `site_settings_id_idx` ON `server-client-t3-blog_site_settings` (`id`);--> statement-breakpoint
CREATE INDEX `subscription_prices_product_idx` ON `server-client-t3-blog_subscription_prices` (`product_id`);--> statement-breakpoint
CREATE INDEX `subscription_products_name_idx` ON `server-client-t3-blog_subscription_products` (`name`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_idx` ON `server-client-t3-blog_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_price_idx` ON `server-client-t3-blog_subscriptions` (`price_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `server-client-t3-blog_subscriptions` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `server-client-t3-blog_users_email_unique` ON `server-client-t3-blog_users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `server-client-t3-blog_users` (`email`);--> statement-breakpoint
CREATE INDEX `variant_id_idx` ON `server-client-t3-blog_variant_image` (`variant_id`);