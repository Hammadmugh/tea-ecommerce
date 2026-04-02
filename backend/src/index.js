import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { errorHandler } from "./middlewares/errorHandler.js";
import { validateEnvironment } from "./config/validateEnv.js";
import { seedAdmin } from "./config/seedAdmin.js";
import { seedProducts } from "./config/seedProducts.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.CONNECTION_STRING || "mongodb://localhost:27017/ecommerce-tea";

// ============ MIDDLEWARE ============
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cors());

// ============ DATABASE CONNECTION ============
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");
    // Seed default admin user
    await seedAdmin();
    // Seed products
    await seedProducts();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ============ ROUTES ============
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ============ HEALTH CHECK ============
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// ============ 404 HANDLER ============
app.use( (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
});
