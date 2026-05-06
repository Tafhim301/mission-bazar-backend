import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Vendor } from "./vendor.model";
import { VendorDocument } from "../vendor-document/vendor-document.model";
import { IVendor, VendorStatus } from "./vendor.interface";
import { DocumentStatus, REQUIRED_DOCS } from "../vendor-document/vendor-document.interface";
import { User } from "../user/user.model";
import { UserRole } from "../user/user.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

// ── Apply: create initial vendor profile ──────────────────────────────────────

const applyAsVendor = async (userId: string, payload: Partial<IVendor>) => {
  // One profile per user
  const existing = await Vendor.findOne({ user: userId });
  if (existing) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "You already have a vendor profile. Update it instead of applying again."
    );
  }

  return Vendor.create({ user: userId, ...payload });
};

// ── Update vendor's own profile (only when DRAFT or REJECTED) ─────────────────

const updateMyProfile = async (userId: string, payload: Partial<IVendor>) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor profile not found");

  if (![VendorStatus.DRAFT, VendorStatus.REJECTED].includes(vendor.status)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Profile cannot be edited while it is ${vendor.status}. Contact support if needed.`
    );
  }

  return Vendor.findByIdAndUpdate(vendor._id, payload, { new: true, runValidators: true });
};

// ── Submit for review ─────────────────────────────────────────────────────────

const submitForReview = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor profile not found");

  if (vendor.status === VendorStatus.REVIEW) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Your application is already under review");
  }
  if (vendor.status === VendorStatus.ACTIVE) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Your vendor account is already active");
  }

  // Validate that all required documents have been uploaded (PENDING or APPROVED)
  const requiredTypes = REQUIRED_DOCS[vendor.type] ?? [];
  const uploadedDocs  = await VendorDocument.find({ vendor: vendor._id });
  const uploadedTypes = uploadedDocs.map((d) => d.type);

  const missing = requiredTypes.filter((t) => !uploadedTypes.includes(t));
  if (missing.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Missing required documents: ${missing.join(", ")}. Please upload them before submitting.`
    );
  }

  // Reset any previously rejected docs back to PENDING so admin re-reviews them
  await VendorDocument.updateMany(
    { vendor: vendor._id, status: DocumentStatus.REJECTED },
    { status: DocumentStatus.PENDING, rejectionReason: undefined, verifiedBy: undefined, verifiedAt: undefined }
  );

  return Vendor.findByIdAndUpdate(vendor._id, { status: VendorStatus.REVIEW }, { new: true });
};

// ── Vendor: get own profile ───────────────────────────────────────────────────

const getMyVendorProfile = async (userId: string) => {
  const vendor = await Vendor.findOne({ user: userId }).populate("user", "name email phone");
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor profile not found");
  return vendor;
};

// ── Admin: get all vendors ────────────────────────────────────────────────────

const getAllVendors = async (query: Record<string, string>) => {
  const q = new QueryBuilder(
    Vendor.find().populate("user", "name email phone profileImage"),
    query
  ).filter().sort().paginate();

  const vendors = await q.build();
  const meta    = await q.getMeta();
  return { vendors, meta };
};

// ── Admin: get single vendor with full document list ─────────────────────────

const getVendorById = async (vendorId: string) => {
  const vendor = await Vendor.findById(vendorId)
    .populate("user",       "name email phone profileImage")
    .populate("reviewedBy", "name email");
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor not found");

  const documents = await VendorDocument.find({ vendor: vendorId })
    .populate("verifiedBy", "name email");

  return { vendor, documents };
};

// ── Admin: activate vendor manually ──────────────────────────────────────────

const activateVendor = async (vendorId: string, adminId: string) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor not found");

  if (vendor.status === VendorStatus.ACTIVE) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Vendor is already active");
  }

  // Update vendor status
  const updated = await Vendor.findByIdAndUpdate(
    vendorId,
    { status: VendorStatus.ACTIVE, reviewedBy: adminId, reviewedAt: new Date() },
    { new: true }
  );

  // Elevate user role to VENDOR
  await User.findByIdAndUpdate(vendor.user, { role: UserRole.VENDOR });

  return updated;
};

// ── Admin: reject vendor application ─────────────────────────────────────────

const rejectVendor = async (vendorId: string, adminId: string, rejectionNote: string) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError(StatusCodes.NOT_FOUND, "Vendor not found");

  if (vendor.status === VendorStatus.ACTIVE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Cannot reject an already active vendor. Use suspend/deactivate instead."
    );
  }

  return Vendor.findByIdAndUpdate(
    vendorId,
    { status: VendorStatus.REJECTED, rejectionNote, reviewedBy: adminId, reviewedAt: new Date() },
    { new: true }
  );
};

// ── Export ────────────────────────────────────────────────────────────────────
export const VendorService = {
  applyAsVendor,
  updateMyProfile,
  submitForReview,
  getMyVendorProfile,
  getAllVendors,
  getVendorById,
  activateVendor,
  rejectVendor,
};
