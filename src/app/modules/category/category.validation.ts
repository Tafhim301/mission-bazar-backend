import { z } from "zod";
import { CategoryType } from "./category.interface";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const createCategorySchema = z.object({
  name:     z.string({ error: "Name is required" }).trim().min(2).max(100),
  type:     z.enum([CategoryType.MAIN, CategoryType.SUB, CategoryType.SUB_SUB], {
              error: "Type must be MAIN | SUB | SUB_SUB",
            }),
  parent:   objectIdSchema.optional(),
  isActive: z.boolean().optional().default(true),
  order:    z.coerce.number().int().min(0).optional().default(0),
}).refine((d) => {
  // SUB and SUB_SUB require a parent; MAIN must not have one
  if (d.type !== CategoryType.MAIN && !d.parent) return false;
  return true;
}, { message: "SUB and SUB_SUB categories require a parent", path: ["parent"] });

export const updateCategorySchema = z.object({
  name:     z.string().trim().min(2).max(100).optional(),
  type:     z.enum([CategoryType.MAIN, CategoryType.SUB, CategoryType.SUB_SUB]).optional(),
  parent:   objectIdSchema.optional(),
  isActive: z.boolean().optional(),
  order:    z.coerce.number().int().min(0).optional(),
});

export const CategoryValidation = { createCategorySchema, updateCategorySchema };
