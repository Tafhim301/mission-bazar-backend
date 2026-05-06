import { z } from "zod";
import { VendorPaymentMethod, VendorType } from "./vendor.interface";

export const applyAsVendorSchema = z.object({
  type:            z.enum([VendorType.INDIVIDUAL, VendorType.BUSINESS]),
  shopName:        z.string().trim().min(2).max(100),
  shopDescription: z.string().trim().max(500).optional(),
  address:         z.string().trim().min(5),
  paymentMethod:   z.enum([
    VendorPaymentMethod.BKASH,
    VendorPaymentMethod.NAGAD,
    VendorPaymentMethod.ROCKET,
    VendorPaymentMethod.BANK_TRANSFER,
  ]),
  accountNumber: z.string().trim().min(5),
});

export const updateVendorProfileSchema = applyAsVendorSchema.partial();

export const rejectVendorSchema = z.object({
  rejectionNote: z.string().trim().min(5),
});

export const VendorValidation = {
  applyAsVendorSchema,
  updateVendorProfileSchema,
  rejectVendorSchema,
};
