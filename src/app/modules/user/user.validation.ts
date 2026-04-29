import { z } from "zod";
import { AddressLabel, UserStatus } from "./user.interface";

const phoneSchema = z.string({ error: "Phone number is required" })
  .trim().min(7).max(15).regex(/^\+?[0-9]+$/, "Phone must contain only digits");

const passwordSchema = z.string({ error: "Password is required" })
  .min(6).max(64)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and a number");

const addAddressSchema = z.object({
  label:        z.enum([AddressLabel.HOME, AddressLabel.OFFICE, AddressLabel.OTHERS]).optional(),
  contactName:  z.string({ error: "Contact name is required" }).trim().min(2).max(100),
  contactPhone: z.string({ error: "Contact phone is required" }).trim().regex(/^\+?8801[3-9]\d{8}$|^\+?[0-9]{7,15}$/, "Invalid phone number"),
  street:       z.string({ error: "Street address is required" }).trim().min(3),
  landmark:     z.string().trim().optional(),
  district:     z.string({ error: "District is required" }).trim().min(2),
  zone:         z.string({ error: "Zone is required" }).trim().min(2),
  area:         z.string({ error: "Area is required" }).trim().min(2),
  isDefault:    z.boolean().optional().default(false),
});

const updateProfileSchema = z.object({
  name:  z.string().trim().min(2).max(60).optional(),
  phone: phoneSchema.optional(),
  profileImage: z.string().url().optional(),
});

const updateUserStatusSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED], {
    error: "Status must be ACTIVE, INACTIVE, or BLOCKED",
  }),
});

const updateCartSchema = z.object({
  product:  z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
  quantity: z.coerce.number().int().min(0),
});

export const UserValidation = {
  updateProfileSchema, addAddressSchema, updateCartSchema,
  updateUserStatusSchema, phoneSchema, passwordSchema,
};
