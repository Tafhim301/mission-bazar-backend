import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { UserStatus } from "./user.interface";

// === GET /user/me ============================================================

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const user = await UserService.getMe(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: user,
  });
});

// === PATCH /user/me ==========================================================

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const user = await UserService.updateMe(userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// === GET /user  (Admin) ======================================================

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { users, meta } = await UserService.getAllUsers(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: users,
    meta,
  });
});

// === GET /user/:id  (Admin) ==================================================

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

// === PATCH /user/:id/status  (Admin) =========================================

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body as { status: UserStatus };
  const user = await UserService.updateUserStatus(req.params.id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `User status updated to ${status} successfully`,
    data: user,
  });
});

// === DELETE /user/:id  (Admin - soft delete) =================================

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await UserService.softDeleteUser(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

// === Exports =================================================================

export const UserController = {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
