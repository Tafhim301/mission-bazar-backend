import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { User } from "./user.model";
import { IUserDocument } from "./user.interface";
import { deleteFromCloudinary } from "../../config/cloudinary";
import { QueryBuilder } from "../../utils/queryBuilder";

// === Get All Users (Admin) ====================================================

const getAllUsers = async (query: Record<string, string>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(["name", "email", "phone"])
    .filter()
    .sort()
    .paginate();

  const users = await userQuery.build();
  const meta  = await userQuery.getMeta();
  return { users, meta };
};

// === Get Single User ==========================================================

const getUserById = async (id: string): Promise<IUserDocument> => {
  const user = await User.findById(id);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

// === Update Profile ===========================================================

const updateProfile = async (
  userId: string,
  payload: Partial<Pick<IUserDocument, "name" | "email" | "profileImage">>
): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

// === Update Avatar ============================================================

const updateAvatar = async (userId: string, imageUrl: string): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  // Delete old avatar from Cloudinary if it exists
  if (user.profileImage) {
    await deleteFromCloudinary(user.profileImage).catch(console.error);
  }

  user.profileImage = imageUrl;
  await user.save();
  return user;
};

// === Address Management =======================================================

const addAddress = async (userId: string, addressPayload: object): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  // If marking as default, unset all others
  if ((addressPayload as any).isDefault) {
    user.address.forEach((a) => { a.isDefault = false; });
  }

  user.address.push(addressPayload as any);
  await user.save();
  return user;
};

const removeAddress = async (userId: string, addressId: string): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { address: { _id: addressId } } },
    { new: true }
  );
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

// === Cart Management ==========================================================

const updateCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const existingItem = user.cart.find((c) => String(c.product) === productId);

  if (quantity === 0) {
    // Remove from cart
    user.cart = user.cart.filter((c) => String(c.product) !== productId);
  } else if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    user.cart.push({ product: productId as any, quantity });
  }

  await user.save();
  return user;
};

const clearCart = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
};

// === Admin: update user status ================================================

const updateUserStatus = async (
  userId: string,
  status: string
): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  return user;
};

// === Admin: soft-delete =======================================================

const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findByIdAndUpdate(userId, { isDeleted: true });
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  addAddress,
  removeAddress,
  updateCart,
  clearCart,
  updateUserStatus,
  deleteUser,
};
