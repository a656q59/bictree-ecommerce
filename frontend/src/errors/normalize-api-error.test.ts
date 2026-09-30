import axios from "axios";
import { describe, expect, it } from "vitest";

import { ApiError } from "./api-error.ts";
import { normalizeApiError } from "./normalize-api-error.ts";

describe("normalizeApiError", () => {
  it("maps a missing response to a network error", () => {
    const error = new axios.AxiosError("Network Error", "ERR_NETWORK");

    const normalized = normalizeApiError(error);

    expect(normalized).toBeInstanceOf(ApiError);
    expect(normalized.status).toBe(0);
    expect(normalized.code).toBe("NETWORK");
    expect(normalized.message).toMatch(/unreachable/i);
  });

  it("maps a timeout separately from a dead server", () => {
    const error = new axios.AxiosError("timeout", "ECONNABORTED");

    const normalized = normalizeApiError(error);

    expect(normalized.code).toBe("TIMEOUT");
    expect(normalized.status).toBe(0);
  });

  it("keeps validation message and field details from a 422", () => {
    const error = new axios.AxiosError(
      "Unprocessable",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 422,
        statusText: "Unprocessable Entity",
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data: {
          message: "Email is invalid",
          code: "VALIDATION",
          details: { email: "Enter a valid email" },
        },
      },
    );

    const normalized = normalizeApiError(error);

    expect(normalized.status).toBe(422);
    expect(normalized.code).toBe("VALIDATION");
    expect(normalized.message).toBe("Email is invalid");
    expect(normalized.details).toEqual({ email: "Enter a valid email" });
  });

  it("reads the backend error envelope", () => {
    const error = new axios.AxiosError("Bad Request", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "quantity must be a positive integer",
        },
      },
    });

    const normalized = normalizeApiError(error);

    expect(normalized.status).toBe(400);
    expect(normalized.code).toBe("VALIDATION_ERROR");
    expect(normalized.message).toBe("quantity must be a positive integer");
  });

  it("uses a status message when the server body is empty", () => {
    const error = new axios.AxiosError("Server", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 503,
      statusText: "Service Unavailable",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: {},
    });

    const normalized = normalizeApiError(error);

    expect(normalized.code).toBe("UNAVAILABLE");
    expect(normalized.message).toMatch(/unavailable/i);
  });
});
