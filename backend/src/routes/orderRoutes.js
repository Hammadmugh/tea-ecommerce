import express from "express";
import * as orderController from "../controllers/orderController.js";
import { verifyToken, checkUserBlocked } from "../middlewares/authMiddleware.js";
import { isAdmin, checkOwnership } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// User routes - place order and view own orders
router.post("/place", verifyToken, checkUserBlocked, orderController.placeOrder);
router.get("/my-orders", verifyToken, checkUserBlocked, orderController.getMyOrders);
router.get("/user/:userId", verifyToken, checkUserBlocked, checkOwnership, orderController.getUserOrders);
router.get("/:orderId", verifyToken, checkUserBlocked, orderController.getOrderById);

// Admin/Superadmin routes - manage all orders
router.get("/", verifyToken, checkUserBlocked, isAdmin, orderController.getAllOrders);
router.put("/:orderId/status", verifyToken, checkUserBlocked, isAdmin, orderController.updateOrderStatus);
router.put("/:orderId/payment-status", verifyToken, checkUserBlocked, isAdmin, orderController.updatePaymentStatus);

export default router;
