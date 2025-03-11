"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "nuqs";
import Link from "next/link";

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

export default function BlogFormContent() {
  const router = useRouter();
  const [draft] = useQueryState("draft");

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      published: draft ? false : true,
    },
  });

  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: (data) => {
      if (data?.slug) {
        router.push(`/blog/${data.slug}`);
      }
    },
  });

  const onSubmit = (data: BlogFormData) => {
    createPost(data);
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
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
        <span className="text-sm">Create Post</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold">Create New Blog Post</h1>

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
            {isPending ? "Creating..." : "Create Post"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
