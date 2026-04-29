import { Router } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "./user.interface";

const router = Router();

// === My Profile routes (any authenticated user) ==============================

router.get("/me", checkAuth(), UserController.getMe);

router.patch(
  "/me",
  checkAuth(),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateMe
);

// === Admin routes ============================================================

router.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);

router.get("/:id", checkAuth(UserRole.ADMIN), UserController.getUserById);

router.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserStatusSchema),
  UserController.updateUserStatus
);

router.delete("/:id", checkAuth(UserRole.ADMIN), UserController.deleteUser);

export const userRoutes = router;
