import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PayoutService } from "./payout.service";

// ── Vendor ────────────────────────────────────────────────────────────────────

/** GET /api/v1/payout/my  — vendor views their payout history */
const getMyPayouts = catchAsync(async (req: Request, res: Response) => {
  const result = await PayoutService.getMyPayouts(
    req.user.userId,
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Payout history retrieved",
    data:       result.payouts,
    meta:       result.meta,
  });
});

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/payout  — admin views all payouts */
const getAllPayouts = catchAsync(async (req: Request, res: Response) => {
  const result = await PayoutService.getAllPayouts(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "All payouts retrieved",
    data:       result.payouts,
    meta:       result.meta,
  });
});

/**
 * POST /api/v1/payout
 * Body: { withdrawRequestId, method, reference, note? }
 * Admin records that they have physically sent money to the vendor.
 */
const recordPayout = catchAsync(async (req: Request, res: Response) => {
  const result = await PayoutService.recordPayout(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success:    true,
    message:    "Payout recorded successfully. Earnings settled and wallet updated.",
    data:       result,
  });
});

export const PayoutController = {
  getMyPayouts,
  getAllPayouts,
  recordPayout,
};
