import Link from "next/link";
import { formatDate } from "~/lib/utils";
import { ErrorBoundary } from "~/components/error-boundary";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { PinnedPostsSidebar } from "~/components/pages/blog/pinned-posts-sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function BlogList() {
  try {
    const [allPosts, pinnedPosts] = await Promise.all([
      db
        .select()
        .from(posts)
        .where(eq(posts.published, true))
        .orderBy(desc(posts.createdAt)),
      db
        .select()
        .from(posts)
        .where(or(eq(posts.isPinned, true), eq(posts.isFavorited, true)))
        .orderBy(
          desc(posts.isPinned),
          desc(posts.isFavorited),
          desc(posts.createdAt),
        ),
    ]);

    if (!allPosts || allPosts.length === 0) {
      return (
        <div className="text-center">
          <p className="text-xl text-muted-foreground">No blog posts found.</p>
          <Link
            href="/dashboard/blog"
            className="mt-4 inline-block rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Create your first post
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <div className="space-y-8">
          {allPosts.map((post) => (
            <article
              key={post.id}
              className="group relative rounded-lg border p-6 hover:bg-muted/50"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="text-2xl font-semibold">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                )}
                <div className="mt-4 flex items-center gap-x-4 text-sm text-muted-foreground">
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <aside className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Featured Posts</h2>
            <PinnedPostsSidebar posts={pinnedPosts} />
          </div>
        </aside>
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
    <div className="container mx-auto max-w-6xl py-8">
      <nav className="mb-8 flex items-center gap-x-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
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
