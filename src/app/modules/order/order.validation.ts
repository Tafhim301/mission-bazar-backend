import { z } from "zod";
import { OrderStatus, PaymentMethod } from "./order.interface";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

/**
 * Validates an optional quantity note from the buyer.
 * Allows: letters (Latin + Bangla), digits, spaces, and common punctuation
 * used in quantity descriptions like "100–200 pieces" or "need ~500 units".
 * Max 200 characters.
 */
const quantityNoteSchema = z
  .string()
  .trim()
  .min(2, "Quantity note must be at least 2 characters")
  .max(200, "Quantity note must be 200 characters or fewer")
  .regex(
    /^[ঀ-৿a-zA-Z0-9\s\-–—+~,./()%]+$/,
    "Quantity note may only contain letters, digits, spaces and punctuation (-, –, ~, +, ,, ., /, %, ())"
  );

const orderItemSchema = z.object({
  product:      objectIdSchema,
  quantity:     z.coerce.number({ error: "Quantity is required" }).int().min(1, "Quantity must be at least 1"),
  quantityNote: quantityNoteSchema.optional(),
});

const shippingAddressSchema = z.object({
  fullName:   z.string({ error: "Full name is required" }).trim().min(2),
  phone:      z.string({ error: "Phone is required" }).trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone"),
  address:    z.string({ error: "Address is required" }).trim().min(5),
  city:       z.string({ error: "City is required" }).trim().min(2),
  postalCode: z.string({ error: "Postal code is required" }).trim().min(4),
});

const createOrderSchema = z.object({
  items:           z.array(orderItemSchema).min(1, "Order must have at least one item"),
  shippingAddress: shippingAddressSchema,
  paymentMethod:   z.enum([PaymentMethod.SSLCOMMERZ, PaymentMethod.COD], {
    error: "paymentMethod must be SSLCOMMERZ or COD",
  }),
  note: z.string().trim().max(500, "Order note must be 500 characters or fewer").optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(
    [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED,
     OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED],
    { error: "Invalid order status" }
  ),
});

export const OrderValidation = { createOrderSchema, updateOrderStatusSchema };
