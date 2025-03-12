"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BlogPreviewModalProps {
  post: {
    title: string;
    content: string;
    excerpt?: string | null;
    createdAt: Date;
    published: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogPreviewModal({
  post,
  isOpen,
  onClose,
}: BlogPreviewModalProps) {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, "MMMM d, yyyy")}
            </time>
            <span>•</span>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                post.published
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {post.published ? "Published" : "Draft"}
            </span>
          </div>
        </DialogHeader>

        {post.excerpt && (
          <div className="text-muted-foreground mt-4">{post.excerpt}</div>
        )}

        <div className="mt-6 whitespace-pre-wrap">{post.content}</div>
      </DialogContent>
    </Dialog>
  );
}
