import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { avatarUpload } from "../../middlewares/upload";
import { CarouselController } from "./carousel.controller";
import { CarouselValidation } from "./carousel.validation";
import { UserRole } from "../user/user.interface";

const router = Router();

// Public
router.get("/", CarouselController.getActiveCarousels);

// Admin
router.get("/all",    checkAuth(UserRole.ADMIN), CarouselController.getAllCarousels);
router.post("/",      checkAuth(UserRole.ADMIN), avatarUpload.single("image"), validateRequest(CarouselValidation.createCarouselSchema, { parseData: true }), CarouselController.createCarousel);
router.patch("/:id",  checkAuth(UserRole.ADMIN), avatarUpload.single("image"), validateRequest(CarouselValidation.updateCarouselSchema, { parseData: true }), CarouselController.updateCarousel);
router.delete("/:id", checkAuth(UserRole.ADMIN), CarouselController.deleteCarousel);

export const carouselRoutes = router;
