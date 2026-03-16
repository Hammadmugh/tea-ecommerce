import express from "express";
import * as cartController from "../controllers/cartController.js";
import { verifyToken, checkUserBlocked } from "../middlewares/authMiddleware.js";
import { isUser } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All cart routes are protected
router.get("/", verifyToken, checkUserBlocked, isUser, cartController.getCart);
router.post("/add", verifyToken, checkUserBlocked, isUser, cartController.addToCart);
router.put("/update-quantity", verifyToken, checkUserBlocked, isUser, cartController.updateCartQuantity);
router.delete("/remove/:productId/:variantId", verifyToken, checkUserBlocked, isUser, cartController.removeFromCart);
router.delete("/clear", verifyToken, checkUserBlocked, isUser, cartController.clearCart);

export default router;
