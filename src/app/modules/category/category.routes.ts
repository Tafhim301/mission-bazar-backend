import { Router } from "express";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { avatarUpload } from "../../middlewares/upload";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/", CategoryController.getAllCategories);
router.get("/admin/all", checkAuth(UserRole.ADMIN), CategoryController.getAllCategoriesAdmin);
router.get("/:id", CategoryController.getCategoryById);

router.post(
  "/",
  checkAuth(UserRole.ADMIN),
  avatarUpload.single("image"),
  validateRequest(CategoryValidation.createCategorySchema, { parseData: true }),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  avatarUpload.single("image"),
  validateRequest(CategoryValidation.updateCategorySchema, { parseData: true }),
  CategoryController.updateCategory
);

router.delete("/:id", checkAuth(UserRole.ADMIN), CategoryController.deleteCategory);

export const categoryRoutes = router;
