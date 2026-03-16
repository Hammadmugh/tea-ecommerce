import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
      // One cart per user
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        // Price snapshot (to handle price changes after adding to cart)
        priceAtAddTime: {
          type: Number,
          required: true
        },

        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    totalItems: {
      type: Number,
      default: 0
    },

    totalPrice: {
      type: Number,
      default: 0
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for quick user lookups
cartSchema.index({ user: 1 });

// Pre-save hook to calculate totals
cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.priceAtAddTime * item.quantity, 0);
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model("Cart", cartSchema);
