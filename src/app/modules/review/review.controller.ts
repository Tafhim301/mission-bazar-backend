import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = await ReviewService.createReview(req.user!.userId, req.body, (req.files as Express.Multer.File[]) ?? []);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Review submitted", data: review });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const { reviews, meta } = await ReviewService.getProductReviews(req.params.productId, req.query as Record<string, string>);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Reviews retrieved", data: reviews, meta });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const review = await ReviewService.updateReview(req.params.id, req.user!.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Review updated", data: review });
});

const replyToReview = catchAsync(async (req: Request, res: Response) => {
  const review = await ReviewService.replyToReview(req.params.id, req.user!.userId, req.body.comment);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Reply posted", data: review });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(req.params.id, req.user!.userId, req.user!.role);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Review deleted", data: null });
});

export const ReviewController = { createReview, getProductReviews, updateReview, replyToReview, deleteReview };
