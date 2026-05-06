import { model, Schema } from "mongoose";
import { EarningStatus, IVendorEarningDocument } from "./vendor-earning.interface";

const earningItemSchema = new Schema(
  {
    product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:     { type: String, required: true },
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const vendorEarningSchema = new Schema<IVendorEarningDocument>(
  {
    vendor:          { type: Schema.Types.ObjectId, ref: "User",   required: true },
    order:           { type: Schema.Types.ObjectId, ref: "Order",  required: true },
    items:           { type: [earningItemSchema], default: [] },
    grossAmount:     { type: Number, required: true, min: 0 },
    platformFeeRate: { type: Number, required: true, default: 0.10 },
    platformFee:     { type: Number, required: true, min: 0 },
    netPayable:      { type: Number, required: true, min: 0 },
    status:          { type: String, enum: Object.values(EarningStatus), default: EarningStatus.PENDING },
    availableAt:     { type: Date, required: true },
    paidAt:          { type: Date },
    payout:          { type: Schema.Types.ObjectId, ref: "Payout" },
  },
  { timestamps: true, versionKey: false }
);

// One earning per vendor per order
vendorEarningSchema.index({ order: 1, vendor: 1 }, { unique: true });
vendorEarningSchema.index({ vendor: 1, status: 1 });
vendorEarningSchema.index({ availableAt: 1, status: 1 });

export const VendorEarning = model<IVendorEarningDocument>("VendorEarning", vendorEarningSchema);
