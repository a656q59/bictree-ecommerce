import mongoose from "mongoose";
import { CartModel } from "../models/Cart";
import { OrderModel, type OrderDocument } from "../models/Order";
import { ProductModel, type ProductDocument } from "../models/Product";
import { AppError } from "../utils/AppError";
import type { CreateOrderInput } from "../validators/order.schemas";

type ResolvedLine = {
  quantity: number;
  product: ProductDocument;
  variantId: mongoose.Types.ObjectId;
  sku: string;
  purchasePrice: number;
};

export type OrderView = {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    variantId: string;
    sku: string;
    quantity: number;
    purchasePrice: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: Date;
};

function insufficientStock(): AppError {
  return new AppError(409, "INSUFFICIENT_STOCK", "Requested quantity is not available");
}

function presentOrder(order: OrderDocument): OrderView {
  return {
    id: order.id,
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      productName: item.productName,
      variantId: item.variantId.toString(),
      sku: item.sku,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
    })),
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
  };
}

// Conditional update: the variant is decremented only when its current stock
// still covers the requested quantity. A miss means this line cannot be sold,
// and the surrounding transaction rolls back every earlier decrement.
async function decrementStock(
  line: ResolvedLine,
  session: mongoose.ClientSession,
): Promise<void> {
  const result = await ProductModel.updateOne(
    {
      _id: line.product._id,
      variants: {
        $elemMatch: {
          _id: line.variantId,
          stock: { $gte: line.quantity },
        },
      },
    },
    { $inc: { "variants.$.stock": -line.quantity } },
    { session },
  );

  if (result.matchedCount !== 1) {
    throw insufficientStock();
  }
}

async function checkout(userId: string, session: mongoose.ClientSession): Promise<OrderView> {
  const cart = await CartModel.findOne({ userId }).session(session);
  if (!cart || cart.items.length === 0) {
    throw new AppError(400, "CART_EMPTY", "Cart is empty");
  }

  const lines: ResolvedLine[] = [];

  for (const item of cart.items) {
    const product = await ProductModel.findOne({ "variants._id": item.variantId }).session(session);
    const variant = product?.variants.id(item.variantId);

    if (!product || !variant) {
      throw insufficientStock();
    }

    lines.push({
      quantity: item.quantity,
      product,
      variantId: variant._id,
      sku: variant.sku,
      purchasePrice: variant.price,
    });
  }

  // Same product order for every checkout, so two transactions cannot lock
  // the same products in opposite orders and deadlock.
  lines.sort((left, right) => {
    const byProduct = left.product.id.localeCompare(right.product.id);
    if (byProduct !== 0) {
      return byProduct;
    }
    return left.variantId.toString().localeCompare(right.variantId.toString());
  });

  for (const line of lines) {
    await decrementStock(line, session);
  }

  const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.purchasePrice, 0);
  const [order] = await OrderModel.create(
    [
      {
        userId,
        status: "CONFIRMED",
        totalAmount,
        items: lines.map((line) => ({
          productId: line.product._id,
          productName: line.product.name,
          variantId: line.variantId,
          sku: line.sku,
          quantity: line.quantity,
          purchasePrice: line.purchasePrice,
        })),
      },
    ],
    { session },
  );

  if (!order) {
    throw new AppError(500, "INTERNAL_ERROR", "Order could not be created");
  }

  cart.items.splice(0, cart.items.length);
  await cart.save({ session });

  return presentOrder(order);
}

// Requires a MongoDB replica set. A standalone server cannot commit a transaction.
export async function createOrder(userId: string): Promise<OrderView> {
  const session = await mongoose.startSession();

  try {
    const order = await session.withTransaction(() => checkout(userId, session));
    if (!order) {
      throw new AppError(500, "INTERNAL_ERROR", "Order could not be created");
    }
    return order;
  } finally {
    await session.endSession();
  }
}
