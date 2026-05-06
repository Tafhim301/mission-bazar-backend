import { Document, Types } from "mongoose";

export enum PayoutMethod {
  BKASH         = "BKASH",
  NAGAD         = "NAGAD",
  ROCKET        = "ROCKET",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export interface IPayout {
  vendor:          Types.ObjectId;
  withdrawRequest: Types.ObjectId;
  amount:          number;
  method:          PayoutMethod;
  reference:       string;           // bKash/bank transaction reference
  note?:           string;
  processedBy:     Types.ObjectId;   // admin who recorded this
  earnings:        Types.ObjectId[]; // VendorEarning _ids settled
}

export interface IPayoutDocument extends IPayout, Document {
  createdAt: Date;
  updatedAt: Date;
}
