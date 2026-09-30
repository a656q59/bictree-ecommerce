import { Router } from "express";
import { createOrder } from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createOrderSchema } from "../validators/order.schemas";

// Mounted at /api/orders. Checkout always uses the authenticated user's cart.
const router = Router();

router.post("/", requireAuth, validate("body", createOrderSchema), createOrder);

export { router as orderRouter };
