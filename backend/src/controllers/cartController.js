import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/varientModel.js";

// @route GET /api/cart
// @access Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "items.product",
        select: "name image category"
      })
      .populate({
        path: "items.variant",
        select: "label value stock priceAdjustment absolutePrice"
      });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user.id,
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: err.message
    });
  }
};

// @route POST /api/cart/add
// @access Private
export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.id;

    // Validation
    if (!productId || !variantId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID, variant ID, and quantity are required" 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantity must be at least 1" 
      });
    }

    // Fetch product and variant
    const product = await Product.findById(productId);
    const variant = await Variant.findById(variantId);

    if (!product || !variant) {
      return res.status(404).json({ 
        success: false, 
        message: "Product or variant not found" 
      });
    }

    // Validate variant belongs to product
    if (variant.product.toString() !== productId) {
      return res.status(400).json({ 
        success: false, 
        message: "Variant does not belong to this product" 
      });
    }

    // Check stock availability
    if (variant.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${variant.stock} items in stock`,
        availableStock: variant.stock
      });
    }

    // Calculate item price
    const itemPrice = variant.absolutePrice || (product.basePrice + variant.priceAdjustment);

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (variant.stock < newQuantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${variant.stock} items in stock`,
          availableStock: variant.stock
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        priceAtAddTime: itemPrice
      });
    }

    await cart.save();

    // Populate for response
    await cart.populate({
      path: "items.product",
      select: "name image category"
    });
    await cart.populate({
      path: "items.variant",
      select: "label value stock"
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: err.message
    });
  }
};

// @route PUT /api/cart/update-quantity
// @access Private
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !variantId || quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID, variant ID, and quantity are required" 
      });
    }

    if (quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantity cannot be negative" 
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Cart not found" 
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock
      const variant = await Variant.findById(variantId);
      if (variant.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${variant.stock} items in stock`,
          availableStock: variant.stock
        });
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: err.message
    });
  }
};

// @route DELETE /api/cart/remove/:productId/:variantId
// @access Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: "Cart not found" 
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error removing from cart",
      error: err.message
    });
  }
};

// @route DELETE /api/cart/clear
// @access Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalItems: 0, totalPrice: 0 },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: err.message
    });
  }
};
