import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { User } from "../user/user.model";
import { IUserDocument } from "../user/user.interface";
import { createUserTokens, createNewAccessTokenFromRefresh } from "../../utils/userTokens";
import { sendEmail } from "../../utils/sendEmail";
import { Otp, OtpType } from "../otp/otp.model";
import {
  IAuthTokens, IChangePasswordPayload, IForgotPasswordPayload,
  ILoginPayload, IRegisterPayload, IResetPasswordPayload, IVerifyEmailPayload,
} from "./auth.interface";

// === Register (step 1) — create unverified account + send OTP ================

const register = async (payload: IRegisterPayload): Promise<{ message: string }> => {
  const existing = await User.findOne({ email: payload.email });
  if (existing && existing.isVerified) {
    throw new AppError(StatusCodes.CONFLICT, "An account with this email already exists");
  }
  if (existing && !existing.isVerified) {
    // Re-send OTP for unverified accounts
    const otp = await Otp.createOtp(payload.email, OtpType.VERIFY_EMAIL);
    await sendEmail({
      to: payload.email,
      subject: "Verify your Mission Bazar account",
      templateName: "verifyEmail",
      templateData: { customerName: payload.name, otp },
    });
    return { message: "OTP resent. Please check your email to verify your account." };
  }

  if (payload.phone) {
    const phoneExists = await User.findOne({ phone: payload.phone });
    if (phoneExists) throw new AppError(StatusCodes.CONFLICT, "This phone number is already in use");
  }

  await User.create({
    name:       payload.name,
    email:      payload.email,
    phone:      payload.phone,
    password:   payload.password,
    isVerified: false,
  });

  const otp = await Otp.createOtp(payload.email, OtpType.VERIFY_EMAIL);
  await sendEmail({
    to: payload.email,
    subject: "Verify your Mission Bazar account",
    templateName: "verifyEmail",
    templateData: { customerName: payload.name, otp },
  });

  return { message: "Account created. Please check your email for the verification OTP." };
};

// === Verify Email (step 2) — confirm OTP + activate ==========================

const verifyEmail = async (
  payload: IVerifyEmailPayload
): Promise<{ user: IUserDocument; tokens: IAuthTokens }> => {
  const valid = await Otp.verifyOtp(payload.email, payload.otp, OtpType.VERIFY_EMAIL);
  if (!valid) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");

  const user = await User.findOneAndUpdate(
    { email: payload.email },
    { isVerified: true },
    { new: true }
  );
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const tokens = createUserTokens(user);
  return { user, tokens };
};

// === Login ===================================================================

const login = async (
  payload: ILoginPayload
): Promise<{ user: IUserDocument; tokens: IAuthTokens }> => {
  const user = await User.findOne({ email: payload.email }).select("+password");
  if (!user || user.isDeleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }
  if (!user.isVerified) {
    throw new AppError(StatusCodes.FORBIDDEN, "Please verify your email before logging in");
  }
  if (user.status === "BLOCKED") {
    throw new AppError(StatusCodes.FORBIDDEN, "Your account has been blocked");
  }
  if (!(await user.isPasswordMatch(payload.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const tokens = createUserTokens(user);
  return { user, tokens };
};

// === Refresh Token ===========================================================

const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  const { accessToken } = await createNewAccessTokenFromRefresh(token);
  return { accessToken };
};

// === Forgot Password (step 1) — send OTP =====================================

const forgotPassword = async (payload: IForgotPasswordPayload): Promise<{ message: string }> => {
  const user = await User.findOne({ email: payload.email });
  // Always return success to prevent email enumeration
  if (!user || user.isDeleted || !user.isVerified) {
    return { message: "If this email is registered, you will receive a password reset OTP." };
  }

  const otp = await Otp.createOtp(payload.email, OtpType.FORGOT_PASSWORD);
  await sendEmail({
    to: payload.email,
    subject: "Reset your Mission Bazar password",
    templateName: "forgotPassword",
    templateData: { customerName: user.name, otp },
  });

  return { message: "If this email is registered, you will receive a password reset OTP." };
};

// === Reset Password (step 2) — verify OTP + set new password =================

const resetPassword = async (payload: IResetPasswordPayload): Promise<{ message: string }> => {
  const valid = await Otp.verifyOtp(payload.email, payload.otp, OtpType.FORGOT_PASSWORD);
  if (!valid) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");

  const user = await User.findOne({ email: payload.email }).select("+password");
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  await user.save(); // pre-save hook hashes the password

  return { message: "Password reset successfully. You can now log in with your new password." };
};

// === Change Password =========================================================

const changePassword = async (userId: string, payload: IChangePasswordPayload): Promise<void> => {
  const user = await User.findById(userId).select("+password +passwordChangedAt");
  if (!user || user.isDeleted) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  if (!(await user.isPasswordMatch(payload.currentPassword))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Current password is incorrect");
  }
  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
};

export const AuthService = {
  register, verifyEmail, login, refreshToken,
  forgotPassword, resetPassword, changePassword,
};
