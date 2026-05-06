import { Document, Types } from "mongoose";

export enum WithdrawStatus {
  PENDING  = "PENDING",   // awaiting admin review
  APPROVED = "APPROVED",  // admin approved — ready for payout
  REJECTED = "REJECTED",  // admin rejected
  PAID     = "PAID",      // payout recorded
}

export enum WithdrawMethod {
  BKASH         = "BKASH",
  NAGAD         = "NAGAD",
  ROCKET        = "ROCKET",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export interface IWithdrawRequest {
  vendor:         Types.ObjectId;
  amount:         number;
  method:         WithdrawMethod;
  accountDetails: string;           // e.g. "01XXXXXXXXX" or bank account info
  status:         WithdrawStatus;
  adminNote?:     string;           // reason for rejection / optional note
  processedBy?:   Types.ObjectId;   // admin who acted on it
  processedAt?:   Date;
}

export interface IWithdrawRequestDocument extends IWithdrawRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}
