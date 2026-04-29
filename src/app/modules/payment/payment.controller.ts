import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import { SSLService } from "../sslcommerz/sslcommerz.service";
import { envVars } from "../../config/env";

// === POST /payment/init/:orderId — retry payment for an existing order ========
const initPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initPayment(
    req.params.orderId,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment URL generated successfully",
    data: result,
  });
});

// === POST /payment/success — SSLCommerz success redirect =====================
const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.successPayment(query);
  res.redirect(
    `${envVars.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&message=${encodeURIComponent(result.message)}&status=success`
  );
});

// === POST /payment/fail — SSLCommerz fail redirect ===========================
const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.failPayment(query);
  res.redirect(
    `${envVars.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&message=${encodeURIComponent(result.message)}&status=fail`
  );
});

// === POST /payment/cancel — SSLCommerz cancel redirect =======================
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.cancelPayment(query);
  res.redirect(
    `${envVars.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&message=${encodeURIComponent(result.message)}&status=cancel`
  );
});

// === POST /payment/validate — SSLCommerz IPN webhook =========================
const validatePayment = catchAsync(async (req: Request, res: Response) => {
  await SSLService.validatePayment(req.body as Record<string, string>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment validated",
    data: null,
  });
});

// === GET /payment/invoice/:paymentId — get invoice download URL ==============
const getInvoiceUrl = catchAsync(async (req: Request, res: Response) => {
  const url = await PaymentService.getInvoiceUrl(
    req.params.paymentId,
    req.user!.userId,
    req.user!.role
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Invoice URL retrieved successfully",
    data: { invoiceUrl: url },
  });
});

// === GET /payment/my-payments — authenticated user's payment history =========
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const payments = await PaymentService.getMyPayments(req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment history retrieved successfully",
    data: payments,
  });
});

export const PaymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  validatePayment,
  getInvoiceUrl,
  getMyPayments,
};
