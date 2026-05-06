import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { VendorEarningController } from "./vendor-earning.controller";
import { UserRole } from "../user/user.interface";

const router = Router();

// ── Vendor routes (any authenticated user who is a vendor) ────────────────────
router.get("/my",        checkAuth(), VendorEarningController.getMyEarnings);
router.get("/my/wallet", checkAuth(), VendorEarningController.getMyWallet);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get(  "/",        checkAuth(UserRole.ADMIN), VendorEarningController.getAllEarnings);
router.post( "/release", checkAuth(UserRole.ADMIN), VendorEarningController.releaseEarnings);

export const vendorEarningRoutes = router;
