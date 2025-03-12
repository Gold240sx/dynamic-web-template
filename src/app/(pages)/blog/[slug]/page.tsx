import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "~/lib/utils";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { generateMetadata } from "../../../../components/pages/blog/metadata";
import { BlogShareButton } from "~/components/pages/blog/blog-share-button";

export const dynamic = "force-dynamic";

export { generateMetadata };

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  );
  const post = await caller.post.getBySlug({ slug });

  if (!post) return notFound();

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <nav className="mb-8 flex items-center gap-x-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Blog
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{post.title}</span>
      </nav>

      <article>
        {post.image && (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={675}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-4xl font-bold">{post.title}</h1>
            <BlogShareButton title={post.title} excerpt={post.excerpt} />
          </div>
          <div className="text-muted-foreground flex items-center gap-x-4 text-sm">
            <time dateTime={post.createdAt.toISOString()}>
              {formatDate(post.createdAt)}
            </time>
            {!post.published && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                Draft
              </span>
            )}
          </div>
        </header>

        {post.excerpt && (
          <p className="text-muted-foreground mb-8 text-xl">{post.excerpt}</p>
        )}

        <div className="prose prose-lg max-w-none">{post.content}</div>
      </article>
    </div>
  );
}
