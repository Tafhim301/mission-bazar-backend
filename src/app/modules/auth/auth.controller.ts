import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthService } from "./auth.service";

// === Register ================================================================

const register = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.register(req.body);
  setAuthCookie(res, tokens);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Account created successfully",
    data: { user, accessToken: tokens.accessToken },
  });
});

// === Login ===================================================================

const login = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.login(req.body);
  setAuthCookie(res, tokens);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged in successfully",
    data: { user, accessToken: tokens.accessToken },
  });
});

// === Refresh Token ===========================================================

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies?.refreshToken;

  if (!token) {
    return sendResponse(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      success: false,
      message: "Refresh token is missing. Please login again",
      data: null,
    });
  }

  const { accessToken } = await AuthService.refreshToken(token);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Access token refreshed successfully",
    data: { accessToken },
  });
});

// === Logout ==================================================================

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

// === Change Password =========================================================

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePassword(req.user!.userId, req.body);
  // Clear cookies to force re-login with new password
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Password changed successfully. Please login again",
    data: null,
  });
});

// === Exports =================================================================

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
};
