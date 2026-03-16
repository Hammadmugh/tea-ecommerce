import express from "express";
import * as authController from "../controllers/authController.js";
import { verifyToken, checkUserBlocked } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", verifyToken, checkUserBlocked, authController.getProfile);
router.post("/logout", verifyToken, authController.logout);

export default router;
