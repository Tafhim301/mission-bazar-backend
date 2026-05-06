import { model, Schema } from "mongoose";
import { DocumentStatus, DocumentType, IVendorDocumentDoc } from "./vendor-document.interface";

const vendorDocumentSchema = new Schema<IVendorDocumentDoc>(
  {
    vendor: {
      type:     Schema.Types.ObjectId,
      ref:      "Vendor",
      required: true,
      index:    true,
    },
    type: {
      type:     String,
      enum:     Object.values(DocumentType),
      required: true,
    },
    fileUrl:  { type: String, required: true },
    publicId: { type: String, required: true },
    status: {
      type:    String,
      enum:    Object.values(DocumentStatus),
      default: DocumentStatus.PENDING,
      index:   true,
    },
    rejectionReason: { type: String, trim: true },
    verifiedBy:      { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt:      { type: Date },
    metadata:        { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false }
);

// One document entry per vendor per type — re-upload replaces, not duplicates
vendorDocumentSchema.index({ vendor: 1, type: 1 }, { unique: true });

export const VendorDocument = model<IVendorDocumentDoc>("VendorDocument", vendorDocumentSchema);
