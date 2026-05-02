import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { FeaturedService } from "./featured.service";
import { FeaturedType } from "./featured.interface";

const getFlashSale = catchAsync(async (_req: Request, res: Response) => {
  const data = await FeaturedService.getByType(FeaturedType.FLASH_SALE);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Flash sale products", data });
});

const getTrending = catchAsync(async (_req: Request, res: Response) => {
  const data = await FeaturedService.getByType(FeaturedType.TRENDING);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Trending products", data });
});

const getAll = catchAsync(async (_req: Request, res: Response) => {
  const data = await FeaturedService.getAll();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "All featured entries", data });
});

const addFeatured = catchAsync(async (req: Request, res: Response) => {
  const data = await FeaturedService.addFeatured(req.body);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Added to featured", data });
});

const updateFeatured = catchAsync(async (req: Request, res: Response) => {
  const data = await FeaturedService.updateFeatured(req.params.id, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Featured updated", data });
});

const removeFeatured = catchAsync(async (req: Request, res: Response) => {
  await FeaturedService.removeFeatured(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Removed from featured", data: null });
});

export const FeaturedController = { getFlashSale, getTrending, getAll, addFeatured, updateFeatured, removeFeatured };
