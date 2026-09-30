import type { NextFunction, Request, Response } from "express";
import * as cartService from "../services/cart.service";
import { AppError } from "../utils/AppError";
import { sendSuccess } from "../utils/response";
import type { AddCartItemInput, CartItemParams, UpdateCartItemInput } from "../validators/cart.schemas";

function userId(req: Request, next: NextFunction): string | undefined {
  if (!req.user) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return undefined;
  }

  return req.user.id;
}

export function getCart(req: Request, res: Response, next: NextFunction): void {
  const id = userId(req, next);
  if (!id) {
    return;
  }

  cartService
    .getCart(id)
    .then((cart) => sendSuccess(res, cart))
    .catch(next);
}

export function addCartItem(req: Request, res: Response, next: NextFunction): void {
  const id = userId(req, next);
  if (!id) {
    return;
  }

  cartService
    .addItem(id, req.body as AddCartItemInput)
    .then((result) => sendSuccess(res, result.cart, result.created ? 201 : 200))
    .catch(next);
}

export function updateCartItem(req: Request, res: Response, next: NextFunction): void {
  const id = userId(req, next);
  if (!id) {
    return;
  }

  const params = req.validatedParams as CartItemParams;
  cartService
    .updateItem(id, params.id, req.body as UpdateCartItemInput)
    .then((cart) => sendSuccess(res, cart))
    .catch(next);
}

export function deleteCartItem(req: Request, res: Response, next: NextFunction): void {
  const id = userId(req, next);
  if (!id) {
    return;
  }

  const params = req.validatedParams as CartItemParams;
  cartService
    .removeItem(id, params.id)
    .then((cart) => sendSuccess(res, cart))
    .catch(next);
}
