import { Document, Types } from "mongoose";

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface IPayment {
  order: Types.ObjectId;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentGatewayData?: any;
  invoiceUrl?: string;
}

export interface IPaymentDocument extends IPayment, Document {
  createdAt: Date;
  updatedAt: Date;
}
