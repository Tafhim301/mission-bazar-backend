/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { z } from "zod";
import { DiscountType, ProductStatus } from "./product.interface";

const specSchema     = z.object({ key: z.string().min(1), value: z.string().min(1) });
const variantSchema  = z.object({ label: z.string().min(1), value: z.string().min(1), image: z.string().url().optional() });
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

/**
 * Validates a MOQ note — allows letters, digits, Bangla script, spaces, and
 * common punctuation used in quantity descriptions like "100–200 pieces" or
 * "Minimum 50 units, sold in lots".
 */
const moqNoteSchema = z
  .string()
  .trim()
  .min(2, "MOQ note must be at least 2 characters")
  .max(120, "MOQ note must be 120 characters or fewer")
  .regex(
    /^[ঀ-৿a-zA-Z0-9\s\-–—+,./()]+$/,
    "MOQ note may only contain letters, digits, spaces and punctuation (-, –, +, ,, ., /, ())"
  );

// ─── Create ──────────────────────────────────────────────────────────────────
const createProductSchema = z
  .object({
    name:               z.string({ error: "Name is required" }).trim().min(2).max(200),
    sku:                z.string().trim().optional(),
    description:        z.string().trim().optional(),
    singleItemPrice:    z.coerce.number({ error: "Single item price is required" }).min(0),
    midWholesalePrice:  z.coerce.number().min(0).optional(),
    midWholesaleMinQty: z.coerce.number().int().min(2).optional(),
    wholesalePrice:     z.coerce.number().min(0).optional(),
    wholesaleMinQty:    z.coerce.number().int().min(2).optional(),
    minOrderQty:        z.coerce.number().int().min(1).optional().default(1),
    moqNote:            moqNoteSchema.optional(),
    discount:           z.coerce.number().min(0).optional(),
    discountType:       z.enum([DiscountType.PERCENTAGE, DiscountType.FLAT]).optional(),
    category:           objectIdSchema,
    brand:              z.string().trim().optional(),
    stock:              z.coerce.number({ error: "Stock is required" }).int().min(0),
    tags:               z.array(z.string()).optional().default([]),
    specifications:     z.array(specSchema).optional().default([]),
    variants:           z.array(variantSchema).optional().default([]),
    freeShipping:       z.coerce.boolean().optional().default(false),
    status:             z.enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.DRAFT]).optional().default(ProductStatus.DRAFT),
  })
  // discount consistency
  .refine((d) => !d.discountType || d.discount !== undefined, { message: "discount is required when discountType is set", path: ["discount"] })
  .refine((d) => d.discountType !== DiscountType.PERCENTAGE || (d.discount ?? 0) <= 100, { message: "Percentage discount cannot exceed 100", path: ["discount"] })
  // mid-wholesale pair
  .refine((d) => !(d.midWholesalePrice !== undefined) || d.midWholesaleMinQty !== undefined, { message: "midWholesaleMinQty required when midWholesalePrice is set", path: ["midWholesaleMinQty"] })
  .refine((d) => !(d.midWholesaleMinQty !== undefined) || d.midWholesalePrice !== undefined, { message: "midWholesalePrice required when midWholesaleMinQty is set", path: ["midWholesalePrice"] })
  // wholesale pair
  .refine((d) => !(d.wholesalePrice !== undefined) || d.wholesaleMinQty !== undefined, { message: "wholesaleMinQty required when wholesalePrice is set", path: ["wholesaleMinQty"] })
  .refine((d) => !(d.wholesaleMinQty !== undefined) || d.wholesalePrice !== undefined, { message: "wholesalePrice required when wholesaleMinQty is set", path: ["wholesalePrice"] })
  // minOrderQty must not exceed stock
  .refine(
    (d) => d.minOrderQty === undefined || d.minOrderQty <= d.stock,
    { message: "Minimum order quantity cannot exceed available stock", path: ["minOrderQty"] }
  )
  // price ordering: mid < retail
  .refine(
    (d) => d.midWholesalePrice === undefined || d.midWholesalePrice < d.singleItemPrice,
    { message: "Mid-wholesale price must be less than retail price", path: ["midWholesalePrice"] }
  )
  // price ordering: bulk < mid (or retail)
  .refine(
    (d) => {
      if (d.wholesalePrice === undefined) return true;
      const ref = d.midWholesalePrice ?? d.singleItemPrice;
      return d.wholesalePrice < ref;
    },
    { message: "Wholesale price must be less than mid-wholesale (or retail) price", path: ["wholesalePrice"] }
  )
  // qty ordering: bulk > mid
  .refine(
    (d) => d.midWholesaleMinQty === undefined || d.wholesaleMinQty === undefined || d.wholesaleMinQty > d.midWholesaleMinQty,
    { message: "wholesaleMinQty must be greater than midWholesaleMinQty", path: ["wholesaleMinQty"] }
  );

// ─── Update ──────────────────────────────────────────────────────────────────
const updateProductSchema = z
  .object({
    name:               z.string().trim().min(2).max(200).optional(),
    sku:                z.string().trim().optional(),
    description:        z.string().trim().optional(),
    singleItemPrice:    z.coerce.number().min(0).optional(),
    midWholesalePrice:  z.coerce.number().min(0).optional(),
    midWholesaleMinQty: z.coerce.number().int().min(2).optional(),
    wholesalePrice:     z.coerce.number().min(0).optional(),
    wholesaleMinQty:    z.coerce.number().int().min(2).optional(),
    minOrderQty:        z.coerce.number().int().min(1).optional(),
    moqNote:            moqNoteSchema.optional(),
    discount:           z.coerce.number().min(0).optional(),
    discountType:       z.enum([DiscountType.PERCENTAGE, DiscountType.FLAT]).optional(),
    category:           objectIdSchema.optional(),
    brand:              z.string().trim().optional(),
    stock:              z.coerce.number().int().min(0).optional(),
    tags:               z.array(z.string()).optional(),
    specifications:     z.array(specSchema).optional(),
    variants:           z.array(variantSchema).optional(),
    freeShipping:       z.coerce.boolean().optional(),
    deleteImages:       z.array(z.string()).optional(),
  })
  // price ordering on partial updates (only validate when both values are present)
  .refine(
    (d) => d.midWholesalePrice === undefined || d.singleItemPrice === undefined || d.midWholesalePrice < d.singleItemPrice,
    { message: "Mid-wholesale price must be less than retail price", path: ["midWholesalePrice"] }
  )
  .refine(
    (d) => {
      if (d.wholesalePrice === undefined || (d.midWholesalePrice === undefined && d.singleItemPrice === undefined)) return true;
      const ref = d.midWholesalePrice ?? d.singleItemPrice!;
      return d.wholesalePrice < ref;
    },
    { message: "Wholesale price must be less than mid-wholesale (or retail) price", path: ["wholesalePrice"] }
  )
  .refine(
    (d) => d.midWholesaleMinQty === undefined || d.wholesaleMinQty === undefined || d.wholesaleMinQty > d.midWholesaleMinQty,
    { message: "wholesaleMinQty must be greater than midWholesaleMinQty", path: ["wholesaleMinQty"] }
  );

// ─── Status ──────────────────────────────────────────────────────────────────
const updateProductStatusSchema = z.object({
  status: z.enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.DRAFT], { error: "Invalid status" }),
});

export const ProductValidation = { createProductSchema, updateProductSchema, updateProductStatusSchema };
