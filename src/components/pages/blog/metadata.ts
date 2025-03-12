import { type Metadata } from "next";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caller = createCaller(
    await createTRPCContext({ headers: new Headers() }),
  );
  const post = await caller.post.getBySlug({ slug });

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.excerpt ?? `Read ${post.title} on our blog`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? `Read ${post.title} on our blog`,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      ...(post.image && {
        images: [
          {
            url: post.image,
            width: 1200,
            height: 675,
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? `Read ${post.title} on our blog`,
      ...(post.image && {
        images: [post.image],
      }),
    },
  };
}
