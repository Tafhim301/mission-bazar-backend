import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync }   from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { VendorService } from "./vendor.service";

// ── Vendor-facing ─────────────────────────────────────────────────────────────

/** POST /api/v1/vendor/apply */
const applyAsVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.applyAsVendor(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success:    true,
    message:    "Vendor profile created. Upload your required documents and submit for review.",
    data:       result,
  });
});

/** PATCH /api/v1/vendor/me — JSON update (DRAFT/REJECTED: all fields; ACTIVE: appearance only) */
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  // Merge uploaded file URLs into body if present
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const payload = { ...req.body };
  if (files?.shopBanner?.[0]) payload.shopBanner = files.shopBanner[0].path;
  if (files?.shopImage?.[0])  payload.shopImage  = files.shopImage[0].path;

  const result = await VendorService.updateMyProfile(req.user.userId, payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Vendor profile updated",
    data:       result,
  });
});

/** POST /api/v1/vendor/submit */
const submitForReview = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.submitForReview(req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Application submitted for review. You will be notified once verified.",
    data:       result,
  });
});

/** GET /api/v1/vendor/me */
const getMyVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getMyVendorProfile(req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Vendor profile retrieved",
    data:       result,
  });
});

// ── Public-facing ─────────────────────────────────────────────────────────────

/** GET /api/v1/vendor/active — paginated active vendors (for homepage) */
const getActiveVendors = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getActiveVendors(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Active vendors retrieved",
    data:       result.vendors,
    meta:       result.meta,
  });
});

/** GET /api/v1/vendor/public/:userId — public shop profile (by user._id) */
const getPublicVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getPublicVendorProfile(req.params.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Vendor shop retrieved",
    data:       result,
  });
});

// ── Admin-facing ──────────────────────────────────────────────────────────────

/** GET /api/v1/vendor */
const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getAllVendors(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "All vendors retrieved",
    data:       result.vendors,
    meta:       result.meta,
  });
});

/** GET /api/v1/vendor/:id */
const getVendorById = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getVendorById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Vendor retrieved",
    data:       result,
  });
});

/** PATCH /api/v1/vendor/:id/activate */
const activateVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.activateVendor(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Vendor activated successfully. User role elevated to VENDOR.",
    data:       result,
  });
});

/** PATCH /api/v1/vendor/:id/reject */
const rejectVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.rejectVendor(
    req.params.id,
    req.user.userId,
    req.body.rejectionNote
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Vendor application rejected",
    data:       result,
  });
});

export const VendorController = {
  applyAsVendor,
  updateMyProfile,
  submitForReview,
  getMyVendorProfile,
  getActiveVendors,
  getPublicVendorProfile,
  getAllVendors,
  getVendorById,
  activateVendor,
  rejectVendor,
};
