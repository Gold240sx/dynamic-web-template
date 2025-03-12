CREATE TABLE IF NOT EXISTS 'server-client-t3-blog_post_likes' (
  'id' text PRIMARY KEY NOT NULL,
  'post_id' integer NOT NULL,
  'user_id' text NOT NULL,
  'created_at' integer DEFAULT (unixepoch()) NOT NULL,
  FOREIGN KEY ('post_id') REFERENCES 'server-client-t3-blog_post'('id') ON DELETE CASCADE,
  FOREIGN KEY ('user_id') REFERENCES 'server-client-t3-blog_users'('id') ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 'server-client-t3-blog_blog_comments' (
  'id' text PRIMARY KEY NOT NULL,
  'post_id' integer NOT NULL,
  'user_id' text NOT NULL,
  'content' text NOT NULL,
  'is_approved' integer DEFAULT 0 NOT NULL,
  'created_at' integer DEFAULT (unixepoch()) NOT NULL,
  'updated_at' integer,
  FOREIGN KEY ('post_id') REFERENCES 'server-client-t3-blog_post'('id') ON DELETE CASCADE,
  FOREIGN KEY ('user_id') REFERENCES 'server-client-t3-blog_users'('id') ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 'server-client-t3-blog_product_reviews' (
  'id' text PRIMARY KEY NOT NULL,
  'product_id' text NOT NULL,
  'user_id' text NOT NULL,
  'content' text NOT NULL,
  'rating' integer NOT NULL,
  'is_approved' integer DEFAULT 0 NOT NULL,
  'created_at' integer DEFAULT (unixepoch()) NOT NULL,
  'updated_at' integer,
  FOREIGN KEY ('product_id') REFERENCES 'server-client-t3-blog_product'('id') ON DELETE CASCADE,
  FOREIGN KEY ('user_id') REFERENCES 'server-client-t3-blog_users'('id') ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 'server-client-t3-blog_company_reviews' (
  'id' text PRIMARY KEY NOT NULL,
  'user_id' text NOT NULL,
  'content' text NOT NULL,
  'rating' integer NOT NULL,
  'is_approved' integer DEFAULT 0 NOT NULL,
  'created_at' integer DEFAULT (unixepoch()) NOT NULL,
  'updated_at' integer,
  FOREIGN KEY ('user_id') REFERENCES 'server-client-t3-blog_users'('id') ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS 'post_likes_post_user_idx' ON 'server-client-t3-blog_post_likes' ('post_id', 'user_id');
CREATE INDEX IF NOT EXISTS 'blog_comments_post_idx' ON 'server-client-t3-blog_blog_comments' ('post_id');
CREATE INDEX IF NOT EXISTS 'blog_comments_user_idx' ON 'server-client-t3-blog_blog_comments' ('user_id');
CREATE INDEX IF NOT EXISTS 'product_reviews_product_idx' ON 'server-client-t3-blog_product_reviews' ('product_id');
CREATE INDEX IF NOT EXISTS 'product_reviews_user_idx' ON 'server-client-t3-blog_product_reviews' ('user_id');
CREATE INDEX IF NOT EXISTS 'company_reviews_user_idx' ON 'server-client-t3-blog_company_reviews' ('user_id');

ALTER TABLE 'server-client-t3-blog_post' ADD COLUMN 'likes' integer DEFAULT 0 NOT NULL; 