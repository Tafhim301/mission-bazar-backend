/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Product } from "./product.model";
import { IProductDocument, DiscountType } from "./product.interface";
import { cloudinary } from "../../config/cloudinary";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Category } from "../category/category.model";
import { CategoryType } from "../category/category.interface";

// ── Category leaf guard ───────────────────────────────────────────────────────
export const assertProductCategory = async (categoryId: string) => {
  const cat = await Category.findById(categoryId);
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  if (cat.type !== CategoryType.SUB_SUB)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Products must be assigned a leaf (SUB_SUB) category — got "${cat.type}"`
    );
};

// ── Compute effective price ───────────────────────────────────────────────────
export const computeEffectivePrice = (product: IProductDocument, quantity: number): number => {
  const minQty = product.wholesaleMinQty ?? 12;
  const base = (quantity >= minQty && product.wholesalePrice != null)
    ? product.wholesalePrice
    : product.singleItemPrice;

  if (product.discount == null || !product.discountType) return base;
  if (product.discountType === DiscountType.PERCENTAGE) {
    return +(base * (1 - product.discount / 100)).toFixed(2);
  }
  return Math.max(0, base - product.discount);
};

const createProduct = async (
  vendorId: string,
  payload: Partial<IProductDocument>,
  imageFiles: Express.Multer.File[]
): Promise<IProductDocument> => {
  if (payload.category) await assertProductCategory(String(payload.category));
  const images         = imageFiles.map((f) => (f as any).path);
  const imagePublicIds = imageFiles.map((f) => (f as any).filename);
  return Product.create({ ...payload, vendor: vendorId, images, imagePublicIds });
};

/**
 * Resolve a category ID (MAIN, SUB, or SUB_SUB) to the list of SUB_SUB
 * (leaf) IDs that sit beneath it, so product queries always target leaf nodes.
 */
const resolveLeafCategoryIds = async (categoryId: string): Promise<string[]> => {
  const cat = await Category.findById(categoryId).lean();
  if (!cat) return [categoryId]; // unknown id — let the query fail naturally

  if (cat.type === CategoryType.SUB_SUB) {
    return [categoryId];
  }

  if (cat.type === CategoryType.SUB) {
    const leaves = await Category.find({ parent: cat._id, type: CategoryType.SUB_SUB }).select("_id").lean();
    return leaves.map((l) => String(l._id));
  }

  // MAIN → collect all SUB children first, then their SUB_SUB children
  const subs   = await Category.find({ parent: cat._id, type: CategoryType.SUB }).select("_id").lean();
  const subIds = subs.map((s) => s._id);
  const leaves = await Category.find({ parent: { $in: subIds }, type: CategoryType.SUB_SUB }).select("_id").lean();
  return leaves.map((l) => String(l._id));
};

const getAllProducts = async (query: Record<string, string>) => {
  // Peel off the category param and resolve it to leaf IDs so that clicking a
  // MAIN or SUB category on the frontend still returns matching products.
  const processedQuery = { ...query };
  const extraFilter: Record<string, unknown> = {};

  if (processedQuery.category) {
    const leafIds = await resolveLeafCategoryIds(processedQuery.category);
    if (leafIds.length > 0) {
      extraFilter.category = { $in: leafIds };
    }
    delete processedQuery.category; // prevent QueryBuilder from adding a second (exact-match) filter
  }

  const productQuery = new QueryBuilder(
    Product.find(extraFilter).populate("category", "name slug type"),
    processedQuery
  )
    .search(["name", "brand", "tags"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const products = await productQuery.build();
  const meta     = await productQuery.getMeta();
  return { products, meta };
};

const getProductById = async (id: string): Promise<IProductDocument> => {
  const product = await Product.findById(id)
    .populate("category", "name slug type")
    .populate("vendor", "name email");
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  return product;
};

const getProductBySlug = async (slug: string): Promise<IProductDocument> => {
  const product = await Product.findOne({ slug })
    .populate("category", "name slug type")
    .populate("vendor", "name");
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  return product;
};

const updateProduct = async (
  id: string,
  payload: Partial<IProductDocument>,
  imageFiles: Express.Multer.File[]
): Promise<IProductDocument> => {
  const product = await Product.findById(id).select("+imagePublicIds");
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");

  // deleteImages arrives from FormData as a JSON string — parse it properly
  const toDelete: string[] = (() => {
    const raw = (payload as any).deleteImages;
    if (!raw) return [];
    try { return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)); }
    catch { return []; }
  })();

  if (toDelete.length) {
    // Delete from Cloudinary by public_id directly (toDelete contains public_ids, not URLs)
    await Promise.all(toDelete.map((pid) => cloudinary.uploader.destroy(pid).catch(console.error)));
    // Use index-aligned mask so both arrays stay in sync after filtering
    const keepMask = product.imagePublicIds.map((pid) => !toDelete.includes(pid));
    product.images         = product.images.filter((_, i) => keepMask[i]);
    product.imagePublicIds = product.imagePublicIds.filter((_, i) => keepMask[i]);
  }

  if (imageFiles.length) {
    product.images.push(...imageFiles.map((f) => (f as any).path));
    product.imagePublicIds.push(...imageFiles.map((f) => (f as any).filename));
  }

  delete (payload as any).deleteImages;
  Object.assign(product, payload);
  await product.save();
  return product;
};

const updateProductStatus = async (id: string, status: string): Promise<IProductDocument> => {
  const product = await Product.findByIdAndUpdate(id, { status }, { new: true });
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  return product;
};

const deleteProduct = async (id: string): Promise<void> => {
  const product = await Product.findByIdAndUpdate(id, { isDeleted: true });
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
};

const getVendorProducts = async (vendorId: string, query: Record<string, string>) => {
  const processedQuery = { ...query };
  const baseFilter: Record<string, unknown> = { vendor: vendorId, status: "ACTIVE" };

  if (processedQuery.category) {
    const leafIds = await resolveLeafCategoryIds(processedQuery.category);
    if (leafIds.length > 0) baseFilter.category = { $in: leafIds };
    delete processedQuery.category;
  }

  const productQuery = new QueryBuilder(
    Product.find(baseFilter).populate("category", "name slug"),
    processedQuery
  )
    .search(["name", "brand", "tags"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const products = await productQuery.build();
  const meta     = await productQuery.getMeta();
  return { products, meta };
};

/**
 * Returns up to `limit` trending products (isTrending=true, ACTIVE).
 * If fewer than 5 are manually flagged, pads the result with top-sellers
 * so the section always has something to show.
 */
const getTrendingProducts = async (limit = 15): Promise<IProductDocument[]> => {
  const flagged = await Product.find({ isTrending: true, status: "ACTIVE" })
    .populate("category", "name slug type")
    .sort({ sold: -1, avgRating: -1 })
    .limit(limit)
    .lean();

  if (flagged.length >= 5) return flagged as unknown as IProductDocument[];

  // Fallback: pad with top-sellers not already in the flagged list
  const flaggedIds = flagged.map(p => String(p._id));
  const topSellers = await Product.find({
    status:  "ACTIVE",
    _id:     { $nin: flaggedIds },
  })
    .populate("category", "name slug type")
    .sort({ sold: -1, avgRating: -1 })
    .limit(limit - flagged.length)
    .lean();

  return [...flagged, ...topSellers] as unknown as IProductDocument[];
};

const toggleTrending = async (id: string): Promise<IProductDocument> => {
  const product = await Product.findById(id);
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
  product.isTrending = !product.isTrending;
  await product.save();
  return product;
};

const getDistinctBrands = async (): Promise<string[]> => {
  const brands = await Product.distinct("brand", { isDeleted: false, status: "ACTIVE", brand: { $exists: true, $ne: "" } });
  return (brands as string[]).filter(Boolean).sort();
};

export const ProductService = {
  createProduct, getAllProducts, getProductById, getProductBySlug,
  updateProduct, updateProductStatus, deleteProduct, getVendorProducts,
  computeEffectivePrice, getDistinctBrands, getTrendingProducts, toggleTrending,
};
