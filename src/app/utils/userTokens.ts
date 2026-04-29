import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env";
import { IUser, UserStatus } from "../modules/user/user.interface";
import AppError from "../errorHandlers/appError";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";

// Build token pair from a user object
export const createUserTokens = (user: Partial<IUser> & { _id?: unknown }) => {
  const jwtPayload = {
    userId: user._id,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return { accessToken, refreshToken };
};

// Use a refresh token to mint a new access token
export const createNewAccessTokenFromRefresh = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  const decoded = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload & { userId: string };

  const user = await User.findById(decoded.userId);

  if (!user || user.isDeleted) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "User does not exist.");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `Your account has been blocked. Contact support.`
    );
  }

  const accessToken = generateToken(
    { userId: user._id, phone: user.phone, role: user.role },
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return { accessToken };
};
