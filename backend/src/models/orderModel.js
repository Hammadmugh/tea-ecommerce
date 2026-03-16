import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true
      // Auto-generated like ORD-20260315-001
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false // Optional for demo/frontend data without ObjectIds
        },

        productName: String,
        productImage: String,

        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: false // Optional for demo/frontend data
        },

        variantLabel: String,

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        // Price at time of order
        pricePerUnit: {
          type: Number,
          required: true
        },

        totalPrice: {
          type: Number,
          required: true
        }
      }
    ],

    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: String
    },

    subtotal: {
      type: Number,
      required: true
    },

    deliveryFee: {
      type: Number,
      default: 3.95
    },

    tax: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "stripe"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    trackingNumber: {
      type: String,
      required: false
    },

    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: String
      }
    ],

    notes: String,

    isReturned: {
      type: Boolean,
      default: false
    },

    returnReason: String
  },
  {
    timestamps: true
  }
);

// Index for quick lookups
orderSchema.index({ user: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save to update statusHistory
orderSchema.pre("save", function (next) {
  if (this.isModified("orderStatus")) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      note: `Order status updated to ${this.orderStatus}`
    });
  }
  next();
});

export default mongoose.model("Order", orderSchema);
