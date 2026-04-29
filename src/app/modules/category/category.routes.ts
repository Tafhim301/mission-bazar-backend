import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { avatarUpload } from "../../middlewares/upload";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/",     CategoryController.getAllCategories);
router.get("/tree", CategoryController.getCategoryTree);

router.post("/",    checkAuth(UserRole.ADMIN), avatarUpload.single("image"), validateRequest(CategoryValidation.createCategorySchema), CategoryController.createCategory);
router.patch("/:id", checkAuth(UserRole.ADMIN), avatarUpload.single("image"), validateRequest(CategoryValidation.updateCategorySchema), CategoryController.updateCategory);
router.delete("/:id", checkAuth(UserRole.ADMIN), CategoryController.deleteCategory);

export const categoryRoutes = router;
