import { z } from "zod";
import { CategoryType } from "./category.interface";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createCategorySchema = z.object({
  name:   z.string({ error: "Name is required" }).trim().min(2).max(100),
  type:   z.enum([CategoryType.MAIN, CategoryType.SUB, CategoryType.PRODUCT], { error: "Invalid category type" }),
  parent: objectIdSchema.optional(),
  isActive: z.boolean().optional().default(true),
}).refine((d) => {
  // SUB and PRODUCT categories must have a parent
  if (d.type !== CategoryType.MAIN && !d.parent) return false;
  return true;
}, { message: "SUB and PRODUCT categories require a parent", path: ["parent"] });

const updateCategorySchema = z.object({
  name:     z.string().trim().min(2).max(100).optional(),
  type:     z.enum([CategoryType.MAIN, CategoryType.SUB, CategoryType.PRODUCT]).optional(),
  parent:   objectIdSchema.optional(),
  isActive: z.boolean().optional(),
});

export const CategoryValidation = { createCategorySchema, updateCategorySchema };
