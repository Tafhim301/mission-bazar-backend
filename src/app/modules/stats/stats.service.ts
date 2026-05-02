import { Types } from "mongoose";
import { Order } from "../order/order.model";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";
import { Review } from "../review/review.model";
import { OrderStatus, OrderPaymentStatus } from "../order/order.interface";
import { UserRole } from "../user/user.interface";

// ─── ADMIN SITE-WIDE STATS ───────────────────────────────────────────────────
const getAdminStats = async () => {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    revenueAgg,
    ordersByStatus,
    topProducts,
    topVendors,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: UserRole.USER, isDeleted: false }),
    User.countDocuments({ role: UserRole.AGENT, isDeleted: false }),
    Product.countDocuments({ isDeleted: false }),
    Order.countDocuments(),

    // total paid revenue
    Order.aggregate([
      { $match: { paymentStatus: OrderPaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),

    // orders by status
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // top 5 products by sold count
    Product.find({ isDeleted: false })
      .sort({ sold: -1 })
      .limit(5)
      .select("name images singleItemPrice sold avgRating")
      .lean(),

    // top 5 vendors by total orders
    Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      {
        $group: {
          _id: "$prod.vendor",
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", OrderPaymentStatus.PAID] }, "$items.price", 0],
            },
          },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      {
        $project: {
          vendorId: "$_id",
          name: "$vendor.name",
          email: "$vendor.email",
          profileImage: "$vendor.profileImage",
          totalOrders: 1,
          totalRevenue: 1,
        },
      },
    ]),

    // 5 most recent orders
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("totalAmount status paymentStatus createdAt")
      .lean(),

    // revenue per month (last 12 months)
    Order.aggregate([
      {
        $match: {
          paymentStatus: OrderPaymentStatus.PAID,
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const statusMap: Record<string, number> = {};
  for (const s of ordersByStatus) statusMap[s._id] = s.count;

  return {
    overview: {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      pendingOrders: statusMap[OrderStatus.PENDING] ?? 0,
      processingOrders: statusMap[OrderStatus.PROCESSING] ?? 0,
      deliveredOrders: statusMap[OrderStatus.DELIVERED] ?? 0,
      cancelledOrders: statusMap[OrderStatus.CANCELLED] ?? 0,
    },
    ordersByStatus: statusMap,
    topProducts,
    topVendors,
    recentOrders,
    monthlyRevenue,
  };
};

// ─── VENDOR OWN STATS ────────────────────────────────────────────────────────
const getVendorStats = async (vendorId: string) => {
  const vid = new Types.ObjectId(vendorId);

  const [
    totalProducts,
    productsByStatus,
    revenueAgg,
    ordersByStatus,
    topProducts,
    recentOrders,
    reviewStats,
    monthlyRevenue,
    pendingDeliveries,
  ] = await Promise.all([
    Product.countDocuments({ vendor: vid, isDeleted: false }),

    Product.aggregate([
      { $match: { vendor: vid, isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // revenue from orders containing vendor's products
    Order.aggregate([
      { $match: { paymentStatus: OrderPaymentStatus.PAID } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vid } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
    ]),

    // orders containing this vendor's products by status
    Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vid } },
      { $group: { _id: "$status", count: { $addToSet: "$_id" } } },
      { $project: { _id: 1, count: { $size: "$count" } } },
    ]),

    // top 5 own products by sold
    Product.find({ vendor: vid, isDeleted: false })
      .sort({ sold: -1 })
      .limit(5)
      .select("name images singleItemPrice sold avgRating status")
      .lean(),

    // 5 recent orders containing vendor's products
    Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vid } },
      {
        $group: {
          _id: "$_id",
          totalAmount: { $first: "$totalAmount" },
          status: { $first: "$status" },
          paymentStatus: { $first: "$paymentStatus" },
          createdAt: { $first: "$createdAt" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
    ]),

    // review stats for vendor's products
    Review.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vid } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),

    // monthly revenue last 12m
    Order.aggregate([
      {
        $match: {
          paymentStatus: OrderPaymentStatus.PAID,
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vid } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders: { $addToSet: "$_id" },
        },
      },
      { $project: { _id: 1, revenue: 1, orders: { $size: "$orders" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // pending deliveries count
    Order.aggregate([
      { $match: { status: { $in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "prod",
        },
      },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vid } },
      { $group: { _id: "$_id" } },
      { $count: "count" },
    ]),
  ]);

  const prodStatusMap: Record<string, number> = {};
  for (const s of productsByStatus) prodStatusMap[s._id] = s.count;

  const orderStatusMap: Record<string, number> = {};
  for (const s of ordersByStatus) orderStatusMap[s._id] = s.count;

  return {
    overview: {
      totalProducts,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      avgRating: +(reviewStats[0]?.avgRating ?? 0).toFixed(2),
      totalReviews: reviewStats[0]?.totalReviews ?? 0,
      pendingDeliveries: pendingDeliveries[0]?.count ?? 0,
    },
    productsByStatus: prodStatusMap,
    ordersByStatus: orderStatusMap,
    topProducts,
    recentOrders,
    monthlyRevenue,
  };
};

export const StatsService = { getAdminStats, getVendorStats };
