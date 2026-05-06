import { Document, Types } from "mongoose";

export enum EarningStatus {
  PENDING   = "PENDING",   // order delivered — in holding period
  AVAILABLE = "AVAILABLE", // holding period over — vendor can withdraw
  PAID      = "PAID",      // admin has settled this earning
}

export interface IEarningItem {
  product:  Types.ObjectId;
  name:     string;
  price:    number;
  quantity: number;
}

export interface IVendorEarning {
  vendor:          Types.ObjectId;
  order:           Types.ObjectId;
  items:           IEarningItem[];
  grossAmount:     number;      // sum of (price × qty) for this vendor's items
  platformFeeRate: number;      // e.g. 0.10  →  10 %
  platformFee:     number;      // grossAmount × platformFeeRate
  netPayable:      number;      // grossAmount − platformFee
  status:          EarningStatus;
  availableAt:     Date;        // when it may be released to AVAILABLE
  paidAt?:         Date;
  payout?:         Types.ObjectId; // ref: Payout
}

export interface IVendorEarningDocument extends IVendorEarning, Document {
  createdAt: Date;
  updatedAt: Date;
}
