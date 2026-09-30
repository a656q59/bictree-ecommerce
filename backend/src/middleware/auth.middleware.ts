import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { AppError } from "../utils/AppError";

// The token only needs the user id. Name and email are loaded from MongoDB
// so a deleted account cannot keep calling protected routes.
const tokenPayloadSchema = z.object({
  sub: z.string().min(1),
});

function unauthorized(message: string): AppError {
  return new AppError(401, "UNAUTHORIZED", message);
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header("authorization");
    if (!header) {
      next(unauthorized("Authentication required"));
      return;
    }

    const [scheme, token, ...extra] = header.split(" ");
    if (scheme !== "Bearer" || !token || extra.length > 0) {
      next(unauthorized("Authentication required"));
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const payload = tokenPayloadSchema.safeParse(decoded);
    if (!payload.success) {
      next(unauthorized("Invalid token"));
      return;
    }

    const user = await UserModel.findById(payload.data.sub);
    if (!user) {
      next(unauthorized("Invalid token"));
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(unauthorized("Invalid token"));
  }
}
