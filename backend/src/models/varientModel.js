import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    label: {
      type: String,
      required: true,
      // e.g., "50 g bag", "100 g bag", "1 kg bag"
    },

    value: {
      type: String,
      required: true,
      // e.g., "50", "100", "1kg"
    },

    image: {
      type: String,
      required: false
    },

    // Price can be absolute or difference from base price
    priceAdjustment: {
      type: Number,
      default: 0,
      // If positive: adds to base price
      // If negative: reduces from base price
      // If this field is used with absolutePrice, this takes precedence
    },

    // If you want absolute price for variant instead of adjustment
    absolutePrice: {
      type: Number,
      required: false
      // If provided, this is the actual price for this variant
      // Otherwise use product.basePrice + priceAdjustment
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    sku: {
      type: String,
      unique: true,
      sparse: true
      // Optional SKU for inventory tracking
    }
  },
  {
    timestamps: true
  }
);

// Index for quick lookups
variantSchema.index({ product: 1 });
variantSchema.index({ sku: 1 });

// Pre-save hook to validate stock availability
variantSchema.pre("save", function (next) {
  this.isAvailable = this.stock > 0;
  next();
});

export default mongoose.model("Variant", variantSchema);
