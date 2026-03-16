import express from "express";
import * as productController from "../controllers/productController.js";
import { verifyToken, checkUserBlocked } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes - GET only
router.get("/", productController.getProducts);
router.get("/:productId", productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);

// Protected routes - POST/PUT/DELETE (Admin/Superadmin only)
router.post("/", verifyToken, checkUserBlocked, isAdmin, productController.createProduct);
router.put("/:productId", verifyToken, checkUserBlocked, isAdmin, productController.updateProduct);
router.delete("/:productId", verifyToken, checkUserBlocked, isAdmin, productController.deleteProduct);

// Variant routes
router.post("/:productId/variants", verifyToken, checkUserBlocked, isAdmin, productController.createVariant);
router.put("/variants/:variantId", verifyToken, checkUserBlocked, isAdmin, productController.updateVariant);

export default router;
