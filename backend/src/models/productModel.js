import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: ["chai", "black", "green", "herbal", "accessories"],
      lowercase: true
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    flavor: {
      type: String,
      required: false
    },

    qualities: {
      type: String,
      required: false
    },

    caffeine: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: false
    },

    origin: {
      type: String,
      required: false
    },

    organic: {
      type: Boolean,
      default: false
    },

    vegan: {
      type: Boolean,
      default: false
    },

    allergens: {
      type: String,
      required: false
    },

    ingredients: {
      type: String,
      required: false
    },

    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant"
      }
    ],

    steeping: {
      servingSize: String,
      temperature: String,
      time: String,
      colorAfter3Min: String
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Index for filtering and pagination
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ slug: 1 });

export default mongoose.model("Product", productSchema);
