import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/register",       validateRequest(AuthValidation.registerSchema),       AuthController.register);
router.post("/verify-email",   validateRequest(AuthValidation.verifyEmailSchema),    AuthController.verifyEmail);
router.post("/login",          validateRequest(AuthValidation.loginSchema),           AuthController.login);
router.post("/refresh-token",  AuthController.refreshToken);
router.post("/logout",         checkAuth(), AuthController.logout);
router.post("/forgot-password",validateRequest(AuthValidation.forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validateRequest(AuthValidation.resetPasswordSchema),  AuthController.resetPassword);
router.patch("/change-password", checkAuth(), validateRequest(AuthValidation.changePasswordSchema), AuthController.changePassword);

export const authRoutes = router;
