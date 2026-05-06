import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WithdrawRequestService } from "./withdraw-request.service";

// ── Vendor ────────────────────────────────────────────────────────────────────

/** POST /api/v1/withdraw  — vendor submits a withdrawal request */
const createWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawRequestService.createWithdrawRequest(
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success:    true,
    message:    "Withdrawal request submitted successfully",
    data:       result,
  });
});

/** GET /api/v1/withdraw/my  — vendor views their own requests */
const getMyWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawRequestService.getMyWithdrawRequests(
    req.user.userId,
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Withdrawal requests retrieved",
    data:       result.requests,
    meta:       result.meta,
  });
});

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/withdraw  — admin views all requests */
const getAllWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawRequestService.getAllWithdrawRequests(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "All withdrawal requests retrieved",
    data:       result.requests,
    meta:       result.meta,
  });
});

/** PATCH /api/v1/withdraw/:id/approve */
const approveWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawRequestService.approveWithdrawRequest(
    req.params.id,
    req.user.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Withdrawal request approved",
    data:       result,
  });
});

/** PATCH /api/v1/withdraw/:id/reject */
const rejectWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawRequestService.rejectWithdrawRequest(
    req.params.id,
    req.user.userId,
    req.body.adminNote
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Withdrawal request rejected",
    data:       result,
  });
});

export const WithdrawRequestController = {
  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
};
