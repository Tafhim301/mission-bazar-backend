import { z } from "zod";
import { UserValidation } from "../user/user.validation";

const { phoneSchema, passwordSchema } = UserValidation;

// === Register ================================================================

const registerSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must not exceed 60 characters"),
    phone: phoneSchema,
    email: z
      .string({ error: "Email must be a string" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address")
      .optional(),
    password: passwordSchema,
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// === Login ===================================================================

const loginSchema = z.object({
  phone: phoneSchema,
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

// === Change Password =========================================================

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string({ error: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

// === Exports =================================================================

export const AuthValidation = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
