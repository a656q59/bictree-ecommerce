import { ApiError, type ApiErrorDetails } from "../../errors/api-error.ts";
import type { AuthSession } from "../../types/auth.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrap(payload: unknown): unknown {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeAuthSession(payload: unknown, fallbackEmail: string): AuthSession {
  const body = unwrap(payload);
  if (!isRecord(body)) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The sign-in response could not be read.",
    });
  }

  const accessToken = asString(body.accessToken) ?? asString(body.token);
  const userRecord = isRecord(body.user) ? body.user : null;
  const email = (userRecord ? asString(userRecord.email) : null) ?? asString(body.email) ?? fallbackEmail;

  if (!accessToken || !email) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The sign-in response could not be read.",
    });
  }

  return {
    accessToken,
    user: {
      id: (userRecord ? asString(userRecord.id) : null) ?? asString(body.id) ?? email,
      email,
    },
  };
}

export function validationMessages(details: ApiErrorDetails | undefined): Record<string, string> {
  const messages: Record<string, string> = {};
  if (!details) {
    return messages;
  }

  if (typeof details === "string") {
    messages.form = details;
    return messages;
  }

  if (Array.isArray(details)) {
    for (const item of details) {
      if (!isRecord(item)) {
        continue;
      }
      const field = asString(item.field);
      const message = asString(item.message);
      if (field && message) {
        messages[field] = message;
      }
    }
    return messages;
  }

  for (const [field, value] of Object.entries(details)) {
    if (typeof value === "string" && value.trim()) {
      messages[field] = value;
    } else if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
      messages[field] = value[0];
    }
  }

  return messages;
}
