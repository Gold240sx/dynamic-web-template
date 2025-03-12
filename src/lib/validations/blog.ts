import * as z from "zod";

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(256, "Title must be less than 256 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z
    .string()
    .max(512, "Excerpt must be less than 512 characters")
    .optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  published: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  isFavorited: z.boolean().default(false),
  commentResponseType: z.enum(["admin", "all", "none"]).default("all"),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;

export const blogCommentSchema = z.object({
  postId: z.number(),
  content: z.string().min(1).max(1000),
  parentId: z.string().nullable(),
});

export const blogCommentUpdateSchema = z.object({
  id: z.string(),
  isApproved: z.boolean(),
});

export const postLikeSchema = z.object({
  postId: z.number(),
});
