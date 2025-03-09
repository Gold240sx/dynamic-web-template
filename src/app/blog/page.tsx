import Link from "next/link";
import { formatDate } from "~/lib/utils";
import { ErrorBoundary } from "~/app/_components/error-boundary";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function BlogList() {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    if (!allPosts || allPosts.length === 0) {
      return (
        <div className="text-center">
          <p className="text-muted-foreground text-xl">No blog posts found.</p>
          <Link
            href="/dashboard/blog"
            className="mt-4 inline-block rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
          >
            Create your first post
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {allPosts.map((post) => (
          <article
            key={post.id}
            className="hover:bg-muted/50 group relative rounded-lg border p-6"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              {post.excerpt && (
                <p className="text-muted-foreground mt-2">{post.excerpt}</p>
              )}
              <div className="text-muted-foreground mt-4 flex items-center gap-x-4 text-sm">
                <time dateTime={post.createdAt.toISOString()}>
                  {formatDate(post.createdAt)}
                </time>
                {!post.published && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    Draft
                  </span>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return (
      <div className="text-center text-red-500">
        Failed to load blog posts. Please try again later.
      </div>
    );
  }
}

export default async function BlogListPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <nav className="mb-8 flex items-center gap-x-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">Blog</span>
      </nav>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Blog Posts</h1>
      </div>

      <ErrorBoundary>
        <BlogList />
      </ErrorBoundary>
    </div>
  );
}
