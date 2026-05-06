import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync }   from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHandlers/appError";
import { VendorDocumentService } from "./vendor-document.service";
import { DocumentType } from "./vendor-document.interface";

// ── Vendor-facing ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/vendor-docs
 * multipart/form-data  →  file (image) + type (DocumentType)
 * Multer uploads to Cloudinary; req.file.path = fileUrl, req.file.filename = publicId
 */
const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No file uploaded. Include a file in the request.");
  }

  const { type } = req.body as { type: DocumentType };
  if (!Object.values(DocumentType).includes(type)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Invalid document type. Allowed: ${Object.values(DocumentType).join(", ")}`
    );
  }

  const result = await VendorDocumentService.uploadDocument(
    req.user.userId,
    type,
    req.file.path,      // Cloudinary secure_url
    req.file.filename   // Cloudinary public_id
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success:    true,
    message:    `Document "${type}" uploaded successfully. It is now pending admin review.`,
    data:       result,
  });
});

/** GET /api/v1/vendor-docs/my  — vendor views their own documents */
const getMyDocuments = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorDocumentService.getMyDocuments(req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Your documents retrieved",
    data:       result,
  });
});

// ── Admin-facing ──────────────────────────────────────────────────────────────

/** GET /api/v1/vendor-docs  — all documents (admin) */
const getAllDocuments = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorDocumentService.getAllDocuments(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "All vendor documents retrieved",
    data:       result.docs,
    meta:       result.meta,
  });
});

/** PATCH /api/v1/vendor-docs/:id/approve */
const approveDocument = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorDocumentService.approveDocument(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Document approved. Vendor auto-activation check complete.",
    data:       result,
  });
});

/** PATCH /api/v1/vendor-docs/:id/reject  — body: { rejectionReason } */
const rejectDocument = catchAsync(async (req: Request, res: Response) => {
  const { rejectionReason } = req.body as { rejectionReason?: string };
  if (!rejectionReason?.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Provide a rejectionReason so the vendor knows what to fix.");
  }

  const result = await VendorDocumentService.rejectDocument(
    req.params.id,
    req.user.userId,
    rejectionReason.trim()
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success:    true,
    message:    "Document rejected",
    data:       result,
  });
});

export const VendorDocumentController = {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  approveDocument,
  rejectDocument,
};
