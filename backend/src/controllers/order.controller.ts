import type { NextFunction, Request, Response } from "express";
import * as orderService from "../services/order.service";
import { AppError } from "../utils/AppError";
import { sendSuccess } from "../utils/response";

// Checkout creates an order from the authenticated user's current cart.
export function createOrder(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  orderService
    .createOrder(req.user.id)
    .then((order) => sendSuccess(res, order, 201))
    .catch(next);
}
