import { model, Schema } from "mongoose";
import { WithdrawMethod, WithdrawStatus, IWithdrawRequestDocument } from "./withdraw-request.interface";

const withdrawRequestSchema = new Schema<IWithdrawRequestDocument>(
  {
    vendor:         { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount:         { type: Number, required: true, min: 1 },
    method:         { type: String, enum: Object.values(WithdrawMethod), required: true },
    accountDetails: { type: String, required: true, trim: true },
    status:         { type: String, enum: Object.values(WithdrawStatus), default: WithdrawStatus.PENDING },
    adminNote:      { type: String, trim: true },
    processedBy:    { type: Schema.Types.ObjectId, ref: "User" },
    processedAt:    { type: Date },
  },
  { timestamps: true, versionKey: false }
);

withdrawRequestSchema.index({ vendor: 1, status: 1 });
withdrawRequestSchema.index({ status: 1, createdAt: -1 });

export const WithdrawRequest = model<IWithdrawRequestDocument>("WithdrawRequest", withdrawRequestSchema);
