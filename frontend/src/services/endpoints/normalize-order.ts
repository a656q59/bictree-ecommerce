import { ApiError } from "../../errors/api-error.ts";
import type { OrderConfirmation } from "../../types/order.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrap(payload: unknown): unknown {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeOrder(payload: unknown): OrderConfirmation {
  const body = unwrap(payload);
  const source = isRecord(body) && isRecord(body.order) ? body.order : body;

  if (!isRecord(source)) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The order confirmation could not be read.",
    });
  }

  const id = asString(source.id) ?? asString(source._id) ?? asString(source.orderId);
  // The orders API names the server-calculated total totalAmount.
  const total = asNumber(source.total) ?? asNumber(source.totalAmount) ?? asNumber(source.subtotal);
  const items = Array.isArray(source.items) ? source.items : [];

  if (!id || total === null) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The order confirmation could not be read.",
    });
  }

  return {
    id,
    status: asString(source.status) ?? "placed",
    total,
    currency: asString(source.currency) ?? "INR",
    itemCount: asNumber(source.itemCount) ?? items.length,
  };
}
