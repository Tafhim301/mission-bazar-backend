import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { Order } from "./order.model";
import { IOrderDocument, OrderStatus } from "./order.interface";
import { Product } from "../product/product.model";
import { ProductStatus } from "../product/product.interface";
import { Payment } from "../payment/payment.model";
import { PaymentStatus } from "../payment/payment.interface";
import { User } from "../user/user.model";
import { SSLService } from "../sslcommerz/sslcommerz.service";
import { getTransactionId } from "../../utils/getTransactionId";
import { QueryBuilder } from "../../utils/queryBuilder";

const SHIPPING_CHARGE = 60; // BDT flat rate

// === Create Order + Payment record atomically ================================

const createOrder = async (
  userId: string,
  payload: {
    items: { product: string; quantity: number }[];
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
    };
    note?: string;
  }
): Promise<{ order: IOrderDocument; paymentUrl: string }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate & snapshot each product
    const resolvedItems = await Promise.all(
      payload.items.map(async ({ product: productId, quantity }) => {
        const product = await Product.findById(productId).populate("category", "name").session(session);

        if (!product) {
          throw new AppError(StatusCodes.NOT_FOUND, `Product not found: ${productId}`);
        }
        if (product.status !== ProductStatus.ACTIVE) {
          throw new AppError(StatusCodes.BAD_REQUEST, `Product "${product.name}" is not available`);
        }
        if (product.stock < quantity) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Insufficient stock for "${product.name}". Available: ${product.stock}`
          );
        }

        const effectivePrice = product.discountPrice ?? product.price;

        return {
          product: product._id,
          name: product.name,
          image: product.images[0] ?? "",
          price: effectivePrice,
          quantity,
        };
      })
    );

    // 2. Decrement stock for each product
    await Promise.all(
      resolvedItems.map(({ product: pid, quantity }) =>
        Product.findByIdAndUpdate(
          pid,
          { $inc: { stock: -quantity, sold: quantity } },
          { session }
        )
      )
    );

    // 3. Calculate totals
    const itemsTotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalAmount = itemsTotal + SHIPPING_CHARGE;

    // 4. Create Order
    const [order] = await Order.create(
      [
        {
          user: userId,
          items: resolvedItems,
          shippingAddress: payload.shippingAddress,
          itemsTotal,
          shippingCharge: SHIPPING_CHARGE,
          totalAmount,
          note: payload.note,
        },
      ],
      { session }
    );

    // 5. Create Payment record
    const transactionId = getTransactionId();
    const [payment] = await Payment.create(
      [
        {
          order: order._id,
          transactionId,
          amount: totalAmount,
          status: PaymentStatus.UNPAID,
        },
      ],
      { session }
    );

    // 6. Link payment back to order
    await Order.findByIdAndUpdate(order._id, { payment: payment._id }, { session });

    // 7. Init SSLCommerz payment (static import — no circular dependency)
    const user = await User.findById(userId).session(session);

    const sslResult = await SSLService.initPayment({
      amount: totalAmount,
      transactionId,
      name: user?.name ?? payload.shippingAddress.fullName,
      email: user?.email ?? "noemail@example.com",
      phoneNumber: user?.phone ?? payload.shippingAddress.phone,
      address: payload.shippingAddress.address,
    });

    if (!sslResult.GatewayPageURL) {
      throw new AppError(StatusCodes.BAD_GATEWAY, "Failed to initialise SSLCommerz payment gateway");
    }

    await session.commitTransaction();
    session.endSession();

    return { order, paymentUrl: sslResult.GatewayPageURL };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// === Get My Orders ===========================================================

const getMyOrders = async (userId: string, query: Record<string, string>) => {
  const orderQuery = new QueryBuilder(
    Order.find({ user: userId })
      .populate("items.product", "name images")
      .populate("payment", "status invoiceUrl transactionId"),
    query
  )
    .filter()
    .sort()
    .paginate();

  const orders = await orderQuery.build();
  const meta = await orderQuery.getMeta();
  return { orders, meta };
};

// === Get All Orders (Admin) ==================================================

const getAllOrders = async (query: Record<string, string>) => {
  const orderQuery = new QueryBuilder(
    Order.find()
      .populate("user", "name phone email")
      .populate("items.product", "name images")
      .populate("payment", "status invoiceUrl transactionId"),
    query
  )
    .filter()
    .sort()
    .paginate();

  const orders = await orderQuery.build();
  const meta = await orderQuery.getMeta();
  return { orders, meta };
};

// === Get Single Order =========================================================

const getOrderById = async (
  orderId: string,
  userId: string,
  role: string
): Promise<IOrderDocument> => {
  const order = await Order.findById(orderId)
    .populate("user", "name phone email")
    .populate("items.product", "name images price")
    .populate("payment", "status invoiceUrl transactionId amount");

  if (!order) throw new AppError(StatusCodes.NOT_FOUND, `No order found with ID: ${orderId}`);
  if (role === "USER" && String(order.user) !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, "You can only view your own orders");
  }
  return order as IOrderDocument;
};

// === Update Order Status (Admin) =============================================

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<IOrderDocument> => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: { status } },
    { new: true, runValidators: true }
  );
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, `No order found with ID: ${orderId}`);
  return order;
};

// === Cancel Order (User — only PENDING) ======================================

const cancelOrder = async (orderId: string, userId: string): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
    if (String(order.user) !== userId)
      throw new AppError(StatusCodes.FORBIDDEN, "You can only cancel your own orders");
    if (order.status !== OrderStatus.PENDING)
      throw new AppError(StatusCodes.BAD_REQUEST, `Cannot cancel an order with status: ${order.status}`);

    // Restore stock
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity, sold: -item.quantity } },
          { session }
        )
      )
    );

    await Order.findByIdAndUpdate(orderId, { status: OrderStatus.CANCELLED }, { session });
    await Payment.findOneAndUpdate(
      { order: orderId },
      { status: PaymentStatus.CANCELLED },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
