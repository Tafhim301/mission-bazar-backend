import { Router } from "express";
import { ProductController } from "./product.controller";
import { ProductValidation } from "./product.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { productUpload } from "../../middlewares/upload";
import { UserRole } from "../user/user.interface";

const router = Router();

// === Public ==================================================================
router.get("/",                 ProductController.getAllProducts);
router.get("/brands",           ProductController.getBrands);          // must be before /:id
router.get("/trending",         ProductController.getTrendingProducts); // must be before /:id
router.get("/vendor/:vendorId", ProductController.getVendorProducts);
router.get("/slug/:slug",       ProductController.getProductBySlug);
router.get("/:id",              ProductController.getProductById);

// === Admin / Vendor ===========================================================
router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  productUpload.array("images", 8),
  validateRequest(ProductValidation.createProductSchema, { parseData: true }),
  ProductController.createProduct
);

router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  productUpload.array("images", 8),
  validateRequest(ProductValidation.updateProductSchema, { parseData: true }),
  ProductController.updateProduct
);

router.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(ProductValidation.updateProductStatusSchema),
  ProductController.updateProductStatus
);

router.patch(
  "/:id/trending",
  checkAuth(UserRole.ADMIN),
  ProductController.toggleTrending
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  ProductController.deleteProduct
);

export const productRoutes = router;
