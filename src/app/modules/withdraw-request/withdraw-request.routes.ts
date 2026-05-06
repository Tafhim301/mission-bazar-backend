import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { WithdrawRequestController } from "./withdraw-request.controller";
import { UserRole } from "../user/user.interface";

const router = Router();

// ── Vendor routes ─────────────────────────────────────────────────────────────
router.post("/",    checkAuth(), WithdrawRequestController.createWithdrawRequest);
router.get( "/my",  checkAuth(), WithdrawRequestController.getMyWithdrawRequests);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get(   "/",              checkAuth(UserRole.ADMIN), WithdrawRequestController.getAllWithdrawRequests);
router.patch( "/:id/approve",  checkAuth(UserRole.ADMIN), WithdrawRequestController.approveWithdrawRequest);
router.patch( "/:id/reject",   checkAuth(UserRole.ADMIN), WithdrawRequestController.rejectWithdrawRequest);

export const withdrawRequestRoutes = router;
