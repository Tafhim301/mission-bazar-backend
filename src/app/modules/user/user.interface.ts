import { Document, Types } from "mongoose";

// === Enums ===================================================================

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  VENDOR = "VENDOR",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

// === Core User Shape (plain data, used in service layer) =====================

export interface IUser {
  name: string;
  phone: string;           // stored as string to preserve leading zeros / intl format
  email?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  approvalStatus: ApprovalStatus;
  profileImage?: string;
  isDeleted: boolean;
  passwordChangedAt?: Date;
  wallet?: Types.ObjectId;
  transactions?: Types.ObjectId[];
}

// === Mongoose Document (adds instance methods) ================================

export interface IUserDocument extends IUser, Document {
  /** Compare a plain-text password against the stored bcrypt hash. */
  isPasswordMatch(plainPassword: string): Promise<boolean>;

  /**
   * Returns true if the JWT was issued BEFORE the last password change.
   * A true result means the token must be rejected.
   */
  isJWTIssuedBeforePasswordChange(jwtIssuedAt: number): boolean;
}
