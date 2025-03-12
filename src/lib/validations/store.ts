import { z } from "zod";

export const productReviewSchema = z.object({
  productId: z.string(),
  content: z.string().min(1).max(1000),
  rating: z.number().min(1).max(5),
});

export const productReviewUpdateSchema = z.object({
  id: z.string(),
  isApproved: z.boolean(),
});

export const companyReviewSchema = z.object({
  content: z.string().min(1).max(1000),
  rating: z.number().min(1).max(5),
});

export const companyReviewUpdateSchema = z.object({
  id: z.string(),
  isApproved: z.boolean(),
});
