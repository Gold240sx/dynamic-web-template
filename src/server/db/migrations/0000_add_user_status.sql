-- Add status column to users table
ALTER TABLE "server-client-t3-blog_users" ADD COLUMN "status" text NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'suspended'));

-- Create index for status column
CREATE INDEX "status_idx" ON "server-client-t3-blog_users" ("status"); 