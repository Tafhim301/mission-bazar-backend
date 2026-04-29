import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary";
import { Request } from "express";
import { FileFilterCallback } from "multer";
import AppError from "../errorHandlers/appError";
import { StatusCodes } from "http-status-codes";

// === Allowed types & size ====================================================

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// === File filter =============================================================

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        StatusCodes.UNSUPPORTED_MEDIA_TYPE,
        `Unsupported file type "${file.mimetype}". Allowed: jpeg, jpg, png, webp, gif`
      )
    );
  }
};

// === CloudinaryStorage — files go straight to Cloudinary ====================
// file.path  → the Cloudinary secure_url (what we store in DB)
// file.filename → the public_id  (what we use to delete later)

const buildStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `mission-bazar/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
      public_id: (_req: Request, file: Express.Multer.File) => {
        const baseName = file.originalname
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9.-]/g, "");
        return `${Date.now()}-${Math.random().toString(36).slice(2)}-${baseName}`;
      },
    } as object,
  });

// === Named multer instances per resource =====================================

/** For product images — up to 8 files, field name: "images" */
export const productUpload = multer({
  storage: buildStorage("products"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** For user avatars — single file, field name: "profileImage" */
export const avatarUpload = multer({
  storage: buildStorage("avatars"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/** Generic single-image upload (pass folder at call-site via storage override) */
export const upload = multer({
  storage: multer.memoryStorage(), // fallback when caller handles upload manually
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
