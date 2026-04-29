import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Category } from "./category.model";
import { ICategoryDocument } from "./category.interface";

const createCategory = async (payload: {
  name: string;
  description?: string;
  image?: string;
}): Promise<ICategoryDocument> => {
  const existing = await Category.findOne({ name: { $regex: `^${payload.name}$`, $options: "i" } });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, `Category "${payload.name}" already exists`);
  }
  return Category.create(payload);
};

const getAllCategories = async (): Promise<ICategoryDocument[]> => {
  return Category.find({ isActive: true }).sort({ name: 1 });
};

const getAllCategoriesAdmin = async (): Promise<ICategoryDocument[]> => {
  return Category.find().sort({ name: 1 });
};

const getCategoryById = async (id: string): Promise<ICategoryDocument> => {
  const cat = await Category.findById(id);
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, `No category found with ID: ${id}`);
  return cat;
};

const getCategoryBySlug = async (slug: string): Promise<ICategoryDocument> => {
  const cat = await Category.findOne({ slug });
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, `No category found with slug: ${slug}`);
  return cat;
};

const updateCategory = async (
  id: string,
  payload: { name?: string; description?: string; isActive?: boolean; image?: string }
): Promise<ICategoryDocument> => {
  const cat = await Category.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, `No category found with ID: ${id}`);
  return cat;
};

const deleteCategory = async (id: string): Promise<void> => {
  const cat = await Category.findById(id);
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, `No category found with ID: ${id}`);
  await Category.findByIdAndDelete(id);
};

export const CategoryService = {
  createCategory, getAllCategories, getAllCategoriesAdmin,
  getCategoryById, getCategoryBySlug, updateCategory, deleteCategory,
};
