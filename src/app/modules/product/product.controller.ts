/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductService } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(
    req.user!.userId,
    req.body,
    (req.files as Express.Multer.File[]) ?? []
  );
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Product created", data: product });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { products, meta } = await ProductService.getAllProducts(req.query as Record<string, string>);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Products retrieved", data: products, meta });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.getProductById(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Product retrieved", data: product });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.getProductBySlug(req.params.slug);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Product retrieved", data: product });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.updateProduct(
    req.params.id,
    req.body,
    (req.files as Express.Multer.File[]) ?? []
  );
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Product updated", data: product });
});

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.updateProductStatus(req.params.id, req.body.status);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Product status updated", data: product });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await ProductService.deleteProduct(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Product deleted", data: null });
});

export const ProductController = {
  createProduct, getAllProducts, getProductById, getProductBySlug,
  updateProduct, updateProductStatus, deleteProduct,
};
