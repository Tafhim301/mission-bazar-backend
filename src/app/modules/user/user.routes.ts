import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { avatarUpload } from "../../middlewares/upload";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { UserRole } from "./user.interface";

const router = Router();

// === Own profile =============================================================
router.get("/me",          checkAuth(), UserController.getMe);
router.patch("/me",        checkAuth(), validateRequest(UserValidation.updateProfileSchema), UserController.updateProfile);
router.patch("/me/avatar", checkAuth(), avatarUpload.single("avatar"), UserController.updateAvatar);

// === Address =================================================================
router.post("/me/address",              checkAuth(), validateRequest(UserValidation.addAddressSchema), UserController.addAddress);
router.delete("/me/address/:addressId", checkAuth(), UserController.removeAddress);

// === Cart ====================================================================
router.patch("/me/cart",  checkAuth(), validateRequest(UserValidation.updateCartSchema), UserController.updateCart);
router.delete("/me/cart", checkAuth(), UserController.clearCart);

// === Admin ===================================================================
router.get("/",       checkAuth(UserRole.ADMIN), UserController.getAllUsers);
router.get("/:id",    checkAuth(UserRole.ADMIN), UserController.getUserById);
router.patch("/:id/status", checkAuth(UserRole.ADMIN), validateRequest(UserValidation.updateUserStatusSchema), UserController.updateUserStatus);
router.delete("/:id", checkAuth(UserRole.ADMIN), UserController.deleteUser);

export const userRoutes = router;
