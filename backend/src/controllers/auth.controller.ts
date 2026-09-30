import type { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/AppError";
import { sendSuccess } from "../utils/response";
import type { LoginInput, RegisterInput } from "../validators/auth.schemas";

// HTTP only: the body was already checked by validate(). Business rules live in the service.
export function register(req: Request, res: Response, next: NextFunction): void {
  authService
    .register(req.body as RegisterInput)
    .then((result) => sendSuccess(res, result, 201))
    .catch(next);
}

export function login(req: Request, res: Response, next: NextFunction): void {
  authService
    .login(req.body as LoginInput)
    .then((result) => sendSuccess(res, result))
    .catch(next);
}

// Protected example. requireAuth has already loaded the user onto the request.
export function me(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  sendSuccess(res, { user: req.user });
}
