import { model, Schema } from "mongoose";
import {
  IOrderDocument, IOrderItem, IShippingAddress,
  OrderStatus, PaymentMethod, OrderPaymentStatus,
} from "./order.interface";

const orderItemSchema = new Schema<IOrderItem>(
  {
    product:      { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name:         { type: String, required: true },
    image:        { type: String, default: "" },
    price:        { type: Number, required: true, min: 0 },
    quantity:     { type: Number, required: true, min: 1 },
    // Buyer's optional text note about quantity, e.g. "Need 100-200 pieces, confirm exact qty"
    quantityNote: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName:   { type: String, required: true, trim: true },
    phone:      { type: String, required: true, trim: true },
    address:    { type: String, required: true, trim: true },
    city:       { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    user:            { type: Schema.Types.ObjectId, ref: "User", required: true },
    items:           { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    itemsTotal:      { type: Number, required: true, min: 0 },
    shippingCharge:  { type: Number, required: true, min: 0, default: 60 },
    totalAmount:     { type: Number, required: true, min: 0 },
    status:          { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    paymentMethod:   { type: String, enum: Object.values(PaymentMethod), required: true },
    paymentStatus:   { type: String, enum: Object.values(OrderPaymentStatus), default: OrderPaymentStatus.PENDING },
    paymentDetails:  { type: Schema.Types.Mixed },
    transactionId:   { type: String },
    invoiceId:       { type: String },
    invoiceUrl:      { type: String },
    payment:         { type: Schema.Types.ObjectId, ref: "Payment" },
    note:            { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export const Order = model<IOrderDocument>("Order", orderSchema);
