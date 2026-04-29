import { model, Schema } from "mongoose";
import { IPaymentDocument, PaymentStatus } from "./payment.interface";

const paymentSchema = new Schema<IPaymentDocument>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
    paymentGatewayData: { type: Schema.Types.Mixed },
    invoiceUrl: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export const Payment = model<IPaymentDocument>("Payment", paymentSchema);
