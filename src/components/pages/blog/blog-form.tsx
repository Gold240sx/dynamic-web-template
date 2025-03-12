"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import Link from "next/link";
import { useEffect } from "react";

import { type BlogFormData, blogFormSchema } from "~/lib/validations/blog";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";

interface BlogFormContentProps {
  postId?: string | null;
}

export default function BlogFormContent({ postId }: BlogFormContentProps) {
  const router = useRouter();
  const [draft] = useQueryState("draft");
  const utils = api.useContext();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      published: draft ? false : true,
    },
  });

  const { data: post } = api.post.getById.useQuery(
    { id: Number(postId) },
    { enabled: !!postId },
  );

  const { mutate: createPost, isPending: isCreating } =
    api.post.create.useMutation({
      onSuccess: (data) => {
        if (data?.slug) {
          void utils.post.getAllPosts.invalidate();
          router.push(`/blog/${data.slug}`);
        }
      },
    });

  const { mutate: updatePost, isPending: isUpdating } =
    api.post.update.useMutation({
      onSuccess: (data) => {
        if (data?.slug) {
          void utils.post.getAllPosts.invalidate();
          router.push(`/blog/${data.slug}`);
        }
      },
    });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt ?? "",
        published: post.published,
      });
    }
  }, [post, form]);

  const onSubmit = (data: BlogFormData) => {
    if (postId) {
      updatePost({ id: Number(postId), ...data });
    } else {
      createPost(data);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <nav className="mb-8 flex items-center gap-x-4">
        <Link
          href="/dashboard/blog"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Back to Blog Dashboard
        </Link>
      </nav>

      <h1 className="mb-8 text-3xl font-bold">
        {postId ? "Edit Blog Post" : "Create New Blog Post"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter post title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your post content here..."
                    className="min-h-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief excerpt..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish</FormLabel>
                  <div className="text-muted-foreground text-sm">
                    Make this post public
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? postId
                ? "Updating..."
                : "Creating..."
              : postId
                ? "Update Post"
                : "Create Post"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
