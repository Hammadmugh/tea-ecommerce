import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/varientModel.js";
import Cart from "../models/cartModel.js";

// @route GET /api/admin/analytics
// @access Private - Superadmin only
export const getAnalytics = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ role: "user" });

    // Get total admins
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Get blocked users
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Get total products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get revenue (sum of totalAmount from all orders)
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.product": { $ne: null } } },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      }
    ]);

    // Get total stock count
    const stockData = await Variant.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
          lowStockItems: {
            $sum: {
              $cond: [{ $lt: ["$stock", 10] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get low stock products (with pagination)
    const lowStockPage = parseInt(req.query.lowStockPage) || 1;
    const lowStockSkip = (lowStockPage - 1) * 10;
    
    const lowStockProducts = await Variant.find({ stock: { $lt: 10 } })
      .populate("product", "name slug")
      .skip(lowStockSkip)
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          blocked: blockedUsers
        },
        products: {
          total: totalProducts
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus,
          topProducts
        },
        revenue: {
          total: totalRevenue.toFixed(2)
        },
        inventory: {
          totalStock: stockData[0]?.totalStock || 0,
          lowStockItems: stockData[0]?.lowStockItems || 0,
          lowStockProducts
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: err.message
    });
  }
};

// @route GET /api/admin/users
// @access Private - Superadmin only
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isBlocked } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (isBlocked === "true") {
      filter.isBlocked = true;
    } else if (isBlocked === "false") {
      filter.isBlocked = false;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalUsers,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: err.message
    });
  }
};

// @route PUT /api/admin/users/:userId/block
// @access Private - Superadmin only
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error blocking user",
      error: err.message
    });
  }
};

// @route PUT /api/admin/users/:userId/unblock
// @access Private - Superadmin only
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error unblocking user",
      error: err.message
    });
  }
};

// @route POST /api/admin/users/create-admin
// @access Private - Superadmin only
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    // Hash password and create admin
    const bcryptjs = await import("bcryptjs");
    const salt = await bcryptjs.default.genSalt(10);
    const hashedPassword = await bcryptjs.default.hash(password, salt);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: err.message
    });
  }
};

// @route PUT /api/admin/users/:userId/role
// @access Private - Superadmin only
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["superadmin", "admin", "user"];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}` 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: err.message
    });
  }
};

// @route DELETE /api/admin/users/:userId
// @access Private - Superadmin only
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting the only superadmin
    const superadminCount = await User.countDocuments({ role: "superadmin" });
    const userToDelete = await User.findById(userId);

    if (userToDelete.role === "superadmin" && superadminCount === 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete the only superadmin" 
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message
    });
  }
};
