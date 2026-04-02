import Product from "../models/productModel.js";
import Variant from "../models/varientModel.js";

// Escape regex special characters to prevent injection
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @route GET /api/products
// @access Public
// Query params: page, limit, category, minPrice, maxPrice, sort, rating, flavor, searchTerm
export const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      minPrice, 
      maxPrice, 
      sort = "-createdAt",
      rating,
      flavor,
      searchTerm
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (flavor) {
      filter.flavor = { $regex: flavor, $options: "i" };
    }

    if (searchTerm) {
      const escaped = escapeRegex(searchTerm);
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { ingredients: { $regex: escaped, $options: "i" } }
      ];
    }

    // Calculate pagination with validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Parse sort parameter
    const sortObj = {};
    sort.split(",").forEach((s) => {
      if (s.startsWith("-")) {
        sortObj[s.slice(1)] = -1;
      } else {
        sortObj[s] = 1;
      }
    });

    // Fetch products
    const products = await Product.find(filter)
      .populate("variants")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalProducts,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: err.message
    });
  }
};

// @route GET /api/products/:productId
// @access Public
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate("variants");

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: err.message
    });
  }
};

// @route GET /api/products/slug/:slug
// @access Public
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate("variants");

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: err.message
    });
  }
};

// @route POST /api/products
// @access Private - Admin/Superadmin only
export const createProduct = async (req, res) => {
  try {
    const { name, slug, description, category, basePrice, image, ...otherData } = req.body;

    // Validation
    if (!name || !slug || !description || !category || basePrice === undefined || !image) {
      return res.status(400).json({ 
        success: false, 
        message: "All required fields must be provided" 
      });
    }

    // Validate price is positive
    const price = parseFloat(basePrice);
    if (price < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Price must be a positive number" 
      });
    }

    const newProduct = new Product({
      name,
      slug: slug.toLowerCase(),
      description,
      category: category.toLowerCase(),
      basePrice: price,
      image,
      createdBy: req.user.id,
      ...otherData
    });

    try {
      await newProduct.save();
    } catch (saveErr) {
      // Handle duplicate key error for slug
      if (saveErr.code === 11000 && saveErr.keyPattern?.slug) {
        return res.status(409).json({ 
          success: false, 
          message: "Product with this slug already exists" 
        });
      }
      throw saveErr;
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: err.message
    });
  }
};

// @route PUT /api/products/:productId
// @access Private - Admin/Superadmin only
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: err.message
    });
  }
};

// @route DELETE /api/products/:productId
// @access Private - Admin/Superadmin only
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Also delete associated variants
    await Variant.deleteMany({ product: productId });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: err.message
    });
  }
};

// @route POST /api/products/:productId/variants
// @access Private - Admin/Superadmin only
export const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { label, value, priceAdjustment, absolutePrice, stock, sku } = req.body;

    // Validate required fields
    if (!label || !value) {
      return res.status(400).json({ 
        success: false, 
        message: "Label and value are required" 
      });
    }

    // Validate stock is not negative
    const stockNum = parseInt(stock) || 0;
    if (stockNum < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Stock cannot be negative" 
      });
    }

    // Validate quantity limit
    if (stockNum > 1000000) {
      return res.status(400).json({ 
        success: false, 
        message: "Stock quantity exceeds maximum limit" 
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check for duplicate variant
    const existingVariant = await Variant.findOne({
      product: productId,
      label: label.trim(),
      value: value.trim()
    });
    if (existingVariant) {
      return res.status(409).json({ 
        success: false, 
        message: "This variant already exists for this product" 
      });
    }

    const newVariant = new Variant({
      product: productId,
      label: label.trim(),
      value: value.trim(),
      priceAdjustment: priceAdjustment || 0,
      absolutePrice,
      stock: stockNum,
      sku: sku?.trim(),
      isAvailable: stockNum > 0
    });

    await newVariant.save();

    // Add variant to product
    product.variants.push(newVariant._id);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: newVariant
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating variant",
      error: err.message
    });
  }
};

// @route PUT /api/products/variants/:variantId
// @access Private - Admin/Superadmin only
export const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    const variant = await Variant.findByIdAndUpdate(
      variantId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!variant) {
      return res.status(404).json({ 
        success: false, 
        message: "Variant not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: variant
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating variant",
      error: err.message
    });
  }
};
