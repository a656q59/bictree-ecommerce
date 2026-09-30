import { ApiError } from "../../errors/api-error.ts";
import type { Cart, CartLine } from "../../types/cart.ts";

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

function nested(record: Record<string, unknown>, key: string): Record<string, unknown> | null {
  return isRecord(record[key]) ? record[key] : null;
}

function normalizeLine(value: unknown): CartLine | null {
  if (!isRecord(value)) {
    return null;
  }

  const product = nested(value, "product");
  const variant = nested(value, "variant");
  const qty = asNumber(value.qty) ?? asNumber(value.quantity);
  const unitPrice = asNumber(value.unitPrice) ?? asNumber(value.price) ?? (variant ? asNumber(variant.price) : null);
  const id = asString(value.id) ?? asString(value._id);

  if (qty === null || qty < 1 || unitPrice === null || !id) {
    return null;
  }

  const stock = asNumber(value.stock) ?? (variant ? asNumber(variant.stock) : null) ?? qty;
  const color = asString(value.color) ?? (variant ? asString(variant.color) : null);
  const size = asString(value.size) ?? (variant ? asString(variant.size) : null);
  const variantLabel =
    asString(value.variantLabel) ?? [color, size].filter((part) => part !== null).join(" / ");
  const lineTotal = asNumber(value.lineTotal) ?? unitPrice * qty;
  const available =
    typeof value.available === "boolean" ? value.available : stock >= qty && stock > 0;
  const images = product && Array.isArray(product.images) ? product.images : [];
  const firstImage = images.find((image) => typeof image === "string" && image.trim());

  return {
    id,
    variantId: asString(value.variantId) ?? (variant ? asString(variant.id) : null) ?? id,
    productName: asString(value.productName) ?? asString(value.name) ?? (product ? asString(product.name) : null) ?? "Product",
    productSlug: asString(value.productSlug) ?? asString(value.slug) ?? (product ? asString(product.slug) : null) ?? "",
    image: asString(value.image) ?? (product ? asString(product.image) : null) ?? (typeof firstImage === "string" ? firstImage : null),
    variantLabel,
    qty,
    unitPrice,
    lineTotal,
    stock,
    available,
  };
}

export function normalizeCart(payload: unknown): Cart {
  const body = unwrap(payload);
  const source = Array.isArray(body)
    ? body
    : isRecord(body)
      ? (body.items ?? body.lines)
      : undefined;

  if (!Array.isArray(source)) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The cart could not be read.",
    });
  }

  const items = source.map((item) => normalizeLine(item)).filter((item): item is CartLine => item !== null);
  const computed = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items,
    subtotal: isRecord(body) ? (asNumber(body.subtotal) ?? asNumber(body.total) ?? computed) : computed,
    currency: isRecord(body) ? (asString(body.currency) ?? "INR") : "INR",
  };
}

export function canCheckout(cart: Cart): boolean {
  return cart.items.length > 0 && cart.items.every((line) => line.available && line.qty > 0 && line.qty <= line.stock);
}
