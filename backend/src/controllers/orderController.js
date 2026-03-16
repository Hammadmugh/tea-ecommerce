import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Variant from "../models/varientModel.js";
import Product from "../models/productModel.js";

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${timestamp}${random}`;
};

// @route POST /api/orders/place
// @access Private
export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress, paymentMethod, cartItems } = req.body;
    const userId = req.user.id;

    console.log('📦 Order request received with cartItems:', !!cartItems);

    // Validation
    if (!shippingAddress || !paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "Shipping address and payment method are required" 
      });
    }

    let orderItems = [];
    let subtotal = 0;

    // If cartItems sent directly from frontend, use those
    if (cartItems && cartItems.length > 0) {
      console.log('✅ Using cart items from frontend:', cartItems.length, 'items');
      
      for (const cartItem of cartItems) {
        console.log('📦 Processing item:', {
          name: cartItem.productName,
          id: cartItem.productId,
          idType: typeof cartItem.productId,
          isValidObjectId: mongoose.Types.ObjectId.isValid(cartItem.productId),
          quantity: cartItem.quantity,
          price: cartItem.pricePerUnit,
          variantLabel: cartItem.variantLabel
        });

        if (cartItem.quantity < 1 || cartItem.quantity > 1000) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false, 
            message: "Invalid item quantity" 
          });
        }

        // Validate required fields
        if (!cartItem.productName || cartItem.pricePerUnit === undefined) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false, 
            message: "Product information incomplete in cart item" 
          });
        }

        // Try to find product by ID or by name (for demo data with numeric IDs)
        let product = null;
        let variant = null;

        if (mongoose.Types.ObjectId.isValid(cartItem.productId)) {
          try {
            product = await Product.findById(cartItem.productId).session(session);
            if (product) {
              console.log('✅ Found product by ObjectId:', product.name);
            }
          } catch (err) {
            console.warn('⚠️ Error finding product by ID:', err.message);
          }
        }

        // If product not found by ID, try to find by name (for demo data)
        if (!product) {
          try {
            product = await Product.findOne({ name: cartItem.productName }).session(session);
            if (product) {
              console.log('✅ Found product by name:', product.name, 'for numeric ID:', cartItem.productId);
            } else {
              console.log('ℹ️ Product not found in DB:', cartItem.productName);
            }
          } catch (err) {
            console.warn('⚠️ Error finding product by name:', err.message);
          }
        }

        // Try to find variant if product exists or by variantLabel
        if (product && cartItem.variantLabel) {
          try {
            variant = await Variant.findOne({
              product: product._id,
              label: cartItem.variantLabel
            }).session(session);
            
            if (variant) {
              console.log('✅ Found variant:', cartItem.variantLabel, 'for product:', product.name);
              
              // Check stock
              if (variant.stock < cartItem.quantity) {
                await session.abortTransaction();
                return res.status(400).json({
                  success: false,
                  message: `Insufficient stock for ${product.name} - ${variant.label}. Only ${variant.stock} available.`,
                  productId: product._id,
                  availableStock: variant.stock
                });
              }
            }
          } catch (err) {
            console.warn('⚠️ Error finding variant:', err.message);
          }
        } else if (cartItem.variantLabel && !product) {
          console.log('ℹ️ Cannot find variant without product ID');
        }

        const itemTotal = cartItem.pricePerUnit * cartItem.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: product?._id || null,
          productName: cartItem.productName,
          productImage: cartItem.productImage,
          variant: variant?._id || null,
          variantLabel: cartItem.variantLabel,
          quantity: cartItem.quantity,
          pricePerUnit: cartItem.pricePerUnit,
          totalPrice: itemTotal
        });
      }
    } else {
      // Otherwise, try to get cart from database (backward compatibility)
      console.log('📂 Trying to fetch cart from database');
      const cart = await Cart.findOne({ user: userId })
        .populate("items.product")
        .populate("items.variant")
        .session(session);

      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false, 
          message: "Cart is empty" 
        });
      }

      // Validate stock for all items and collect order items
      for (const cartItem of cart.items) {
        // Validate quantity
        if (cartItem.quantity < 1 || cartItem.quantity > 1000) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false, 
            message: "Invalid item quantity" 
          });
        }

        const variant = await Variant.findById(cartItem.variant._id).session(session);
        const product = cartItem.product;

        // Recheck stock
        if (variant.stock < cartItem.quantity) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${product.name} - ${cartItem.variant.label}. Only ${variant.stock} available.`,
            productId: product._id,
            availableStock: variant.stock
          });
        }

        const itemPrice = cartItem.priceAtAddTime;
        const itemTotal = itemPrice * cartItem.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          productName: product.name,
          productImage: product.image,
          variant: variant._id,
          variantLabel: cartItem.variant.label,
          quantity: cartItem.quantity,
          pricePerUnit: itemPrice,
          totalPrice: itemTotal
        });
      }
    }

    if (orderItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: "No items in order" 
      });
    }

    // Calculate totals
    const deliveryFee = 3.95;
    const tax = 0; // Can be calculated based on location
    const totalAmount = subtotal + deliveryFee + tax;

    // Create order within transaction
    const order = new Order({
      orderId: generateOrderId(),
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "Default Country"
      },
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      paymentMethod,
      orderStatus: "pending",
      paymentStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed successfully"
        }
      ]
    });

    await order.save({ session });

    // Reduce stock for each variant within transaction (only if variant exists)
    for (const orderItem of orderItems) {
      if (orderItem.variant && mongoose.Types.ObjectId.isValid(orderItem.variant)) {
        try {
          await Variant.findByIdAndUpdate(
            orderItem.variant,
            { $inc: { stock: -orderItem.quantity } },
            { new: true, session }
          );
          console.log(`✅ Reduced stock for variant ${orderItem.variant}`);
        } catch (err) {
          console.warn(`⚠️ Could not reduce stock for variant ${orderItem.variant}:`, err.message);
        }
      } else {
        console.log(`ℹ️ Skipping stock reduction - no valid variant for ${orderItem.productName}`);
      }
    }

    // Clear cart within transaction
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalItems: 0, totalPrice: 0 },
      { new: true, session }
    );

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      data: order
    });
  } catch (err) {
    console.log(err)
    // Abort transaction on error
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: err.message
    });
  } finally {
    session.endSession();
  }
};

// @route GET /api/orders/:orderId
// @access Private
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId })
      .populate("items.product")
      .populate("items.variant");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check authorization - user can only view their own orders (superadmin can view all)
    if (req.user.role !== "superadmin" && order.user.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to view this order" 
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: err.message
    });
  }
};

// @route GET /api/orders/user/:userId
// @access Private
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Authorization check
    if (req.user.role !== "superadmin" && req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only view your own orders" 
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalOrders,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: err.message
    });
  }
};

// @route GET /api/orders/my-orders
// @access Private
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalOrders,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: err.message
    });
  }
};

// @route PUT /api/orders/:orderId/status
// @access Private - Admin/Superadmin only
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    // Fetch the order first
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Update the order status in memory
    order.orderStatus = status;

    // Save the order (this triggers the pre-save hook that updates statusHistory)
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: err.message
    });
  }
};

// @route PUT /api/orders/:orderId/payment-status
// @access Private - Admin/Superadmin only
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ["pending", "completed", "failed"];

    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: err.message
    });
  }
};

// @route GET /api/orders
// @access Private - Admin/Superadmin only
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    const filter = {};

    if (status) {
      filter.orderStatus = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalOrders,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: err.message
    });
  }
};
