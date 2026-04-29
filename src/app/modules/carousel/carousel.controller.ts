import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CarouselService } from "./carousel.service";

const createCarousel = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new Error("Banner image is required");
  const carousel = await CarouselService.createCarousel(req.user!.userId, req.body, (req.file as any).path);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Carousel item created", data: carousel });
});

const getActiveCarousels = catchAsync(async (_req: Request, res: Response) => {
  const carousels = await CarouselService.getActiveCarousels();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Active carousels retrieved", data: carousels });
});

const getAllCarousels = catchAsync(async (_req: Request, res: Response) => {
  const carousels = await CarouselService.getAllCarousels();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "All carousels retrieved", data: carousels });
});

const updateCarousel = catchAsync(async (req: Request, res: Response) => {
  const imageUrl = req.file ? (req.file as any).path : undefined;
  const carousel = await CarouselService.updateCarousel(req.params.id, req.body, imageUrl);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Carousel item updated", data: carousel });
});

const deleteCarousel = catchAsync(async (req: Request, res: Response) => {
  await CarouselService.deleteCarousel(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Carousel item deleted", data: null });
});

export const CarouselController = {
  createCarousel, getActiveCarousels, getAllCarousels, updateCarousel, deleteCarousel,
};
