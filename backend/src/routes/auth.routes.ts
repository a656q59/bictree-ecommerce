import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.schemas";

// Mounted at /api/auth in app.ts.
const router = Router();

router.post("/register", validate("body", registerSchema), register);
router.post("/login", validate("body", loginSchema), login);
router.get("/me", requireAuth, me);

export { router as authRouter };
