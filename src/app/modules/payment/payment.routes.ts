import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

// === SSLCommerz webhook/redirect routes (no auth — called by SSLCommerz) =====
router.post("/success",          PaymentController.successPayment);
router.post("/fail",             PaymentController.failPayment);
router.post("/cancel",           PaymentController.cancelPayment);
router.post("/validate-payment", PaymentController.validatePayment);

// === Authenticated routes ====================================================

// Retry payment for a pending/failed order
router.post("/init/:orderId", checkAuth(), PaymentController.initPayment);

// Get invoice PDF URL (user: own only; admin: any)
router.get("/invoice/:paymentId", checkAuth(), PaymentController.getInvoiceUrl);

// Get own payment history
router.get("/my-payments", checkAuth(), PaymentController.getMyPayments);

export const paymentRoutes = router;
