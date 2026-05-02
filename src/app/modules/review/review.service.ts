import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Review } from "./review.model";
import { Order } from "../order/order.model";
import { OrderStatus } from "../order/order.interface";
import { IReviewDocument } from "./review.interface";
import { User } from "../user/user.model";
import { Product } from "../product/product.model";
import { QueryBuilder } from "../../utils/queryBuilder";

// Recompute product avgRating + vendor vendorAvgRating after any review mutation
const recomputeRatings = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg   = stats[0]?.avg   ?? 0;
  const count = stats[0]?.count ?? 0;

  await Product.findByIdAndUpdate(productId, {
    avgRating:    +avg.toFixed(2),
    totalReviews: count,
  });

  const product = await Product.findById(productId).select("vendor").lean();
  if (!product?.vendor) return;

  const vendorStats = await Review.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "prod",
      },
    },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": product.vendor } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await User.findByIdAndUpdate(product.vendor, {
    vendorAvgRating:   +(vendorStats[0]?.avg   ?? 0).toFixed(2),
    vendorTotalReviews: vendorStats[0]?.count ?? 0,
  });
};

const createReview = async (
  userId: string,
  payload: { product: string; rating: number; comment: string },
  imageFiles: Express.Multer.File[]
): Promise<IReviewDocument> => {
  const existing = await Review.findOne({ user: userId, product: payload.product });
  if (existing) throw new AppError(StatusCodes.CONFLICT, "You have already reviewed this product");

  const deliveredOrder = await Order.findOne({
    user: userId, status: OrderStatus.DELIVERED, "items.product": payload.product,
  });

  const review = await Review.create({
    ...payload,
    user: userId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: imageFiles.map((f) => (f as any).path),
    isVerifiedPurchase: !!deliveredOrder,
  });

  await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });
  await recomputeRatings(payload.product);
  return review;
};

const getProductReviews = async (productId: string, query: Record<string, string>) => {
  const rQuery = new QueryBuilder(
    Review.find({ product: productId })
      .populate("user", "name profileImage")
      .populate("sellerReply.repliedBy", "name"),
    query
  ).sort().paginate();
  const reviews = await rQuery.build();
  const meta    = await rQuery.getMeta();
  return { reviews, meta };
};

const updateReview = async (
  reviewId: string, userId: string,
  payload: Partial<Pick<IReviewDocument, "rating" | "comment">>
): Promise<IReviewDocument> => {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, user: userId },
    payload,
    { new: true, runValidators: true }
  );
  if (!review) throw new AppError(StatusCodes.NOT_FOUND, "Review not found or not yours");
  await recomputeRatings(String(review.product));
  return review;
};

const replyToReview = async (
  reviewId: string, replierId: string,
  comment: string
): Promise<IReviewDocument> => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { sellerReply: { comment, repliedAt: new Date(), repliedBy: replierId } },
    { new: true, runValidators: true }
  );
  if (!review) throw new AppError(StatusCodes.NOT_FOUND, "Review not found");
  return review;
};

const deleteReview = async (reviewId: string, userId: string, role: string): Promise<void> => {
  const filter = role === "ADMIN" ? { _id: reviewId } : { _id: reviewId, user: userId };
  const review = await Review.findOneAndDelete(filter);
  if (!review) throw new AppError(StatusCodes.NOT_FOUND, "Review not found or not yours");
  await User.findByIdAndUpdate(review.user, { $pull: { reviews: review._id } });
  await recomputeRatings(String(review.product));
};

export const ReviewService = { createReview, getProductReviews, updateReview, replyToReview, deleteReview };
