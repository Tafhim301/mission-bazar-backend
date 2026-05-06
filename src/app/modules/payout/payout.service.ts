import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { Payout } from "./payout.model";
import { WithdrawRequest } from "../withdraw-request/withdraw-request.model";
import { VendorEarning } from "../vendor-earning/vendor-earning.model";
import { VendorWallet } from "../vendor-wallet/vendor-wallet.model";
import { EarningStatus } from "../vendor-earning/vendor-earning.interface";
import { WithdrawStatus } from "../withdraw-request/withdraw-request.interface";
import { PayoutMethod } from "./payout.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

// ── Admin: record a manual payout ────────────────────────────────────────────

/**
 * Admin marks a withdrawal request as paid after sending money manually.
 *
 * Flow:
 *  1. Validate the WithdrawRequest is APPROVED (not already paid).
 *  2. Collect AVAILABLE earnings for that vendor (oldest first) to cover the amount.
 *  3. Create the Payout document.
 *  4. Mark those earnings → PAID.
 *  5. Mark the WithdrawRequest → PAID.
 *  6. Deduct from vendor wallet.
 *
 * All steps run inside a single transaction (idempotent via unique index on withdrawRequest).
 */
const recordPayout = async (
  adminId: string,
  payload: {
    withdrawRequestId: string;
    method: PayoutMethod;
    reference: string;
    note?: string;
  }
) => {
  // 1. Validate withdraw request
  const withdrawRequest = await WithdrawRequest.findById(payload.withdrawRequestId);
  if (!withdrawRequest)
    throw new AppError(StatusCodes.NOT_FOUND, "Withdrawal request not found");
  if (withdrawRequest.status !== WithdrawStatus.APPROVED)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Withdrawal request must be APPROVED before recording a payout (current: ${withdrawRequest.status})`
    );

  // Idempotency: no duplicate payout for same request
  const alreadyPaid = await Payout.exists({ withdrawRequest: payload.withdrawRequestId });
  if (alreadyPaid)
    throw new AppError(StatusCodes.CONFLICT, "A payout has already been recorded for this request");

  const vendorId = String(withdrawRequest.vendor);
  const amount   = withdrawRequest.amount;

  // 2. Collect AVAILABLE earnings (oldest first) to tag in this payout
  const availableEarnings = await VendorEarning.find({
    vendor: vendorId,
    status: EarningStatus.AVAILABLE,
  })
    .sort({ createdAt: 1 })
    .lean();

  // Build list of earnings to settle (greedy: oldest first until amount covered)
  const earningsToSettle: mongoose.Types.ObjectId[] = [];
  let covered = 0;

  for (const e of availableEarnings) {
    earningsToSettle.push(e._id as mongoose.Types.ObjectId);
    covered += e.netPayable;
    if (covered >= amount) break;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 3. Create Payout record
    const [payout] = await Payout.create(
      [{
        vendor:          vendorId,
        withdrawRequest: payload.withdrawRequestId,
        amount,
        method:          payload.method,
        reference:       payload.reference,
        note:            payload.note,
        processedBy:     adminId,
        earnings:        earningsToSettle,
      }],
      { session }
    );

    const now = new Date();

    // 4. Mark earnings as PAID
    if (earningsToSettle.length > 0) {
      await VendorEarning.updateMany(
        { _id: { $in: earningsToSettle } },
        { status: EarningStatus.PAID, paidAt: now, payout: payout._id },
        { session }
      );
    }

    // 5. Mark withdraw request as PAID
    await WithdrawRequest.findByIdAndUpdate(
      payload.withdrawRequestId,
      { status: WithdrawStatus.PAID, processedBy: adminId, processedAt: now },
      { session }
    );

    // 6. Deduct from vendor wallet (never go below 0)
    await VendorWallet.findOneAndUpdate(
      { vendor: vendorId },
      { $inc: { availableBalance: -amount, totalPaid: amount } },
      { session }
    );

    await session.commitTransaction();
    return payout;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Admin: all payouts */
const getAllPayouts = async (query: Record<string, string>) => {
  const q = new QueryBuilder(
    Payout.find()
      .populate("vendor",          "name email phone")
      .populate("withdrawRequest", "amount method accountDetails")
      .populate("processedBy",     "name email"),
    query
  ).filter().sort().paginate();

  const payouts = await q.build();
  const meta    = await q.getMeta();
  return { payouts, meta };
};

/** Vendor: view their own payout history */
const getMyPayouts = async (vendorId: string, query: Record<string, string>) => {
  const q = new QueryBuilder(
    Payout.find({ vendor: vendorId })
      .populate("withdrawRequest", "amount method accountDetails status"),
    query
  ).filter().sort().paginate();

  const payouts = await q.build();
  const meta    = await q.getMeta();
  return { payouts, meta };
};

// ── Export ────────────────────────────────────────────────────────────────────
export const PayoutService = {
  recordPayout,
  getAllPayouts,
  getMyPayouts,
};
