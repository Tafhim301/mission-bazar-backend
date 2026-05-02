/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Product } from "./product.model";
import { IProductDocument, DiscountType } from "./product.interface";
import { deleteFromCloudinary } from "../../config/cloudinary";
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

const getAllProducts = async (query: Record<string, string>) => {
  const productQuery = new QueryBuilder(
    Product.find().populate("category", "name slug type"),
    query
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

  const toDelete: string[] = (payload.deleteImages as unknown as string[]) ?? [];
  if (toDelete.length) {
    await Promise.all(toDelete.map((url) => deleteFromCloudinary(url).catch(console.error)));
    product.images         = product.images.filter((u) => !toDelete.includes(u));
    product.imagePublicIds = product.imagePublicIds.filter(
      (_, i) => !toDelete.includes(product.images[i])
    );
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
  const productQuery = new QueryBuilder(
    Product.find({ vendor: vendorId, status: "ACTIVE" }).populate("category", "name slug"),
    query
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

export const ProductService = {
  createProduct, getAllProducts, getProductById, getProductBySlug,
  updateProduct, updateProductStatus, deleteProduct, getVendorProducts,
  computeEffectivePrice,
};
