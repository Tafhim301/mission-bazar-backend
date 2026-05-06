import { model, Schema } from "mongoose";
import { IVendorWalletDocument } from "./vendor-wallet.interface";

const vendorWalletSchema = new Schema<IVendorWalletDocument>(
  {
    vendor:           { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    pendingBalance:   { type: Number, default: 0, min: 0 },
    availableBalance: { type: Number, default: 0, min: 0 },
    totalEarned:      { type: Number, default: 0, min: 0 },
    totalPaid:        { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

export const VendorWallet = model<IVendorWalletDocument>("VendorWallet", vendorWalletSchema);
