import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHandlers/appError";
import { Category } from "./category.model";
import { CategoryType, ICategoryDocument } from "./category.interface";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Validate that a parent exists and its type is correct for the given child */
const assertValidParent = async (type: CategoryType, parentId?: string) => {
  if (type === CategoryType.MAIN) return; // MAIN needs no parent

  if (!parentId)
    throw new AppError(StatusCodes.BAD_REQUEST, `${type} category requires a parent`);

  const parent = await Category.findById(parentId);
  if (!parent) throw new AppError(StatusCodes.NOT_FOUND, "Parent category not found");

  const allowed: Record<string, CategoryType> = {
    [CategoryType.SUB]:     CategoryType.MAIN,
    [CategoryType.SUB_SUB]: CategoryType.SUB,
  };

  if (parent.type !== allowed[type])
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `A ${type} category's parent must be ${allowed[type]} (got ${parent.type})`
    );
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

const createCategory = async (
  payload: Partial<ICategoryDocument>,
  imageUrl?: string
): Promise<ICategoryDocument> => {
  await assertValidParent(payload.type as CategoryType, payload.parent?.toString());

  const exists = await Category.findOne({
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    parent: payload.parent ?? null,
  });
  if (exists)
    throw new AppError(StatusCodes.CONFLICT, "A category with this name already exists at this level");

  return Category.create({ ...payload, ...(imageUrl ? { image: imageUrl } : {}) });
};

const getAllCategories = async (filters: {
  type?: CategoryType;
  parent?: string;
  isActive?: boolean;
}) => {
  const query: Record<string, unknown> = {};
  if (filters.type)   query.type     = filters.type;
  if (filters.parent) query.parent   = filters.parent;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  return Category.find(query)
    .populate("parent", "name slug type")
    .sort({ order: 1, name: 1 });
};

const getCategoryById = async (id: string): Promise<ICategoryDocument> => {
  const cat = await Category.findById(id).populate("parent", "name slug type");
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  return cat;
};

/**
 * Returns the full 3-level tree:
 * MAIN → SUB[] → SUB_SUB[]
 */
const getCategoryTree = async () => {
  const all = await Category.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();

  const mains = all.filter((c) => c.type === CategoryType.MAIN);

  return mains.map((main) => {
    const subs = all.filter((s) => String(s.parent) === String(main._id));
    return {
      ...main,
      children: subs.map((sub) => ({
        ...sub,
        children: all.filter((ss) => String(ss.parent) === String(sub._id)),
      })),
    };
  });
};

/** Flat list of all SUB_SUB categories (leaf nodes that products attach to) */
const getLeafCategories = async () =>
  Category.find({ type: CategoryType.SUB_SUB, isActive: true })
    .populate({ path: "parent", select: "name slug type", populate: { path: "parent", select: "name slug type" } })
    .sort({ order: 1, name: 1 });

const updateCategory = async (
  id: string,
  payload: Partial<ICategoryDocument>,
  imageUrl?: string
): Promise<ICategoryDocument> => {
  if (payload.type || payload.parent) {
    const existing = await Category.findById(id);
    if (!existing) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    const newType   = (payload.type   ?? existing.type)   as CategoryType;
    const newParent = payload.parent?.toString() ?? existing.parent?.toString();
    await assertValidParent(newType, newParent);
  }

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
  if (hasChildren)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Cannot delete a category that has sub-categories. Delete or re-parent children first."
    );
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryTree,
  getLeafCategories,
  updateCategory,
  deleteCategory,
};
