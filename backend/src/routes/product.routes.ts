import { Router } from "express";
import { getProduct, listProducts } from "../controllers/product.controller";
import { validate } from "../middleware/validate.middleware";
import { productListQuerySchema, productSlugParamsSchema } from "../validators/product.schemas";

// Mounted at /api/products in app.ts. Both routes are public.
const router = Router();

router.get("/", validate("query", productListQuerySchema), listProducts);
router.get("/:slug", validate("params", productSlugParamsSchema), getProduct);

export { router as productRouter };
