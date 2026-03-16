import express from "express";
import * as adminController from "../controllers/adminController.js";
import { verifyToken, checkUserBlocked } from "../middlewares/authMiddleware.js";
import { isSuperAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// All admin routes require superadmin access
router.use(verifyToken, checkUserBlocked, isSuperAdmin);

// Analytics
router.get("/analytics", adminController.getAnalytics);

// User management
router.get("/users", adminController.getAllUsers);
router.post("/users/create-admin", adminController.createAdmin);
router.put("/users/:userId/block", adminController.blockUser);
router.put("/users/:userId/unblock", adminController.unblockUser);
router.put("/users/:userId/role", adminController.changeUserRole);
router.delete("/users/:userId", adminController.deleteUser);

export default router;
