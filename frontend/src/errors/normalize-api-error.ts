import axios from "axios";

import { ApiError, type ApiErrorDetails } from "./api-error.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorBody(data: unknown): Record<string, unknown> | undefined {
  if (!isRecord(data)) {
    return undefined;
  }

  // Backend responses use { success: false, error: { code, message } }.
  if (isRecord(data.error)) {
    return data.error;
  }

  return data;
}

function extractMessage(data: unknown): string | undefined {
  const source = errorBody(data);
  if (!source) {
    return undefined;
  }

  if (typeof source.message === "string" && source.message.trim()) {
    return source.message;
  }

  if (isRecord(data) && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return undefined;
}

function extractCode(data: unknown): string | undefined {
  const source = errorBody(data);
  if (!source || typeof source.code !== "string" || !source.code.trim()) {
    return undefined;
  }

  return source.code;
}

function extractDetails(data: unknown): ApiErrorDetails | undefined {
  if (!isRecord(data) || data.details === undefined) {
    return undefined;
  }

  return data.details as ApiErrorDetails;
}

function statusCode(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHENTICATED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION";
    case 429:
      return "RATE_LIMITED";
    case 500:
      return "SERVER_ERROR";
    case 502:
    case 503:
    case 504:
      return "UNAVAILABLE";
    default:
      return "HTTP_ERROR";
  }
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request could not be processed.";
    case 401:
      return "Sign in is required.";
    case 403:
      return "You do not have permission to do that.";
    case 404:
      return "That resource was not found.";
    case 409:
      return "The request conflicts with the current data.";
    case 422:
      return "Some fields need to be corrected.";
    case 429:
      return "Too many requests. Wait a moment and try again.";
    case 500:
      return "The server had a problem. Try again.";
    case 502:
    case 503:
    case 504:
      return "The service is unavailable. Try again shortly.";
    default:
      return "The request failed.";
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return new ApiError({
        status: 0,
        code: "UNKNOWN",
        message: error.message,
        originalError: error,
      });
    }

    return new ApiError({
      status: 0,
      code: "UNKNOWN",
      message: "Something went wrong.",
      originalError: error,
    });
  }

  if (error.code === "ERR_CANCELED") {
    return new ApiError({
      status: 0,
      code: "CANCELLED",
      message: "Request was cancelled.",
      originalError: error,
    });
  }

  if (!error.response) {
    const timedOut = error.code === "ECONNABORTED";
    return new ApiError({
      status: 0,
      code: timedOut ? "TIMEOUT" : "NETWORK",
      message: timedOut
        ? "The request timed out. Check your connection and try again."
        : "The server is unreachable. Check that the API is running and try again.",
      originalError: error,
    });
  }

  const status = error.response.status;
  const data = error.response.data;

  return new ApiError({
    status,
    code: extractCode(data) ?? statusCode(status),
    message: extractMessage(data) ?? defaultMessage(status),
    details: extractDetails(data),
    originalError: error,
  });
}
