import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { authRouter } from "./routes/auth.routes";
import { cartRouter } from "./routes/cart.routes";
import { orderRouter } from "./routes/order.routes";
import { productRouter } from "./routes/product.routes";
import { sendSuccess } from "./utils/response";

// Builds the Express app without listening. Tests and server.ts both call this
// so HTTP behaviour stays the same outside the process entrypoint.
export function createApp(): express.Express {
  const app = express();

  // Browser clients on another origin (the React app) need CORS.
  app.use(cors());

  // Parse JSON bodies. Cart, auth, and order routes will rely on this later.
  app.use(express.json());

  // Liveness check so the foundation can be verified before feature routes exist.
  app.get("/api/health", (_req, res) => {
    sendSuccess(res, { status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", orderRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
