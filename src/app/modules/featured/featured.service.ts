import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Featured } from "./featured.model";
import { FeaturedType, IFeaturedDocument } from "./featured.interface";
import { Product } from "../product/product.model";

const PRODUCT_POPULATE = {
  path: "product",
  select: "name slug images singleItemPrice wholesalePrice wholesaleMinQty discount discountType stock avgRating status",
  populate: { path: "category", select: "name slug" },
};

// ── GET LIST ─────────────────────────────────────────────────────────────────
const getByType = async (type: FeaturedType) => {
  return Featured.find({ type, isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate(PRODUCT_POPULATE)
    .lean();
};

const getAll = async () => {
  return Featured.find()
    .sort({ type: 1, order: 1 })
    .populate(PRODUCT_POPULATE)
    .lean();
};

// ── ADD ───────────────────────────────────────────────────────────────────────
const addFeatured = async (payload: Partial<IFeaturedDocument>) => {
  const exists = await Product.findById(payload.product);
  if (!exists) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");

  const duplicate = await Featured.findOne({ product: payload.product, type: payload.type });
  if (duplicate) throw new AppError(StatusCodes.CONFLICT, "Product already in this featured list");

  return Featured.create(payload);
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
const updateFeatured = async (id: string, payload: Partial<IFeaturedDocument>) => {
  const doc = await Featured.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .populate(PRODUCT_POPULATE);
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, "Featured entry not found");
  return doc;
};

// ── REMOVE ───────────────────────────────────────────────────────────────────
const removeFeatured = async (id: string) => {
  const doc = await Featured.findByIdAndDelete(id);
  if (!doc) throw new AppError(StatusCodes.NOT_FOUND, "Featured entry not found");
};

export const FeaturedService = { getByType, getAll, addFeatured, updateFeatured, removeFeatured };
