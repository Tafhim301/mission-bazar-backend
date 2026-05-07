import { Router } from "express";
import { checkAuth }           from "../../middlewares/checkAuth";
import { validateRequest }     from "../../middlewares/validateRequest";
import { VendorController }    from "./vendor.controller";
import { VendorValidation }    from "./vendor.validation";
import { UserRole }            from "../user/user.interface";
import { vendorShopUpload }    from "../../middlewares/upload";

const router = Router();

// ── Public routes (no auth) ────────────────────────────────────────────────────
// Must come BEFORE any /:param routes to avoid route collisions
router.get("/active",           VendorController.getActiveVendors);
router.get("/public/:userId",   VendorController.getPublicVendorProfile);

// ── Authenticated vendor (any logged-in user can apply) ───────────────────────
router.post(
  "/apply",
  checkAuth(),
  validateRequest(VendorValidation.applyAsVendorSchema),
  VendorController.applyAsVendor
);

router.get("/me",  checkAuth(), VendorController.getMyVendorProfile);

// PATCH /me — supports JSON body (DRAFT/REJECTED) + optional multipart (images for ACTIVE)
router.patch(
  "/me",
  checkAuth(),
  vendorShopUpload.fields([
    { name: "shopBanner", maxCount: 1 },
    { name: "shopImage",  maxCount: 1 },
  ]),
  VendorController.updateMyProfile
);

router.post("/submit", checkAuth(), VendorController.submitForReview);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/",    checkAuth(UserRole.ADMIN), VendorController.getAllVendors);
router.get("/:id", checkAuth(UserRole.ADMIN), VendorController.getVendorById);
router.patch("/:id/activate", checkAuth(UserRole.ADMIN), VendorController.activateVendor);
router.patch(
  "/:id/reject",
  checkAuth(UserRole.ADMIN),
  validateRequest(VendorValidation.rejectVendorSchema),
  VendorController.rejectVendor
);

export const vendorRoutes = router;
