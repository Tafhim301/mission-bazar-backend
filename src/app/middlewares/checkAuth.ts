import { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errorHandlers/appError";
import { envVars } from "../config/env";
import { verifyToken } from "../utils/jwt";
import { User } from "../modules/user/user.model";
import { UserStatus } from "../modules/user/user.interface";

// === checkAuth ================================================================
// Usage: checkAuth("admin", "user")  — pass allowed roles (empty = any auth'd user)
// =============================================================================

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Extract token from cookie first, then Authorization header
      const token: string | undefined =
        req.cookies?.accessToken ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : req.headers.authorization);

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "No access token provided");
      }

      // 2. Verify token signature & expiry
      const decoded = verifyToken(
        token,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const { userId, role, iat } = decoded;

      // 3. Check user still exists
      const user = await User.findById(userId).select("+password +passwordChangedAt");
      if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User does not exist");
      }

      // 4. Check user is active
      if (user.status === UserStatus.BLOCKED) {
        throw new AppError(StatusCodes.FORBIDDEN, "Your account has been blocked");
      }
      if (user.status === UserStatus.INACTIVE) {
        throw new AppError(StatusCodes.FORBIDDEN, "Your account is inactive");
      }
      if (user.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, "Your account has been deleted");
      }

      // 5. Check token was not issued before last password change
      if (user.isJWTIssuedBeforePasswordChange(iat as number)) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          "Password was changed recently. Please log in again"
        );
      }

      // 6. Authorise by role (skip check if no roles specified)
      if (authRoles.length > 0 && !authRoles.includes(role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You do not have permission to access this route"
        );
      }

      // 7. Attach decoded payload to request
      req.user = decoded as JwtPayload & { userId: string; phone: string; role: string };
      next();
    } catch (error) {
      next(error);
    }
  };
