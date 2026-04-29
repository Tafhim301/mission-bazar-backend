import { z } from "zod";

const createCategorySchema = z.object({
  name: z
    .string({ error: "Category name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must not exceed 80 characters"),
  description: z.string().trim().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const CategoryValidation = { createCategorySchema, updateCategorySchema };
