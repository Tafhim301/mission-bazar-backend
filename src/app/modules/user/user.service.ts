import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { User } from "./user.model";
import { IUserDocument, UserStatus } from "./user.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";

// === Types ===================================================================

interface IUpdateProfilePayload {
  name?: string;
  email?: string;
  profileImage?: string;
}

// === Get My Profile ==========================================================

const getMe = async (userId: string): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
};

// === Update My Profile =======================================================

const updateMe = async (
  userId: string,
  payload: IUpdateProfilePayload
): Promise<IUserDocument> => {
  if (payload.email) {
    const emailTaken = await User.findOne({
      email: payload.email,
      _id: { $ne: userId },
    });
    if (emailTaken) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "This email address is already in use by another account"
      );
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  return updatedUser;
};

// === Get All Users (Admin) ===================================================

const getAllUsers = async (query: Record<string, string>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const users = await userQuery.build();
  const meta = await userQuery.getMeta();

  return { users, meta };
};

// === Get User by ID (Admin) ==================================================

const getUserById = async (userId: string): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No user found with ID: ${userId}`
    );
  }
  return user;
};

// === Update User Status (Admin) ==============================================

const updateUserStatus = async (
  userId: string,
  status: UserStatus
): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { status } },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No user found with ID: ${userId}`
    );
  }
  return user;
};

// === Soft Delete (Admin) =====================================================

const softDeleteUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `No user found with ID: ${userId}`
    );
  }
  if (user.isDeleted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This user has already been deleted"
    );
  }
  await User.findByIdAndUpdate(userId, { $set: { isDeleted: true } });
};

// === Exports =================================================================

export const UserService = {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  updateUserStatus,
  softDeleteUser,
};
