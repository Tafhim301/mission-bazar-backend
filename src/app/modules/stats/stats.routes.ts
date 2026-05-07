import { Router } from "express";
import { StatsController } from "./stats.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/admin", checkAuth(UserRole.ADMIN), StatsController.getAdminStats);
router.get("/vendor", checkAuth(UserRole.VENDOR), StatsController.getVendorStats);

export const statsRoutes = router;
