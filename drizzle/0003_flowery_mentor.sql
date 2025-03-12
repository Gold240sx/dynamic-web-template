ALTER TABLE `blog_comments` RENAME TO `server-client-t3-blog_blog_comments`;--> statement-breakpoint
ALTER TABLE `comment_responses` RENAME TO `server-client-t3-blog_comment_responses`;--> statement-breakpoint
ALTER TABLE `review_responses` RENAME TO `server-client-t3-blog_review_responses`;--> statement-breakpoint
ALTER TABLE `users` RENAME TO `server-client-t3-blog_users`;--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
CREATE INDEX `blog_comments_post_idx` ON `server-client-t3-blog_blog_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `blog_comments_user_idx` ON `server-client-t3-blog_blog_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `comment_responses_comment_idx` ON `server-client-t3-blog_comment_responses` (`comment_id`);--> statement-breakpoint
CREATE INDEX `comment_responses_user_idx` ON `server-client-t3-blog_comment_responses` (`user_id`);--> statement-breakpoint
CREATE INDEX `review_responses_review_idx` ON `server-client-t3-blog_review_responses` (`review_id`);--> statement-breakpoint
CREATE INDEX `review_responses_user_idx` ON `server-client-t3-blog_review_responses` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `server-client-t3-blog_users` (`email`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/