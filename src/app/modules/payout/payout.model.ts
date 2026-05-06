import { model, Schema } from "mongoose";
import { PayoutMethod, IPayoutDocument } from "./payout.interface";

const payoutSchema = new Schema<IPayoutDocument>(
  {
    vendor:          { type: Schema.Types.ObjectId, ref: "User",           required: true },
    withdrawRequest: { type: Schema.Types.ObjectId, ref: "WithdrawRequest", required: true, unique: true },
    amount:          { type: Number, required: true, min: 1 },
    method:          { type: String, enum: Object.values(PayoutMethod), required: true },
    reference:       { type: String, required: true, trim: true },
    note:            { type: String, trim: true },
    processedBy:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    earnings:        [{ type: Schema.Types.ObjectId, ref: "VendorEarning" }],
  },
  { timestamps: true, versionKey: false }
);

payoutSchema.index({ vendor: 1, createdAt: -1 });

export const Payout = model<IPayoutDocument>("Payout", payoutSchema);
