import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

// POST /api/v1/auth/register
router.post(
  "/register",
  validateRequest(AuthValidation.registerSchema),
  AuthController.register
);

// POST /api/v1/auth/login
router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.login
);

// POST /api/v1/auth/refresh-token
router.post("/refresh-token", AuthController.refreshToken);

// POST /api/v1/auth/logout
router.post("/logout", checkAuth(), AuthController.logout);

// PATCH /api/v1/auth/change-password
router.patch(
  "/change-password",
  checkAuth(),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthController.changePassword
);

export const authRoutes = router;
