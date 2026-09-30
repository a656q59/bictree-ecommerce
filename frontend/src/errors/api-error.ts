export type ApiErrorDetails = Record<string, unknown> | unknown[] | string;

type ApiErrorOptions = {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetails;
  originalError?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetails;
  readonly originalError?: unknown;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.originalError = options.originalError;
  }
}
