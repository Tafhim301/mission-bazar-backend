/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Payment } from "./payment.model";
import { IPaymentDocument, PaymentStatus } from "./payment.interface";
import { Order } from "../order/order.model";
import { OrderStatus } from "../order/order.interface";
import { User } from "../user/user.model";
import { SSLService } from "../sslcommerz/sslcommerz.service";
import { ISSLCommerzPayload } from "../sslcommerz/sslcommerz.interface";
import { generateInvoicePdf } from "../../utils/invoice";
import { uploadBufferToCloudinary } from "../../config/cloudinary";
import { sendEmail } from "../../utils/sendEmail";
import { getTransactionId } from "../../utils/getTransactionId";
import { envVars } from "../../config/env";

// === Retry / Init Payment (when payment exists but was not completed) =========

const initPayment = async (orderId: string, userId: string): Promise<{ paymentUrl: string }> => {
  const payment = await Payment.findOne({ order: orderId });
  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, "No payment record found for this order");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
  if (String(order.user) !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, "This order does not belong to you");
  }
  if (payment.status === PaymentStatus.PAID) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This order has already been paid");
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  // Issue a fresh transaction ID for retries to avoid SSLCommerz duplicate rejection
  const newTransactionId = getTransactionId();
  await Payment.findByIdAndUpdate(payment._id, { transactionId: newTransactionId });

  const sslPayload: ISSLCommerzPayload = {
    amount: payment.amount,
    transactionId: newTransactionId,
    name: user.name,
    email: user.email ?? `${user.phone}@missionbazar.com`,
    phoneNumber: user.phone,
    address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
  };

  const result = await SSLService.initPayment(sslPayload);
  if (!result.GatewayPageURL) {
    throw new AppError(StatusCodes.BAD_GATEWAY, "Could not generate payment URL");
  }

  return { paymentUrl: result.GatewayPageURL };
};

// === Success callback (SSLCommerz redirects here) ============================

const successPayment = async (query: Record<string, string>): Promise<{ success: true; message: string }> => {
  // ---- Phase 1: DB transaction -- mark PAID + order PROCESSING ----------------
  // Cloudinary / PDF work is intentionally OUTSIDE this transaction.
  // If Cloudinary were inside and threw, abortTransaction() would revert the
  // PAID status even though SSLCommerz already charged the customer.
  const session = await mongoose.startSession();
  session.startTransaction();

  let paymentId: string;
  let transactionId: string;
  let orderData: {
    user: any;
    shippingAddress: any;
    items: any[];
    itemsTotal: number;
    shippingCharge: number;
    totalAmount: number;
    createdAt: Date;
  };

  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.PAID },
      { new: true, session }
    );
    if (!payment) throw new AppError(StatusCodes.NOT_FOUND, "Payment record not found");

    const order = await Order.findByIdAndUpdate(
      payment.order,
      { status: OrderStatus.PROCESSING },
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone")
      .populate("items.product", "name");

    if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");

    // Capture everything we need for post-commit work before ending session
    paymentId = String(payment._id);
    transactionId = payment.transactionId;
    orderData = {
      user: order.user,
      shippingAddress: order.shippingAddress,
      items: order.items as any[],
      itemsTotal: order.itemsTotal,
      shippingCharge: order.shippingCharge,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt as Date,
    };

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  // ---- Phase 2: Post-commit -- PDF, Cloudinary, email (non-fatal) -------------
  // Any failure here does NOT roll back the confirmed payment.
  // The invoiceUrl field simply stays empty and can be regenerated later.
  const user = orderData.user as any;
  const invoiceData = {
    transactionId,
    orderDate: orderData.createdAt,
    customerName: user.name,
    customerPhone: user.phone,
    shippingAddress: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}`,
    items: orderData.items.map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    itemsTotal: orderData.itemsTotal,
    shippingCharge: orderData.shippingCharge,
    totalAmount: orderData.totalAmount,
  };

  // Fire-and-forget — generate PDF, upload, update invoiceUrl, send email
  (async () => {
    try {
      const pdfBuffer = await generateInvoicePdf(invoiceData);
      const cloudResult = await uploadBufferToCloudinary(
        pdfBuffer,
        `invoice-${transactionId}`,
        "mission-bazar/invoices"
      );
      const invoiceUrl = cloudResult?.secure_url ?? "";

      if (invoiceUrl) {
        await Payment.findByIdAndUpdate(paymentId, { invoiceUrl });
      }

      sendEmail({
        to: user.email ?? "",
        subject: "Your Mission Bazar Order Invoice",
        templateName: "invoice",
        templateData: { ...invoiceData, invoiceUrl },
        attachments: [
          {
            filename: `invoice-${transactionId}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      }).catch((err) =>
        console.error(`Invoice email failed for ${transactionId}:`, err)
      );
    } catch (err) {
      console.error(`Post-payment invoice generation failed for ${transactionId}:`, err);
    }
  })();

  return { success: true, message: "Payment completed successfully" };
};

// === Fail callback ===========================================================

const failPayment = async (query: Record<string, string>): Promise<{ success: false; message: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.FAILED },
      { new: true, session }
    );

    if (payment) {
      const order = await Order.findByIdAndUpdate(
        payment.order,
        { status: OrderStatus.FAILED },
        { new: true, session }
      ).populate("user", "name email phone");

      await session.commitTransaction();
      session.endSession();

      // Notify user of failure (non-blocking)
      const orderUser = (order?.user) as any;
      if (orderUser?.email) {
        sendEmail({
          to: orderUser.email,
          subject: "Payment Failed - Mission Bazar",
          templateName: "paymentFailed",
          templateData: {
            customerName: orderUser.name,
            transactionId: payment.transactionId,
            amount: payment.amount,
            frontendUrl: envVars.CLIENT_URL,
          },
        }).catch(console.error);
      }
    } else {
      await session.commitTransaction();
      session.endSession();
    }

    return { success: false, message: "Payment failed" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// === Cancel callback =========================================================

const cancelPayment = async (query: Record<string, string>): Promise<{ success: false; message: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.CANCELLED },
      { new: true, session }
    );

    if (payment) {
      await Order.findByIdAndUpdate(
        payment.order,
        { status: OrderStatus.CANCELLED },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return { success: false, message: "Payment cancelled" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// === Get Invoice URL =========================================================

const getInvoiceUrl = async (
  paymentId: string,
  userId: string,
  role: string
): Promise<string> => {
  const payment = await Payment.findById(paymentId).populate("order", "user");
  if (!payment) throw new AppError(StatusCodes.NOT_FOUND, "Payment not found");

  const order = payment.order as any;
  if (role === "USER" && String(order?.user) !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, "This invoice does not belong to you");
  }
  if (payment.status !== PaymentStatus.PAID) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invoice is only available for completed payments");
  }
  if (!payment.invoiceUrl) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice has not been generated yet");
  }

  return payment.invoiceUrl;
};

// === Get My Payments =========================================================

const getMyPayments = async (userId: string) => {
  // NOTE: We must NOT use Payment.find().populate({ match: { user: userId } })
  // because populate `match` only nullifies the populated field for non-matching
  // records -- it does NOT filter at the DB level, meaning every payment in the
  // collection would be fetched and leaked to the requesting user.
  // Correct approach: find the user's orders first, then query payments by those IDs.
  const userOrders = await Order.find({ user: userId }).select("_id").lean();
  const orderIds = userOrders.map((o) => o._id);

  return Payment.find({ order: { $in: orderIds } })
    .populate("order", "status totalAmount shippingAddress createdAt items")
    .sort({ createdAt: -1 });
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceUrl,
  getMyPayments,
};
