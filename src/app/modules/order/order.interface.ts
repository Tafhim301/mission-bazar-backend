import { Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING    = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED    = "SHIPPED",
  DELIVERED  = "DELIVERED",
  CANCELLED  = "CANCELLED",
  FAILED     = "FAILED",
}

export enum PaymentMethod {
  SSLCOMMERZ = "SSLCOMMERZ",
  COD        = "COD",
}

export enum OrderPaymentStatus {
  PENDING  = "PENDING",
  PAID     = "PAID",
  FAILED   = "FAILED",
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  itemsTotal: number;
  shippingCharge: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderPaymentStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentDetails?: any;       // raw SSLCommerz IPN payload
  transactionId?: string;     // from SSLCommerz or generated for COD ref
  invoiceId?: string;
  invoiceUrl?: string;
  payment?: Types.ObjectId;   // ref: Payment (SSLCommerz only)
  note?: string;
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}
