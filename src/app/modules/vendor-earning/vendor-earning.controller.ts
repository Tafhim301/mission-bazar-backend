import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { VendorEarningService } from "./vendor-earning.service";
import { VendorWallet } from "../vendor-wallet/vendor-wallet.model";

// ── Vendor ────────────────────────────────────────────────────────────────────

/** GET /api/v1/earnings/my  — vendor sees their own earnings */
const getMyEarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorEarningService.getMyEarnings(
    req.user.userId,
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Earnings retrieved successfully",
    data:       result.earnings,
    meta:       result.meta,
  });
});

/** GET /api/v1/earnings/my/wallet  — vendor wallet summary */
const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const wallet = await VendorWallet.findOne({ vendor: req.user.userId }).lean();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Wallet retrieved successfully",
    data: wallet ?? {
      pendingBalance:   0,
      availableBalance: 0,
      totalEarned:      0,
      totalPaid:        0,
    },
  });
});

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/earnings  — admin sees all vendor earnings */
const getAllEarnings = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorEarningService.getAllEarnings(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "All earnings retrieved successfully",
    data:       result.earnings,
    meta:       result.meta,
  });
});

/** POST /api/v1/earnings/release  — admin manually triggers holding-period release */
const releaseEarnings = catchAsync(async (_req: Request, res: Response) => {
  const result = await VendorEarningService.releaseAvailableEarnings();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    `${result.released} earning(s) moved from PENDING to AVAILABLE`,
    data:       result,
  });
});

export const VendorEarningController = {
  getMyEarnings,
  getMyWallet,
  getAllEarnings,
  releaseEarnings,
};
