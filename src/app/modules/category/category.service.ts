import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Category } from "./category.model";
import { CategoryType, ICategoryDocument } from "./category.interface";

const createCategory = async (payload: Partial<ICategoryDocument>, imageUrl?: string): Promise<ICategoryDocument> => {
  const exists = await Category.findOne({
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    parent: payload.parent ?? null,
  });
  if (exists) throw new AppError(StatusCodes.CONFLICT, "A category with this name already exists at this level");

  return Category.create({ ...payload, ...(imageUrl ? { image: imageUrl } : {}) });
};

const getAllCategories = async (type?: CategoryType) => {
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  return Category.find(filter).populate("parent", "name slug type").sort({ name: 1 });
};

// Returns full tree: MAIN → SUB[] → PRODUCT[]
const getCategoryTree = async () => {
  const all = await Category.find({ isActive: true }).lean();
  const mains = all.filter((c) => c.type === CategoryType.MAIN);
  return mains.map((main) => ({
    ...main,
    children: all
      .filter((s) => String(s.parent) === String(main._id))
      .map((sub) => ({
        ...sub,
        children: all.filter((p) => String(p.parent) === String(sub._id)),
      })),
  }));
};

const updateCategory = async (id: string, payload: Partial<ICategoryDocument>, imageUrl?: string): Promise<ICategoryDocument> => {
  const category = await Category.findByIdAndUpdate(
    id,
    { ...payload, ...(imageUrl ? { image: imageUrl } : {}) },
    { new: true, runValidators: true }
  );
  if (!category) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  return category;
};

const deleteCategory = async (id: string): Promise<void> => {
  const hasChildren = await Category.exists({ parent: id });
  if (hasChildren) throw new AppError(StatusCodes.BAD_REQUEST, "Cannot delete a category that has sub-categories");
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
};

export const CategoryService = { createCategory, getAllCategories, getCategoryTree, updateCategory, deleteCategory };
