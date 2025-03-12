-- Add viewed_at column to blog_comments
ALTER TABLE "server-client-t3-blog_blog_comments" ADD COLUMN "viewed_at" integer;

-- Add viewed_at column to product_reviews
ALTER TABLE "server-client-t3-blog_product_reviews" ADD COLUMN "viewed_at" integer;

-- Add viewed_at column to company_reviews
ALTER TABLE "server-client-t3-blog_company_reviews" ADD COLUMN "viewed_at" integer;

-- Add viewed_at column to orders
ALTER TABLE "server-client-t3-blog_orders" ADD COLUMN "viewed_at" integer; 