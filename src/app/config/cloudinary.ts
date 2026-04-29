import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import stream from "stream";
import { envVars } from "./env";
import AppError from "../errorHandlers/appError";
import { StatusCodes } from "http-status-codes";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

// === Upload buffer directly to Cloudinary ====================================

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder = "mission-bazar"
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const publicId = `${folder}/${fileName}-${Date.now()}`;

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: publicId,
            folder,
            transformation: [{ quality: "auto", fetch_format: "auto" }],
            overwrite: true,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Cloudinary upload failed: ${msg}`
    );
  }
};

// === Delete asset by Cloudinary URL ==========================================

export const deleteFromCloudinary = async (url: string): Promise<void> => {
  try {
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);
    if (match && match[1]) {
      await cloudinary.uploader.destroy(match[1]);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Cloudinary delete failed: ${msg}`
    );
  }
};

// === Export configured cloudinary instance (used by CloudinaryStorage) =======

export { cloudinary };
