import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { CategoryType } from "./category.interface";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const imageUrl = req.file ? (req.file as { path: string }).path : undefined;
  const category = await CategoryService.createCategory(req.body, imageUrl);
  sendResponse(res, { statusCode: StatusCodes.CREATED, success: true, message: "Category created", data: category });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const { type, parent, isActive } = req.query as Record<string, string | undefined>;
  const categories = await CategoryService.getAllCategories({
    type:     type as CategoryType | undefined,
    parent:   parent,
    isActive: isActive !== undefined ? isActive === "true" : undefined,
  });
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Categories retrieved", data: categories });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.getCategoryById(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category retrieved", data: category });
});

const getCategoryTree = catchAsync(async (_req: Request, res: Response) => {
  const tree = await CategoryService.getCategoryTree();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category tree retrieved", data: tree });
});

const getLeafCategories = catchAsync(async (_req: Request, res: Response) => {
  const cats = await CategoryService.getLeafCategories();
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Leaf categories retrieved", data: cats });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const imageUrl = req.file ? (req.file as { path: string }).path : undefined;
  const category = await CategoryService.updateCategory(req.params.id, req.body, imageUrl);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category updated", data: category });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await CategoryService.deleteCategory(req.params.id);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "Category deleted", data: null });
});

export const CategoryController = {
  createCategory, getAllCategories, getCategoryById,
  getCategoryTree, getLeafCategories, updateCategory, deleteCategory,
};
