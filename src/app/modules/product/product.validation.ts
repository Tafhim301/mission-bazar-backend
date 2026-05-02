import { z } from "zod";
import { DiscountType, ProductStatus } from "./product.interface";

const specSchema     = z.object({ key: z.string().min(1), value: z.string().min(1) });
const variantSchema  = z.object({ label: z.string().min(1), value: z.string().min(1), image: z.string().url().optional() });
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createProductSchema = z
  .object({
    name:             z.string({ error: "Name is required" }).trim().min(2).max(200),
    sku:              z.string().trim().optional(),
    description:      z.string().trim().optional(),
    singleItemPrice:  z.coerce.number({ error: "Single item price is required" }).min(0),
    wholesalePrice:   z.coerce.number().min(0).optional(),
    wholesaleMinQty:  z.coerce.number().int().min(1).optional(),
    discount:         z.coerce.number().min(0).optional(),
    discountType:     z.enum([DiscountType.PERCENTAGE, DiscountType.FLAT]).optional(),
    category:         objectIdSchema,
    brand:            z.string().trim().optional(),
    stock:            z.coerce.number({ error: "Stock is required" }).int().min(0),
    tags:             z.array(z.string()).optional().default([]),
    specifications:   z.array(specSchema).optional().default([]),
    variants:         z.array(variantSchema).optional().default([]),
    freeShipping:     z.coerce.boolean().optional().default(false),
    status:           z.enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.DRAFT]).optional().default(ProductStatus.DRAFT),
  })
  .refine((d) => !d.discountType || d.discount !== undefined, { message: "discount is required when discountType is set", path: ["discount"] })
  .refine((d) => d.discountType !== DiscountType.PERCENTAGE || (d.discount ?? 0) <= 100, { message: "Percentage discount cannot exceed 100", path: ["discount"] });

const updateProductSchema = z.object({
  name:             z.string().trim().min(2).max(200).optional(),
  sku:              z.string().trim().optional(),
  description:      z.string().trim().optional(),
  singleItemPrice:  z.coerce.number().min(0).optional(),
  wholesalePrice:   z.coerce.number().min(0).optional(),
  wholesaleMinQty:  z.coerce.number().int().min(1).optional(),
  discount:         z.coerce.number().min(0).optional(),
  discountType:     z.enum([DiscountType.PERCENTAGE, DiscountType.FLAT]).optional(),
  category:         objectIdSchema.optional(),
  brand:            z.string().trim().optional(),
  stock:            z.coerce.number().int().min(0).optional(),
  tags:             z.array(z.string()).optional(),
  specifications:   z.array(specSchema).optional(),
  variants:         z.array(variantSchema).optional(),
  freeShipping:     z.coerce.boolean().optional(),
  deleteImages:     z.array(z.string()).optional(),
});

const updateProductStatusSchema = z.object({
  status: z.enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.DRAFT], { error: "Invalid status" }),
});

export const ProductValidation = { createProductSchema, updateProductSchema, updateProductStatusSchema };
