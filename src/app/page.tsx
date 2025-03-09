import Link from "next/link";
import { formatDate } from "~/lib/utils";
import { ErrorBoundary } from "~/app/_components/error-boundary";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function RecentPosts() {
  try {
    const recentPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))
      .limit(3);

    if (recentPosts.length === 0) {
      return null;
    }

    return (
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Recent Posts</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <h3 className="mb-2 text-lg font-semibold group-hover:text-[hsl(280,100%,70%)]">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                  {post.excerpt}
                </p>
              )}
              <time
                className="text-muted-foreground text-sm"
                dateTime={post.createdAt.toISOString()}
              >
                {formatDate(post.createdAt)}
              </time>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    return null;
  }
}

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-zinc-200 to-white text-center dark:from-zinc-900 dark:to-zinc-950">
      <div className="container px-4">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
          Welcome to T3 Store
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          A modern e-commerce platform built with the T3 Stack, featuring a blog
          system and a powerful dashboard.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Browse Shop
          </Link>
          <Link
            href="/blog"
            className="rounded-lg bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Read Blog
          </Link>
          <Link
            href="/dashboard/store"
            className="rounded-lg bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Manage Store
          </Link>
        </div>
      </div>
    </div>
  );
}
