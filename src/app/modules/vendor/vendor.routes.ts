import { Router } from "express";
import { checkAuth }        from "../../middlewares/checkAuth";
import { validateRequest }  from "../../middlewares/validateRequest";
import { VendorController } from "./vendor.controller";
import { VendorValidation } from "./vendor.validation";
import { UserRole }         from "../user/user.interface";

const router = Router();

// ── Authenticated vendor (any logged-in user can apply) ───────────────────────
router.post(
  "/apply",
  checkAuth(),
  validateRequest(VendorValidation.applyAsVendorSchema),
  VendorController.applyAsVendor
);

router.get(  "/me",     checkAuth(), VendorController.getMyVendorProfile);
router.patch("/me",     checkAuth(), validateRequest(VendorValidation.updateVendorProfileSchema), VendorController.updateMyProfile);
router.post( "/submit", checkAuth(), VendorController.submitForReview);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/"  ,                checkAuth(UserRole.ADMIN), VendorController.getAllVendors);
router.get("/:id",               checkAuth(UserRole.ADMIN), VendorController.getVendorById);
router.patch("/:id/activate",    checkAuth(UserRole.ADMIN), VendorController.activateVendor);
router.patch(
  "/:id/reject",
  checkAuth(UserRole.ADMIN),
  validateRequest(VendorValidation.rejectVendorSchema),
  VendorController.rejectVendor
);

export const vendorRoutes = router;
