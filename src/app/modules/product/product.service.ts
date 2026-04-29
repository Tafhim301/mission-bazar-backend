import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Product } from "./product.model";
import { IProductDocument, ProductStatus } from "./product.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import { productSearchableFields } from "./product.constant";
import { deleteFromCloudinary } from "../../config/cloudinary";

// === Types ===================================================================

interface ICreateProductPayload {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  tags?: string[];
  specifications?: { key: string; value: string }[];
  status?: ProductStatus;
  images?: string[];
  imagePublicIds?: string[];
  vendor: string;
}

interface IUpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  category?: string;
  brand?: string;
  stock?: number;
  tags?: string[];
  specifications?: { key: string; value: string }[];
  deleteImages?: string[];
  newImages?: string[];
  newImagePublicIds?: string[];
}

// === Create Product ==========================================================

const createProduct = async (
  payload: ICreateProductPayload
): Promise<IProductDocument> => {
  const product = await Product.create(payload);
  return product;
};

// === Get All Products (public, with QueryBuilder) ============================

const getAllProducts = async (query: Record<string, string>) => {
  const productQuery = new QueryBuilder(
    Product.find({ status: ProductStatus.ACTIVE }).populate("vendor", "name phone"),
    query
  )
    .search(productSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const products = await productQuery.build();
  const meta = await productQuery.getMeta();
  return { products, meta };
};

// === Get All Products for Admin/Vendor =======================================

const getAllProductsAdmin = async (
  query: Record<string, string>,
  vendorId?: string
) => {
  const baseFilter = vendorId ? { vendor: vendorId } : {};
  const productQuery = new QueryBuilder(
    Product.find(baseFilter).populate("vendor", "name phone"),
    query
  )
    .search(productSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const products = await productQuery.build();
  const meta = await productQuery.getMeta();
  return { products, meta };
};

// === Get Single Product by ID ================================================

const getProductById = async (id: string): Promise<IProductDocument> => {
  const product = await Product.findById(id).populate("vendor", "name phone");
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, `No product found with ID: ${id}`);
  }
  return product;
};

// === Get Single Product by Slug ==============================================

const getProductBySlug = async (slug: string): Promise<IProductDocument> => {
  const product = await Product.findOne({ slug }).populate("vendor", "name phone");
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, `No product found with slug: ${slug}`);
  }
  return product;
};

// === Update Product ==========================================================

const updateProduct = async (
  productId: string,
  requesterId: string,
  requesterRole: string,
  payload: IUpdateProductPayload
): Promise<IProductDocument> => {
  const existing = await Product.findById(productId).select("+imagePublicIds");
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, `No product found with ID: ${productId}`);
  }

  // Vendors can only edit their own products; admins can edit any
  if (
    requesterRole === "VENDOR" &&
    String(existing.vendor) !== requesterId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only update your own products"
    );
  }

  // Merge incoming images with existing ones
  let updatedImages = [...existing.images];
  let updatedPublicIds = [...existing.imagePublicIds];

  if (payload.newImages?.length) {
    updatedImages = [...updatedImages, ...payload.newImages];
    updatedPublicIds = [
      ...updatedPublicIds,
      ...(payload.newImagePublicIds ?? []),
    ];
  }

  // Remove images flagged for deletion (match by URL)
  const toDelete = payload.deleteImages ?? [];
  if (toDelete.length) {
    const deleteSet = new Set(toDelete);
    const keep: string[] = [];
    const keepIds: string[] = [];
    const cloudinaryDeleteIds: string[] = [];

    updatedImages.forEach((url, i) => {
      if (deleteSet.has(url)) {
        if (updatedPublicIds[i]) cloudinaryDeleteIds.push(updatedPublicIds[i]);
      } else {
        keep.push(url);
        keepIds.push(updatedPublicIds[i] ?? "");
      }
    });

    updatedImages = keep;
    updatedPublicIds = keepIds;

    // Fire-and-forget Cloudinary cleanup
    if (cloudinaryDeleteIds.length) {
      Promise.all(cloudinaryDeleteIds.map((id) => deleteFromCloudinary(id))).catch(
        console.error
      );
    }
  }

  const { deleteImages, newImages, newImagePublicIds, ...rest } = payload;
  void deleteImages; void newImages; void newImagePublicIds;

  const updated = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        ...rest,
        images: updatedImages,
        imagePublicIds: updatedPublicIds,
      },
    },
    { new: true, runValidators: true }
  ).populate("vendor", "name phone");

  return updated as IProductDocument;
};

// === Update Product Status (Admin) ===========================================

const updateProductStatus = async (
  productId: string,
  status: ProductStatus
): Promise<IProductDocument> => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: { status } },
    { new: true }
  );
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, `No product found with ID: ${productId}`);
  }
  return product;
};

// === Soft Delete =============================================================

const deleteProduct = async (
  productId: string,
  requesterId: string,
  requesterRole: string
): Promise<void> => {
  const existing = await Product.findById(productId).select("+imagePublicIds");
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, `No product found with ID: ${productId}`);
  }
  if (
    requesterRole === "VENDOR" &&
    String(existing.vendor) !== requesterId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only delete your own products"
    );
  }
  await Product.findByIdAndUpdate(productId, { $set: { isDeleted: true } });
};

// === Exports =================================================================

export const ProductService = {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};
