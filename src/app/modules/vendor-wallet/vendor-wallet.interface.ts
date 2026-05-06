import { Document, Types } from "mongoose";

export interface IVendorWallet {
  vendor:           Types.ObjectId; // unique — one wallet per vendor
  pendingBalance:   number;         // netPayable locked in holding period
  availableBalance: number;         // ready to withdraw
  totalEarned:      number;         // lifetime netPayable earned (ever)
  totalPaid:        number;         // lifetime amount paid out to vendor
}

export interface IVendorWalletDocument extends IVendorWallet, Document {
  createdAt: Date;
  updatedAt: Date;
}
