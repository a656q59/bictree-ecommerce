// Operational error thrown by services when the failure is expected
// (validation, auth, not found, conflict). The error middleware maps
// statusCode and code into the shared API error shape.
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
