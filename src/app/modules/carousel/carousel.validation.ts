import { z } from "zod";

const createCarouselSchema = z.object({
  title:    z.string({ error: "Title is required" }).trim().min(2).max(150),
  subtitle: z.string().trim().max(300).optional(),
  link:     z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
  order:    z.coerce.number().int().min(0).optional().default(0),
});

const updateCarouselSchema = z.object({
  title:    z.string().trim().min(2).max(150).optional(),
  subtitle: z.string().trim().max(300).optional(),
  link:     z.string().trim().optional(),
  isActive: z.boolean().optional(),
  order:    z.coerce.number().int().min(0).optional(),
});

export const CarouselValidation = { createCarouselSchema, updateCarouselSchema };
