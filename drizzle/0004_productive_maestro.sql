ALTER TABLE `server-client-t3-blog_users` ADD `password` text;--> statement-breakpoint
ALTER TABLE `server-client-t3-blog_users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `server-client-t3-blog_users` DROP COLUMN `email_verified`;--> statement-breakpoint
ALTER TABLE `server-client-t3-blog_users` DROP COLUMN `image`;