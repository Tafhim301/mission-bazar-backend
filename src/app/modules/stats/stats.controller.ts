import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";

const getAdminStats = catchAsync(async (_req: Request, res: Response) => {
  const data = await StatsService.getAdminStats();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Admin stats", data });
});

const getVendorStats = catchAsync(async (req: Request, res: Response) => {
  const vendorId = (req as Request & { user?: { _id: string } }).user!._id;
  const data = await StatsService.getVendorStats(vendorId);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Vendor stats", data });
});

export const StatsController = { getAdminStats, getVendorStats };
