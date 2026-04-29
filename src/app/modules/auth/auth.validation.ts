import { z } from "zod";
import { UserValidation } from "../user/user.validation";

const { phoneSchema, passwordSchema } = UserValidation;

const registerSchema = z
  .object({
    name:            z.string({ error: "Name is required" }).trim().min(2).max(60),
    email:           z.string({ error: "Email is required" }).trim().toLowerCase().email("Invalid email"),
    phone:           phoneSchema.optional(),
    password:        passwordSchema,
    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match", path: ["confirmPassword"],
  });

const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  otp:   z.string({ error: "OTP is required" }).length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

const loginSchema = z.object({
  email:    z.string({ error: "Email is required" }).trim().toLowerCase().email("Invalid email"),
  password: z.string({ error: "Password is required" }).min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string({ error: "Email is required" }).trim().toLowerCase().email("Invalid email"),
});

const resetPasswordSchema = z
  .object({
    email:           z.string().trim().toLowerCase().email(),
    otp:             z.string().length(6).regex(/^\d+$/),
    newPassword:     passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match", path: ["confirmPassword"],
  });

const changePasswordSchema = z
  .object({
    currentPassword:  z.string({ error: "Current password is required" }).min(1),
    newPassword:      passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match", path: ["confirmNewPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current", path: ["newPassword"],
  });

export const AuthValidation = {
  registerSchema, verifyEmailSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema, changePasswordSchema,
};
