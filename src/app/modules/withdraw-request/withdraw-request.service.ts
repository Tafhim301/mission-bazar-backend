import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { WithdrawRequest } from "./withdraw-request.model";
import { VendorWallet } from "../vendor-wallet/vendor-wallet.model";
import { WithdrawMethod, WithdrawStatus } from "./withdraw-request.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

// ── Vendor: submit a withdrawal request ──────────────────────────────────────

const createWithdrawRequest = async (
  vendorId: string,
  payload: { amount: number; method: WithdrawMethod; accountDetails: string }
) => {
  // 1. Guard: sufficient available balance
  const wallet = await VendorWallet.findOne({ vendor: vendorId });
  const available = wallet?.availableBalance ?? 0;

  if (available < payload.amount) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Insufficient available balance. Available: ৳${available}, Requested: ৳${payload.amount}`
    );
  }

  // 2. Guard: no pending request already open
  const hasPending = await WithdrawRequest.exists({
    vendor: vendorId,
    status: WithdrawStatus.PENDING,
  });
  if (hasPending) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You already have a pending withdrawal request. Please wait for it to be processed."
    );
  }

  return WithdrawRequest.create({ vendor: vendorId, ...payload });
};

// ── Vendor: view own requests ─────────────────────────────────────────────────

const getMyWithdrawRequests = async (vendorId: string, query: Record<string, string>) => {
  const q = new QueryBuilder(
    WithdrawRequest.find({ vendor: vendorId }),
    query
  ).filter().sort().paginate();

  const requests = await q.build();
  const meta     = await q.getMeta();
  return { requests, meta };
};

// ── Admin: all requests ───────────────────────────────────────────────────────

const getAllWithdrawRequests = async (query: Record<string, string>) => {
  const q = new QueryBuilder(
    WithdrawRequest.find().populate("vendor", "name email phone"),
    query
  ).filter().sort().paginate();

  const requests = await q.build();
  const meta     = await q.getMeta();
  return { requests, meta };
};

// ── Admin: approve ────────────────────────────────────────────────────────────

const approveWithdrawRequest = async (requestId: string, adminId: string) => {
  const request = await WithdrawRequest.findById(requestId);
  if (!request)
    throw new AppError(StatusCodes.NOT_FOUND, "Withdrawal request not found");
  if (request.status !== WithdrawStatus.PENDING)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Cannot approve a request with status: ${request.status}`
    );

  return WithdrawRequest.findByIdAndUpdate(
    requestId,
    { status: WithdrawStatus.APPROVED, processedBy: adminId, processedAt: new Date() },
    { new: true }
  );
};

// ── Admin: reject ─────────────────────────────────────────────────────────────

const rejectWithdrawRequest = async (
  requestId: string,
  adminId: string,
  adminNote?: string
) => {
  const request = await WithdrawRequest.findById(requestId);
  if (!request)
    throw new AppError(StatusCodes.NOT_FOUND, "Withdrawal request not found");
  if (request.status !== WithdrawStatus.PENDING)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Cannot reject a request with status: ${request.status}`
    );

  return WithdrawRequest.findByIdAndUpdate(
    requestId,
    {
      status:      WithdrawStatus.REJECTED,
      processedBy: adminId,
      processedAt: new Date(),
      ...(adminNote ? { adminNote } : {}),
    },
    { new: true }
  );
};

// ── Export ────────────────────────────────────────────────────────────────────
export const WithdrawRequestService = {
  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
};
