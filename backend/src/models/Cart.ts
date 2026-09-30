import mongoose, { type InferSchemaType } from "mongoose";

// One line per variant. Price is intentionally absent: checkout reads the
// current variant price from Product so the client cannot supply it.
const cartItemSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
  },
  // :id in PATCH/DELETE /api/cart/items/:id is this subdocument id.
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        // Adding the same variant twice must increase quantity, not insert a second line.
        // The cart service does the merge; this rejects a document that already has duplicates.
        validator: (items: Array<{ variantId: mongoose.Types.ObjectId }>) => {
          const ids = items.map((item) => item.variantId.toString());
          return ids.length === new Set(ids).size;
        },
        message: "Cart cannot contain the same variant twice",
      },
    },
  },
  { timestamps: true },
);

export type CartItem = InferSchemaType<typeof cartItemSchema>;
export type Cart = InferSchemaType<typeof cartSchema>;
export type CartDocument = mongoose.HydratedDocument<Cart>;

export const CartModel = mongoose.model("Cart", cartSchema);
