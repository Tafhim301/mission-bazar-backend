import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import AppError from "../errorHandlers/appError";
import { StatusCodes } from "http-status-codes";

// === Options =================================================================

export interface IUploadOptions {
  /** Cloudinary folder, e.g. "mission-bazar/products" */
  folder?: string;
  /** Public ID override (leave blank to let Cloudinary auto-generate) */
  publicId?: string;
  /** Transformation preset — e.g. "q_auto,f_auto" */
  transformation?: string;
}

// === Core upload (Buffer -> Cloudinary) ======================================

export const uploadToCloudinary = (
  buffer: Buffer,
  options: IUploadOptions = {}
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const { folder = "mission-bazar", publicId, transformation } = options;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        transformation: transformation
          ? [{ raw_transformation: transformation }]
          : [{ quality: "auto", fetch_format: "auto" }],
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(
            new AppError(
              StatusCodes.INTERNAL_SERVER_ERROR,
              `Cloudinary upload failed: ${error.message}`
            )
          );
        } else {
          resolve(result as UploadApiResponse);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// === Delete by public_id =====================================================

export const deleteFromCloudinary = async (
  publicId: string
): Promise<void> => {
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Cloudinary deletion failed for public_id: ${publicId}`
    );
  }
};

// === Convenience: extract public_id from a Cloudinary URL ===================

export const extractPublicId = (cloudinaryUrl: string): string => {
  // URL pattern: .../upload/v12345/folder/public_id.ext
  const parts = cloudinaryUrl.split("/upload/");
  if (parts.length < 2) return "";
  const withVersion = parts[1]; // e.g. "v1234/mission-bazar/avatar.jpg"
  const withoutVersion = withVersion.replace(/^v\d+\//, ""); // strip version
  const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, ""); // strip ext
  return withoutExtension;
};
