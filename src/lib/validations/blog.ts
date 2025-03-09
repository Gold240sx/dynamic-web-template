import { z } from "zod";

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
  published: z.boolean().default(false),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;
