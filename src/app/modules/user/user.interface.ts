import { Types } from "mongoose";

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export enum isActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSOENDED = "SUSPENDED",
}

export interface IUser {
  name: string;
  phone: number;
  password : string;
  Role?: Role;
  isActive ?: isActive;
  isDeleted?: boolean;
  ApprovalStatus : ApprovalStatus
  Wallet : Types.ObjectId
  Transaction : Types.ObjectId
}
