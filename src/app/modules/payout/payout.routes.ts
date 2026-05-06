import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { PayoutController } from "./payout.controller";
import { UserRole } from "../user/user.interface";

const router = Router();

// ── Vendor routes ─────────────────────────────────────────────────────────────
router.get("/my", checkAuth(), PayoutController.getMyPayouts);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get(  "/", checkAuth(UserRole.ADMIN), PayoutController.getAllPayouts);
router.post( "/", checkAuth(UserRole.ADMIN), PayoutController.recordPayout);

export const payoutRoutes = router;
