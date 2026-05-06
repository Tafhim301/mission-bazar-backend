import { StatusCodes } from "http-status-codes";
import { cloudinary } from "../../config/cloudinary";
import AppError from "../../errorHandlers/appError";
import { VendorDocument } from "./vendor-document.model";
import { Vendor } from "../vendor/vendor.model";
import { User } from "../user/user.model";
import { DocumentStatus, DocumentType, REQUIRED_DOCS } from "./vendor-document.interface";
import { VendorStatus } from "../vendor/vendor.interface";
import { UserRole } from "../user/user.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

// ── Vendor: upload / replace a document ──────────────────────────────────────

/**
 * Upserts a VendorDocument (unique on vendor + type).
 * If a previous version exists its Cloudinary file is deleted first.
 */
const uploadDocument = async (
  userId: string,
  type: DocumentType,
  fileUrl: string,
  publicId: string
) => {
  // Resolve vendor from user
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Vendor profile not found. Please create a vendor profile before uploading documents."
    );
  }

  // Cannot re-upload while under review (unless it was already rejected)
  const existing = await VendorDocument.findOne({ vendor: vendor._id, type });

  if (existing) {
    // If APPROVED, lock it — no need to re-upload
    if (existing.status === DocumentStatus.APPROVED) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Document "${type}" is already approved and cannot be replaced.`
      );
    }

    // Delete old Cloudinary asset before replacing
    try {
      await cloudinary.uploader.destroy(existing.publicId);
    } catch {
      // Non-fatal — log but continue
      // eslint-disable-next-line no-console
      console.warn(`[VendorDoc] Could not delete old Cloudinary asset: ${existing.publicId}`);
    }

    // Replace with new file — reset to PENDING for re-review
    return VendorDocument.findByIdAndUpdate(
      existing._id,
      {
        fileUrl,
        publicId,
        status:          DocumentStatus.PENDING,
        rejectionReason: undefined,
        verifiedBy:      undefined,
        verifiedAt:      undefined,
      },
      { new: true }
    );
  }

  // First upload — create new
  return VendorDocument.create({ vendor: vendor._id, type, fileUrl, publicId });
};

// ── Vendor: view their own documents (fileUrl omitted for non-sensitive display) ──

const getMyDocuments = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor profile not found");

  return VendorDocument.find({ vendor: vendor._id }).select("-publicId");
};

// ── Admin: all documents (with optional filters) ──────────────────────────────

const getAllDocuments = async (query: Record<string, string>) => {
  const q = new QueryBuilder(
    VendorDocument.find()
      .populate({ path: "vendor", select: "shopName type status", populate: { path: "user", select: "name email" } }),
    query
  ).filter().sort().paginate();

  const docs = await q.build();
  const meta = await q.getMeta();
  return { docs, meta };
};

// ── Admin: approve a document ─────────────────────────────────────────────────

const approveDocument = async (docId: string, adminId: string) => {
  const doc = await VendorDocument.findById(docId).populate<{ vendor: { _id: unknown; type: string; user: unknown; status: string } }>("vendor");
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, "Document not found");

  if (doc.status === DocumentStatus.APPROVED) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Document is already approved");
  }

  const updated = await VendorDocument.findByIdAndUpdate(
    docId,
    {
      status:     DocumentStatus.APPROVED,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      rejectionReason: undefined,
    },
    { new: true }
  );

  // ── Auto-activation check ────────────────────────────────────────────────
  // If all required docs for this vendor are now APPROVED → activate vendor
  const vendor = doc.vendor as { _id: unknown; type: string; user: unknown; status: string };

  if (vendor.status !== VendorStatus.ACTIVE) {
    const requiredTypes = REQUIRED_DOCS[vendor.type] ?? [];

    const approvedDocs = await VendorDocument.find({
      vendor: vendor._id,
      status: DocumentStatus.APPROVED,
    });

    const approvedTypes = approvedDocs.map((d) => d.type);
    const allApproved   = requiredTypes.every((t) => approvedTypes.includes(t));

    if (allApproved) {
      await Vendor.findByIdAndUpdate(
        vendor._id,
        { status: VendorStatus.ACTIVE, reviewedBy: adminId, reviewedAt: new Date() }
      );
      // Promote the linked User to VENDOR role
      await User.findByIdAndUpdate(vendor.user, { role: UserRole.VENDOR });
    }
  }

  return updated;
};

// ── Admin: reject a document ──────────────────────────────────────────────────

const rejectDocument = async (
  docId: string,
  adminId: string,
  rejectionReason: string
) => {
  const doc = await VendorDocument.findById(docId);
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, "Document not found");

  if (doc.status === DocumentStatus.REJECTED) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Document is already rejected");
  }

  return VendorDocument.findByIdAndUpdate(
    docId,
    {
      status: DocumentStatus.REJECTED,
      rejectionReason,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    },
    { new: true }
  );
};

// ── Export ────────────────────────────────────────────────────────────────────
export const VendorDocumentService = {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  approveDocument,
  rejectDocument,
};
