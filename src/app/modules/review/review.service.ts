import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Review } from "./review.model";
import { Order } from "../order/order.model";
import { OrderStatus } from "../order/order.interface";
import { IReviewDocument } from "./review.interface";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/queryBuilder";

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
    images: imageFiles.map((f) => (f as any).path),
    isVerifiedPurchase: !!deliveredOrder,
  });

  await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });
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
};

export const ReviewService = { createReview, getProductReviews, updateReview, replyToReview, deleteReview };
