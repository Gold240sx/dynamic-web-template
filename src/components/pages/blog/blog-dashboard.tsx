"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import BlogFormContent from "./blog-form";
import BlogPreviewModal from "./blog-preview-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function BlogDashboardContent() {
  const [mode, setMode] = useQueryState("mode", {
    defaultValue: "list",
    parse: (value: string) => value as "list" | "create" | "edit",
  });
  const [editId, setEditId] = useQueryState("editId");
  const [previewPost, setPreviewPost] = useState<number | null>(null);

  const utils = api.useContext();
  const { data: posts, isLoading } = api.post.getAllPosts.useQuery();
  const { data: postToPreview } = api.post.getById.useQuery(
    { id: previewPost! },
    { enabled: previewPost !== null },
  );
  const { mutate: deletePost } = api.post.delete.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      void utils.post.getAllPosts.invalidate();
    },
  });

  if (mode === "create" || mode === "edit") {
    return <BlogFormContent postId={editId} />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button
          onClick={() => {
            void setMode("create");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts?.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    post.published
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewPost(post.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void setEditId(String(post.id));
                      void setMode("edit");
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this post?",
                        )
                      ) {
                        deletePost({ id: post.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BlogPreviewModal
        post={
          postToPreview
            ? {
                title: postToPreview.title,
                content: postToPreview.content,
                excerpt: postToPreview.excerpt,
                createdAt: postToPreview.createdAt,
                published: postToPreview.published,
              }
            : null
        }
        isOpen={previewPost !== null}
        onClose={() => setPreviewPost(null)}
      />
    </div>
  );
}
