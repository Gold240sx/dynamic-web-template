"use client";

import Link from "next/link";
import { Pin, Star } from "lucide-react";
import { type posts } from "~/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

type Post = InferSelectModel<typeof posts>;

interface PinnedPostsSidebarProps {
  posts: Post[];
}

export function PinnedPostsSidebar({ posts }: PinnedPostsSidebarProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group relative block rounded-lg border p-4 hover:bg-muted/50"
        >
          {post.isPinned && (
            <Pin className="absolute right-2 top-2 h-4 w-4 text-yellow-500" />
          )}
          {post.isFavorited && (
            <Star className="absolute right-2 top-8 h-4 w-4 text-yellow-500" />
          )}
          <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
