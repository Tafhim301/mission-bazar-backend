import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { User } from "../user/user.model";
import { IUserDocument } from "../user/user.interface";
import { createUserTokens, createNewAccessTokenFromRefresh } from "../../utils/userTokens";
import {
  IAuthTokens,
  IChangePasswordPayload,
  ILoginPayload,
  IRegisterPayload,
} from "./auth.interface";

// === Register ================================================================

const register = async (
  payload: IRegisterPayload
): Promise<{ user: IUserDocument; tokens: IAuthTokens }> => {
  const existingPhone = await User.findOne({ phone: payload.phone });
  if (existingPhone) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "An account with this phone number already exists"
    );
  }

  if (payload.email) {
    const existingEmail = await User.findOne({ email: payload.email });
    if (existingEmail) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "An account with this email address already exists"
      );
    }
  }

  // Password hashing handled by pre-save hook
  const user = await User.create({
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
  });

  const tokens = createUserTokens(user);
  return { user, tokens };
};

// === Login ===================================================================

const login = async (
  payload: ILoginPayload
): Promise<{ user: IUserDocument; tokens: IAuthTokens }> => {
  const user = await User.findOne({ phone: payload.phone }).select("+password");

  if (!user || user.isDeleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid phone number or password");
  }

  if (!(await user.isPasswordMatch(payload.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid phone number or password");
  }

  const tokens = createUserTokens(user);
  return { user, tokens };
};

// === Refresh Token ===========================================================

const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  const { accessToken } = await createNewAccessTokenFromRefresh(token);
  return { accessToken };
};

// === Change Password =========================================================

const changePassword = async (
  userId: string,
  payload: IChangePasswordPayload
): Promise<void> => {
  const user = await User.findById(userId).select("+password +passwordChangedAt");

  if (!user || user.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!(await user.isPasswordMatch(payload.currentPassword))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Your current password is incorrect");
  }

  // pre-save hook re-hashes the new password
  user.password = payload.newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
};

// === Exports =================================================================

export const AuthService = {
  register,
  login,
  refreshToken,
  changePassword,
};
