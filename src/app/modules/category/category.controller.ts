import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { avatarUpload } from "../../middlewares/upload";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const image = (req.file as Express.Multer.File | undefined)?.path;
  const cat = await CategoryService.createCategory({ ...req.body, image });
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Category created successfully", data: cat });
});

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const cats = await CategoryService.getAllCategories();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Categories retrieved successfully", data: cats });
});

const getAllCategoriesAdmin = catchAsync(async (_req: Request, res: Response) => {
  const cats = await CategoryService.getAllCategoriesAdmin();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Categories retrieved successfully", data: cats });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const cat = await CategoryService.getCategoryById(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category retrieved successfully", data: cat });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const image = (req.file as Express.Multer.File | undefined)?.path;
  const cat = await CategoryService.updateCategory(req.params.id, { ...req.body, ...(image ? { image } : {}) });
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category updated successfully", data: cat });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await CategoryService.deleteCategory(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category deleted successfully", data: null });
});

export const CategoryController = {
  createCategory, getAllCategories, getAllCategoriesAdmin,
  getCategoryById, updateCategory, deleteCategory,
};
