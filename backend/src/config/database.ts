import mongoose from "mongoose";
import { CartModel } from "../models/Cart";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";
import { UserModel } from "../models/User";
import { env } from "./env";

// Opens the MongoDB connection used by every model.
// Skips a second connect when the process is already connected, which keeps
// the dev server and later test setup from opening duplicate pools.
export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // Build declared indexes before the app accepts traffic. Without this,
  // a unique SKU or email check can miss until MongoDB finishes index creation.
  await Promise.all([
    UserModel.init(),
    ProductModel.init(),
    CartModel.init(),
    OrderModel.init(),
  ]);

  return mongoose;
}

// Closes the connection cleanly on shutdown and in tests.
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
