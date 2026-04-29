import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductService } from "./product.service";
import { ProductStatus } from "./product.interface";

// === POST /product ============================================================

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const images = files?.map((f) => f.path) ?? [];          // Cloudinary secure_url
  const imagePublicIds = files?.map((f) => f.filename) ?? []; // Cloudinary public_id

  const product = await ProductService.createProduct({
    ...req.body,
    images,
    imagePublicIds,
    vendor: req.user!.userId,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// === GET /product (public) ===================================================

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { products, meta } = await ProductService.getAllProducts(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully",
    data: products,
    meta,
  });
});

// === GET /product/admin (admin/vendor) =======================================

const getAllProductsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { role, userId } = req.user!;
  // Vendors see only their own; admins see all
  const vendorId = role === "VENDOR" ? userId : undefined;

  const { products, meta } = await ProductService.getAllProductsAdmin(
    req.query as Record<string, string>,
    vendorId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully",
    data: products,
    meta,
  });
});

// === GET /product/slug/:slug ==================================================

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.getProductBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product retrieved successfully",
    data: product,
  });
});

// === GET /product/:id =========================================================

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.getProductById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product retrieved successfully",
    data: product,
  });
});

// === PATCH /product/:id =======================================================

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const newImages = files?.map((f) => f.path) ?? [];
  const newImagePublicIds = files?.map((f) => f.filename) ?? [];

  const product = await ProductService.updateProduct(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    { ...req.body, newImages, newImagePublicIds }
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// === PATCH /product/:id/status ================================================

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body as { status: ProductStatus };
  const product = await ProductService.updateProductStatus(req.params.id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Product status updated to ${status}`,
    data: product,
  });
});

// === DELETE /product/:id ======================================================

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await ProductService.deleteProduct(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product deleted successfully",
    data: null,
  });
});

// === Exports =================================================================

export const ProductController = {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductBySlug,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};
