import { z } from "zod";
import { OrderStatus } from "./order.interface";

const objectIdSchema = z
  .string({ error: "Must be a valid ID" })
  .regex(/^[a-f\d]{24}$/i, "Must be a valid 24-character MongoDB ObjectId");

const orderItemSchema = z.object({
  product: objectIdSchema,
  quantity: z.number({ error: "Quantity is required" }).int().min(1, "Quantity must be at least 1"),
});

const shippingAddressSchema = z.object({
  fullName: z.string({ error: "Full name is required" }).trim().min(2),
  phone: z.string({ error: "Phone is required" }).trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  address: z.string({ error: "Address is required" }).trim().min(5),
  city: z.string({ error: "City is required" }).trim().min(2),
  postalCode: z.string({ error: "Postal code is required" }).trim().min(4),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema, { error: "Items must be an array" }).min(1, "Order must have at least one item"),
  shippingAddress: shippingAddressSchema,
  note: z.string().trim().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(
    [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED,
     OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED],
    { error: "Invalid order status" }
  ),
});

export const OrderValidation = { createOrderSchema, updateOrderStatusSchema };
