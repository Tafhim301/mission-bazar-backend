import { z } from "zod";
import { ProductStatus } from "./product.interface";

const specificationSchema = z.object({
  key: z.string({ error: "Specification key must be a string" }).min(1),
  value: z.string({ error: "Specification value must be a string" }).min(1),
});

const objectIdSchema = z
  .string({ error: "Must be a valid ID" })
  .regex(/^[a-f\d]{24}$/i, "Must be a valid 24-character MongoDB ObjectId");

const createProductSchema = z
  .object({
    name: z.string({ error: "Product name is required" }).trim().min(2).max(200),
    description: z.string().trim().optional(),
    // z.coerce.number() is required here because multipart/form-data sends
    // all field values as strings (e.g. "599") -- z.number() would reject them.
    price: z.coerce.number({ error: "Price is required" }).min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    category: objectIdSchema,
    brand: z.string().trim().optional(),
    stock: z.coerce.number({ error: "Stock is required" }).int().min(0),
    tags: z.array(z.string()).optional().default([]),
    specifications: z.array(specificationSchema).optional().default([]),
    status: z
      .enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.DRAFT], {
        error: "Status must be ACTIVE, INACTIVE, or DRAFT",
      })
      .optional()
      .default(ProductStatus.DRAFT),
  })
  .refine(
    (d) => d.discountPrice === undefined || d.discountPrice < d.price,
    { message: "Discount price must be less than the regular price", path: ["discountPrice"] }
  );

const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().optional(),
    price: z.coerce.number().min(0).optional(),
    discountPrice: z.coerce.number().min(0).optional(),
    category: objectIdSchema.optional(),
    brand: z.string().trim().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
    specifications: z.array(specificationSchema).optional(),
    deleteImages: z.array(z.string()).optional(),
  })
  .refine(
    (d) =>
      d.discountPrice === undefined || d.price === undefined || d.discountPrice < d.price,
    { message: "Discount price must be less than the regular price", path: ["discountPrice"] }
  );

const updateProductStatusSchema = z.object({
  status: z.enum(
    [ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.DRAFT],
    { error: "Status must be ACTIVE, INACTIVE, or DRAFT" }
  ),
});

export const ProductValidation = {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
};
