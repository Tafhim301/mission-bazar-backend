import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { users, meta } = await UserService.getAllUsers(req.query as Record<string, string>);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Users retrieved", data: users, meta });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.user!.userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Profile retrieved", data: user });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "User retrieved", data: user });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.updateProfile(req.user!.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Profile updated", data: user });
});

const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new Error("No image uploaded");
  const user = await UserService.updateAvatar(req.user!.userId, (req.file as any).path);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Avatar updated", data: user });
});

const addAddress = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.addAddress(req.user!.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Address added", data: user });
});

const removeAddress = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.removeAddress(req.user!.userId, req.params.addressId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Address removed", data: user });
});

const updateCart = catchAsync(async (req: Request, res: Response) => {
  const { product, quantity } = req.body;
  const user = await UserService.updateCart(req.user!.userId, product, quantity);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Cart updated", data: user });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  await UserService.clearCart(req.user!.userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Cart cleared", data: null });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = await UserService.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "User status updated", data: user });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await UserService.deleteUser(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "User deleted", data: null });
});

export const UserController = {
  getAllUsers, getMe, getUserById,
  updateProfile, updateAvatar,
  addAddress, removeAddress,
  updateCart, clearCart,
  updateUserStatus, deleteUser,
};
