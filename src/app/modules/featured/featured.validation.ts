import { z } from "zod";
import { FeaturedType } from "./featured.interface";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const addFeaturedSchema = z.object({
  product:         objectIdSchema,
  type:            z.enum([FeaturedType.FLASH_SALE, FeaturedType.TRENDING]),
  discountedPrice: z.coerce.number().min(0).optional(),
  endsAt:          z.string().datetime({ offset: true }).optional(),
  order:           z.coerce.number().int().min(0).optional(),
  isActive:        z.coerce.boolean().optional(),
});

const updateFeaturedSchema = z.object({
  discountedPrice: z.coerce.number().min(0).optional(),
  endsAt:          z.string().datetime({ offset: true }).optional(),
  order:           z.coerce.number().int().min(0).optional(),
  isActive:        z.coerce.boolean().optional(),
});

export const FeaturedValidation = { addFeaturedSchema, updateFeaturedSchema };
