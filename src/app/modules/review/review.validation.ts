import { z } from "zod";

const createReviewSchema = z.object({
  product: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
  rating:  z.coerce.number({ error: "Rating is required" }).int().min(1).max(5),
  comment: z.string({ error: "Comment is required" }).trim().min(3).max(1000),
});

const updateReviewSchema = z.object({
  rating:  z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(3).max(1000).optional(),
});

export const ReviewValidation = { createReviewSchema, updateReviewSchema };
