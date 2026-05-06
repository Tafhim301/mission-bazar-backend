import { Document, Types } from "mongoose";

export enum DocumentType {
  NID_FRONT     = "NID_FRONT",      // individual — front of national ID
  NID_BACK      = "NID_BACK",       // individual — back of national ID
  TRADE_LICENSE = "TRADE_LICENSE",  // business   — trade licence
  BANK_PROOF    = "BANK_PROOF",     // both types — optional bank statement / cheque
  ADDRESS_PROOF = "ADDRESS_PROOF",  // both types — optional utility bill / address doc
}

export enum DocumentStatus {
  PENDING  = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/** Documents required per vendor type */
export const REQUIRED_DOCS: Record<string, DocumentType[]> = {
  INDIVIDUAL: [DocumentType.NID_FRONT, DocumentType.NID_BACK],
  BUSINESS:   [DocumentType.TRADE_LICENSE],
};

export interface IVendorDocument {
  vendor:           Types.ObjectId;   // ref: Vendor
  type:             DocumentType;
  fileUrl:          string;           // Cloudinary secure_url
  publicId:         string;           // Cloudinary public_id (for deletion)
  status:           DocumentStatus;
  rejectionReason?: string;
  verifiedBy?:      Types.ObjectId;   // admin who acted on it
  verifiedAt?:      Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?:        Record<string, any>;
}

export interface IVendorDocumentDoc extends IVendorDocument, Document {
  createdAt: Date;
  updatedAt: Date;
}
