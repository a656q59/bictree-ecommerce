import type { Response } from "express";

// Every successful handler uses this so clients always receive
// { success: true, data }. Status defaults to 200; create routes pass 201.
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}
