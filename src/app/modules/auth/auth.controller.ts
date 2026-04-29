import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: result.message, data: null });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.verifyEmail(req.body);
  setAuthCookie(res, tokens);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Email verified. Welcome to Mission Bazar!", data: { user, accessToken: tokens.accessToken } });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await AuthService.login(req.body);
  setAuthCookie(res, tokens);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Logged in successfully", data: { user, accessToken: tokens.accessToken } });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token: string | undefined = req.cookies?.refreshToken;
  if (!token) return sendResponse(res, { statusCode: StatusCodes.UNAUTHORIZED, success: false, message: "Refresh token missing", data: null });
  const { accessToken } = await AuthService.refreshToken(token);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Token refreshed", data: { accessToken } });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Logged out successfully", data: null });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: result.message, data: null });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: result.message, data: null });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePassword(req.user!.userId, req.body);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Password changed. Please log in again.", data: null });
});

export const AuthController = {
  register, verifyEmail, login, refreshToken, logout,
  forgotPassword, resetPassword, changePassword,
};
