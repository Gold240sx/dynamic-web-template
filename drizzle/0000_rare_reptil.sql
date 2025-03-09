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
CREATE INDEX `variant_id_idx` ON `server-client-t3-blog_variant_image` (`variant_id`);