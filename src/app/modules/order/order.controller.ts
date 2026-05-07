import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderService } from "./order.service";
import { OrderStatus } from "./order.interface";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { order, paymentUrl } = await OrderService.createOrder(
    req.user!.userId,
    req.user!.role,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Order placed successfully. Proceed to payment.",
    data: { order, paymentUrl },
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const { orders, meta } = await OrderService.getMyOrders(
    req.user!.userId,
    req.query as Record<string, string>
  );
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Orders retrieved successfully", data: orders, meta });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const { orders, meta } = await OrderService.getAllOrders(
    req.query as Record<string, string>
  );
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Orders retrieved successfully", data: orders, meta });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.getOrderById(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Order retrieved successfully", data: order });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, note, trackingInfo } = req.body as {
    status: OrderStatus;
    note?: string;
    trackingInfo?: { courier: string; trackingId: string; trackingUrl?: string };
  };
  const order = await OrderService.updateOrderStatus(req.params.id, status, { note, trackingInfo });
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: `Order status updated to ${status}`, data: order });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  await OrderService.cancelOrder(req.params.id, req.user!.userId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Order cancelled successfully", data: null });
});

const getVendorOrders = catchAsync(async (req: Request, res: Response) => {
  const { orders, meta } = await OrderService.getVendorOrders(
    req.user!.userId,
    req.query as Record<string, string>
  );
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Vendor orders retrieved", data: orders, meta });
});

export const OrderController = {
  createOrder, getMyOrders, getAllOrders,
  getOrderById, updateOrderStatus, cancelOrder, getVendorOrders,
};
