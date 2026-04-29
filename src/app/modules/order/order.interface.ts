import { Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;         // snapshot at order time
  image: string;        // snapshot
  price: number;        // effective price (discountPrice if set, else price)
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
  itemsTotal: number;       // sum of item.price * item.quantity
  shippingCharge: number;   // flat fee
  totalAmount: number;      // itemsTotal + shippingCharge
  status: OrderStatus;
  payment?: Types.ObjectId; // ref: Payment — set after payment record created
  note?: string;
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}
