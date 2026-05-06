import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { VendorEarning } from "./vendor-earning.model";
import { VendorWallet } from "../vendor-wallet/vendor-wallet.model";
import { EarningStatus, IEarningItem } from "./vendor-earning.interface";
import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { QueryBuilder } from "../../utils/queryBuilder";

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.10; // 10 % platform commission
const HOLDING_DAYS      = 7;    // earnings released after 7 days

// ── Helpers ───────────────────────────────────────────────────────────────────
const round2 = (n: number) => Math.round(n * 100) / 100;

// ── Core: create earnings when order is DELIVERED ────────────────────────────

/**
 * Called internally when an order status transitions to DELIVERED.
 * Groups items by vendor and creates one VendorEarning per vendor.
 * Idempotent — safe to call multiple times for the same order.
 */
const createEarningsForOrder = async (orderId: string): Promise<void> => {
  // Idempotency check
  const alreadyExists = await VendorEarning.exists({ order: orderId });
  if (alreadyExists) return;

  const order = await Order.findById(orderId);
  if (!order) throw new AppError(StatusCodes.NOT_FOUND, "Order not found");

  // Build vendor → items map
  const vendorMap = new Map<
    string,
    { items: IEarningItem[]; gross: number }
  >();

  for (const item of order.items) {
    const product = await Product.findById(item.product).select("vendor").lean();
    if (!product?.vendor) continue; // skip products without a vendor

    const vendorId = String(product.vendor);

    if (!vendorMap.has(vendorId)) {
      vendorMap.set(vendorId, { items: [], gross: 0 });
    }

    const entry = vendorMap.get(vendorId)!;
    entry.items.push({
      product:  item.product as mongoose.Types.ObjectId,
      name:     item.name,
      price:    item.price,
      quantity: item.quantity,
    });
    entry.gross += item.price * item.quantity;
  }

  if (vendorMap.size === 0) return; // no vendor products in this order

  const session  = await mongoose.startSession();
  session.startTransaction();

  try {
    const availableAt = new Date(Date.now() + HOLDING_DAYS * 24 * 60 * 60 * 1000);

    for (const [vendorId, { items, gross }] of vendorMap.entries()) {
      const grossAmount = round2(gross);
      const platformFee = round2(grossAmount * PLATFORM_FEE_RATE);
      const netPayable  = round2(grossAmount - platformFee);

      await VendorEarning.create(
        [{
          vendor:          vendorId,
          order:           orderId,
          items,
          grossAmount,
          platformFeeRate: PLATFORM_FEE_RATE,
          platformFee,
          netPayable,
          status:          EarningStatus.PENDING,
          availableAt,
        }],
        { session }
      );

      // Upsert wallet — create if first earning for this vendor
      await VendorWallet.findOneAndUpdate(
        { vendor: vendorId },
        {
          $inc:       { pendingBalance: netPayable, totalEarned: netPayable },
          $setOnInsert: { availableBalance: 0, totalPaid: 0 },
        },
        { upsert: true, new: true, session }
      );
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ── Release: PENDING → AVAILABLE ─────────────────────────────────────────────

/**
 * Finds all PENDING earnings whose holding period has expired and
 * moves them to AVAILABLE, updating each vendor's wallet accordingly.
 * Called by the daily cron job or admin trigger.
 */
const releaseAvailableEarnings = async (): Promise<{ released: number }> => {
  const now = new Date();

  const pendingEarnings = await VendorEarning.find({
    status:      EarningStatus.PENDING,
    availableAt: { $lte: now },
  }).lean();

  if (pendingEarnings.length === 0) return { released: 0 };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const earning of pendingEarnings) {
      await VendorEarning.findByIdAndUpdate(
        earning._id,
        { status: EarningStatus.AVAILABLE },
        { session }
      );

      await VendorWallet.findOneAndUpdate(
        { vendor: earning.vendor },
        {
          $inc: {
            pendingBalance:   -earning.netPayable,
            availableBalance:  earning.netPayable,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    return { released: pendingEarnings.length };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Vendor: view their own earnings */
const getMyEarnings = async (vendorId: string, query: Record<string, string>) => {
  const q = new QueryBuilder(
    VendorEarning.find({ vendor: vendorId })
      .populate("order", "totalAmount status createdAt transactionId"),
    query
  ).filter().sort().paginate();

  const earnings = await q.build();
  const meta     = await q.getMeta();
  return { earnings, meta };
};

/** Admin: all earnings across all vendors */
const getAllEarnings = async (query: Record<string, string>) => {
  const q = new QueryBuilder(
    VendorEarning.find()
      .populate("vendor", "name email phone")
      .populate("order",  "totalAmount status createdAt transactionId"),
    query
  ).filter().sort().paginate();

  const earnings = await q.build();
  const meta     = await q.getMeta();
  return { earnings, meta };
};

// ── Export ────────────────────────────────────────────────────────────────────
export const VendorEarningService = {
  createEarningsForOrder,
  releaseAvailableEarnings,
  getMyEarnings,
  getAllEarnings,
};
