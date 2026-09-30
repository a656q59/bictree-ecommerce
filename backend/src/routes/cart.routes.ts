import { Router } from "express";
import { addCartItem, deleteCartItem, getCart, updateCartItem } from "../controllers/cart.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { addCartItemSchema, cartItemParamsSchema, updateCartItemSchema } from "../validators/cart.schemas";

// Mounted at /api/cart. Every route belongs to the authenticated user.
const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", validate("body", addCartItemSchema), addCartItem);
router.patch("/items/:id", validate("params", cartItemParamsSchema), validate("body", updateCartItemSchema), updateCartItem);
router.delete("/items/:id", validate("params", cartItemParamsSchema), deleteCartItem);

export { router as cartRouter };
