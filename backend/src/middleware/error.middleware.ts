import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

type ErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

function sendError(res: Response, statusCode: number, code: string, message: string): void {
  const body: ErrorBody = {
    success: false,
    error: { code, message },
  };
  res.status(statusCode).json(body);
}

// Unknown routes never reach a controller. This keeps 404s in the same
// response shape as every other error.
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} was not found`);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

function isNamedError(error: unknown, name: string): error is Error {
  return error instanceof Error && error.name === name;
}

// Last middleware in the app. Controllers throw; this function decides the
// HTTP status and the public error code.
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.code, error.message);
    return;
  }

  // Zod failures from validate() become 400s instead of leaking schema internals as a 500.
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join("; ");
    sendError(res, 400, "VALIDATION_ERROR", message || "Invalid request");
    return;
  }

  // Unique indexes (email, slug, sku) surface as Mongo error code 11000.
  if (isDuplicateKeyError(error)) {
    sendError(res, 409, "CONFLICT", "A record with this value already exists");
    return;
  }

  if (isNamedError(error, "CastError")) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid identifier");
    return;
  }

  if (isNamedError(error, "ValidationError")) {
    sendError(res, 400, "VALIDATION_ERROR", error.message);
    return;
  }

  // express.json() rejects a body that is not JSON before a route runs.
  if (isNamedError(error, "SyntaxError") && "status" in error && (error as { status?: unknown }).status === 400) {
    sendError(res, 400, "VALIDATION_ERROR", "Request body must be valid JSON");
    return;
  }

  console.error(error);
  sendError(res, 500, "INTERNAL_ERROR", "Unexpected server error");
}
