CREATE TABLE `blog_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`post_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`is_draft` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `server-client-t3-blog_post`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comment_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`comment_id` text NOT NULL,
	`response_type` text DEFAULT 'all' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`is_draft` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comment_id`) REFERENCES `blog_comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_company_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`rating` integer NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_post_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `server-client-t3-blog_post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `server-client-t3-blog_product_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`rating` integer NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `server-client-t3-blog_product`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`user_id` text NOT NULL,
	`review_id` text NOT NULL,
	`review_type` text NOT NULL,
	`response_type` text DEFAULT 'all' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`is_draft` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`review_id`) REFERENCES `server-client-t3-blog_product_reviews`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`can_respond` integer DEFAULT true NOT NULL,
	`can_comment` integer DEFAULT true NOT NULL,
	`can_review` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `server-client-t3-blog_users`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `server-client-t3-blog_post` ADD `likes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `company_reviews_user_idx` ON `server-client-t3-blog_company_reviews` (`user_id`);--> statement-breakpoint
CREATE INDEX `post_likes_post_user_idx` ON `server-client-t3-blog_post_likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `product_reviews_product_idx` ON `server-client-t3-blog_product_reviews` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_reviews_user_idx` ON `server-client-t3-blog_product_reviews` (`user_id`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/