import { Document, Types } from "mongoose";

export enum VendorType {
  INDIVIDUAL = "INDIVIDUAL", // requires NID_FRONT + NID_BACK
  BUSINESS   = "BUSINESS",   // requires TRADE_LICENSE
}

export enum VendorStatus {
  DRAFT    = "DRAFT",    // profile created, not yet submitted
  REVIEW   = "REVIEW",   // submitted — awaiting admin verification
  ACTIVE   = "ACTIVE",   // all required docs approved — fully active
  REJECTED = "REJECTED", // admin rejected the application
}

export enum VendorPaymentMethod {
  BKASH         = "BKASH",
  NAGAD         = "NAGAD",
  ROCKET        = "ROCKET",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export interface IVendor {
  user:            Types.ObjectId;       // ref: User (1-to-1, unique)
  type:            VendorType;
  shopName:        string;
  shopDescription?: string;
  address:         string;
  paymentMethod:   VendorPaymentMethod;
  accountNumber:   string;               // bKash number / bank account
  status:          VendorStatus;
  rejectionNote?:  string;               // why the application was rejected
  reviewedBy?:     Types.ObjectId;       // admin who took final action
  reviewedAt?:     Date;
}

export interface IVendorDocument extends IVendor, Document {
  createdAt: Date;
  updatedAt: Date;
}
