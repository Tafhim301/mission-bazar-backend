import { Document, Types } from "mongoose";

export enum UserRole {
  USER  = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export enum UserStatus {
  ACTIVE   = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED  = "BLOCKED",
}

export enum ApprovalStatus {
  PENDING   = "PENDING",
  APPROVED  = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

export enum AddressLabel {
  HOME   = "HOME",
  OFFICE = "OFFICE",
  OTHERS = "OTHERS",
}

export interface IAddress {
  label: AddressLabel;
  contactName: string;
  contactPhone: string;
  street: string;
  landmark?: string;
  district: string;
  zone: string;
  area: string;
  isDefault: boolean;
}

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  approvalStatus: ApprovalStatus;
  profileImage?: string;
  googleId?: string;
  isVerified: boolean;
  address: IAddress[];
  cart: ICartItem[];
  purchasedProducts: Types.ObjectId[];
  reviews: Types.ObjectId[];
  vendorAvgRating?: number;
  vendorTotalReviews?: number;
  isDeleted: boolean;
  passwordChangedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatch(plainPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChange(jwtIssuedAt: number): boolean;
}
