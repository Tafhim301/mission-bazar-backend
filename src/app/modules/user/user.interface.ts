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
  contactName: string;    // delivery recipient name
  contactPhone: string;   // delivery recipient phone (+880)
  street: string;         // Street, House/Apartment/Unit
  landmark?: string;      // nearby landmark or direction
  district: string;       // BD district
  zone: string;           // zone within district
  area: string;           // area within zone
  isDefault: boolean;
}

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface IUser {
  name: string;
  email: string;          // primary identifier — required, unique
  phone?: string;         // optional
  password: string;
  role: UserRole;
  status: UserStatus;
  approvalStatus: ApprovalStatus;
  profileImage?: string;
  googleId?: string;
  isVerified: boolean;    // true after OTP email verification
  address: IAddress[];
  cart: ICartItem[];
  purchasedProducts: Types.ObjectId[];
  reviews: Types.ObjectId[];
  isDeleted: boolean;
  passwordChangedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatch(plainPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChange(jwtIssuedAt: number): boolean;
}
