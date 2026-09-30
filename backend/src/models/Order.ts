import mongoose, { type InferSchemaType } from "mongoose";

// Purchase snapshot. These fields stay as they were at checkout.
// Later product renames or price changes must not rewrite an existing order.
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a positive integer",
      },
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  // No subdocument id. The snapshot fields above are the whole line.
  { _id: false },
);

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "Order must include at least one item",
      },
    },
    // Sum of quantity * purchasePrice, calculated on the server at checkout.
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: "PENDING",
    },
  },
  { timestamps: true },
);

// Checkout and any later "my orders" read look up orders by the authenticated user.
orderSchema.index({ userId: 1, createdAt: -1 });

export type OrderItem = InferSchemaType<typeof orderItemSchema>;
export type Order = InferSchemaType<typeof orderSchema>;
export type OrderDocument = mongoose.HydratedDocument<Order>;

export const OrderModel = mongoose.model("Order", orderSchema);
