import { Router } from "express";
import { z } from "zod";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { productUpload } from "../../middlewares/upload";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/product/:productId", ReviewController.getProductReviews);

router.post("/",       checkAuth(), productUpload.array("images", 4), validateRequest(ReviewValidation.createReviewSchema, { parseData: true }), ReviewController.createReview);
router.patch("/:id",   checkAuth(), validateRequest(ReviewValidation.updateReviewSchema), ReviewController.updateReview);
router.patch("/:id/reply", checkAuth(UserRole.ADMIN, UserRole.AGENT), validateRequest(z.object({ comment: z.string().trim().min(1) })), ReviewController.replyToReview);
router.delete("/:id",  checkAuth(), ReviewController.deleteReview);

export const reviewRoutes = router;
