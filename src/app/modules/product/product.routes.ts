import { Router } from "express";
import { ProductController } from "./product.controller";
import { ProductValidation } from "./product.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { productUpload } from "../../middlewares/upload";
import { UserRole } from "../user/user.interface";

const router = Router();

// === Public routes ===========================================================

/**
 * GET /api/v1/product
 * Browse active products with search, filter, sort, pagination.
 * Query params: searchTerm, category, brand, status, sort, page, limit, fields
 */
router.get("/", ProductController.getAllProducts);

/**
 * GET /api/v1/product/slug/:slug
 * Retrieve a single product by its URL slug.
 */
router.get("/slug/:slug", ProductController.getProductBySlug);

/**
 * GET /api/v1/product/:id
 * Retrieve a single product by MongoDB ObjectId.
 */
router.get("/:id", ProductController.getProductById);

// === Vendor / Admin routes ===================================================

/**
 * GET /api/v1/product/admin/all
 * Vendors see their own products; admins see all (incl. DRAFT/INACTIVE).
 */
router.get(
  "/admin/all",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  ProductController.getAllProductsAdmin
);

/**
 * POST /api/v1/product
 * Create a new product. Accepts up to 8 images (field: "images").
 * Body is multipart/form-data — non-file fields are plain form fields.
 */
router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  productUpload.array("images", 8),
  validateRequest(ProductValidation.createProductSchema, { parseData: true }),
  ProductController.createProduct
);

/**
 * PATCH /api/v1/product/:id
 * Update product details and/or images.
 * Pass "deleteImages" as a JSON array of URLs to remove existing images.
 */
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  productUpload.array("images", 8),
  validateRequest(ProductValidation.updateProductSchema, { parseData: true }),
  ProductController.updateProduct
);

/**
 * PATCH /api/v1/product/:id/status
 * Admin-only: set product status (ACTIVE | INACTIVE | DRAFT).
 */
router.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(ProductValidation.updateProductStatusSchema),
  ProductController.updateProductStatus
);

/**
 * DELETE /api/v1/product/:id
 * Soft-delete a product (vendor: own only; admin: any).
 */
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  ProductController.deleteProduct
);

export const productRoutes = router;
