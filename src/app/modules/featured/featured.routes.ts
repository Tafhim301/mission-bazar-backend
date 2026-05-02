import { Router } from "express";
import { FeaturedController } from "./featured.controller";
import { FeaturedValidation } from "./featured.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

// === Public ==================================================================
router.get("/flash-sale", FeaturedController.getFlashSale);
router.get("/trending",   FeaturedController.getTrending);

// === Admin only ==============================================================
router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  FeaturedController.getAll
);

router.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(FeaturedValidation.addFeaturedSchema),
  FeaturedController.addFeatured
);

router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(FeaturedValidation.updateFeaturedSchema),
  FeaturedController.updateFeatured
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  FeaturedController.removeFeatured
);

export const featuredRoutes = router;
