import { z } from "zod";
import { UserStatus } from "./user.interface";

// === Reusable field validators ===============================================

const phoneSchema = z
  .string({ error: "Phone number is required" })
  .trim()
  .min(7, "Phone number must be at least 7 digits")
  .max(15, "Phone number must not exceed 15 digits")
  .regex(
    /^\+?[0-9]+$/,
    "Phone number must contain only digits (optionally prefixed with +)"
  );

const passwordSchema = z
  .string({ error: "Password is required" })
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password must not exceed 64 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// === Update Profile ==========================================================
// Validates req.body directly (no wrapper)

const updateProfileSchema = z.object({
  name: z
    .string({ error: "Name must be a string" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters")
    .optional(),
  email: z
    .string({ error: "Email must be a string" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .optional(),
  profileImage: z
    .string({ error: "Profile image must be a string" })
    .url("Profile image must be a valid URL")
    .optional(),
});

// === Update User Status (admin) ==============================================

const updateUserStatusSchema = z.object({
  status: z.enum(
    [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED],
    { error: "Status must be one of ACTIVE, INACTIVE, or BLOCKED" }
  ),
});

// === Exports =================================================================

export const UserValidation = {
  updateProfileSchema,
  updateUserStatusSchema,
  // expose reusable pieces so auth validation can import them
  phoneSchema,
  passwordSchema,
};
