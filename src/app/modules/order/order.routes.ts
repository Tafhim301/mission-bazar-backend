import { Router } from "express";
import { OrderController } from "./order.controller";
import { OrderValidation } from "./order.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

// === User routes =============================================================

// POST /api/v1/order — place a new order (creates payment record & returns SSLCommerz URL)
router.post(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder
);

// GET /api/v1/order/my-orders — authenticated user's own orders
router.get("/my-orders", checkAuth(), OrderController.getMyOrders);

// PATCH /api/v1/order/:id/cancel — user cancels a PENDING order
router.patch("/:id/cancel", checkAuth(), OrderController.cancelOrder);

// GET /api/v1/order/:id — single order (user: own only; admin: any)
router.get("/:id", checkAuth(), OrderController.getOrderById);

// === Admin routes ============================================================

// GET /api/v1/order — all orders with filter/sort/paginate
router.get("/", checkAuth(UserRole.ADMIN), OrderController.getAllOrders);

// PATCH /api/v1/order/:id/status — update fulfilment status
router.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(OrderValidation.updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

export const orderRoutes = router;
