import { model, Schema } from "mongoose";
import { IVendorDocument, VendorPaymentMethod, VendorStatus, VendorType } from "./vendor.interface";

const vendorSchema = new Schema<IVendorDocument>(
  {
    user: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,  // one vendor profile per user account
    },
    type:            { type: String, enum: Object.values(VendorType),          required: true },
    shopName:        { type: String, required: true, trim: true, maxlength: 100 },
    shopDescription: { type: String, trim: true, maxlength: 1000 },
    shopBanner:      { type: String, trim: true },
    shopImage:       { type: String, trim: true },
    address:         { type: String, required: true, trim: true },
    paymentMethod:   { type: String, enum: Object.values(VendorPaymentMethod), required: true },
    accountNumber:   { type: String, required: true, trim: true },
    status:          { type: String, enum: Object.values(VendorStatus), default: VendorStatus.DRAFT },
    rejectionNote:   { type: String, trim: true },
    reviewedBy:      { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt:      { type: Date },
  },
  { timestamps: true, versionKey: false }
);

vendorSchema.index({ status: 1 });

export const Vendor = model<IVendorDocument>("Vendor", vendorSchema);
