import { ApiError } from "../../errors/api-error.ts";
import type { Product, ProductList, Variant } from "../../types/product.ts";

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
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return asString(value);
}

function normalizeVariant(value: unknown, index: number): Variant | null {
  if (!isRecord(value)) {
    return null;
  }

  const price = asNumber(value.price);
  if (price === null) {
    return null;
  }

  const id = asString(value.id) ?? asString(value._id) ?? `variant-${index}`;

  return {
    id,
    sku: asString(value.sku) ?? id,
    price,
    compareAtPrice: asNumber(value.compareAtPrice),
    stock: asNumber(value.stock) ?? 0,
    size: asNullableString(value.size),
    color: asNullableString(value.color),
  };
}

function normalizeProduct(value: unknown): Product | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = asString(value.name);
  const slug = asString(value.slug);
  if (!name || !slug) {
    return null;
  }

  const variantSource = Array.isArray(value.variants) ? value.variants : [];
  let variants = variantSource
    .map((variant, index) => normalizeVariant(variant, index))
    .filter((variant): variant is Variant => variant !== null);

  if (variants.length === 0) {
    const price = asNumber(value.price);
    if (price === null) {
      return null;
    }

    variants = [
      {
        id: asString(value.id) ?? slug,
        sku: asString(value.sku) ?? slug,
        price,
        compareAtPrice: asNumber(value.compareAtPrice),
        stock: asNumber(value.stock) ?? 0,
        size: null,
        color: null,
      },
    ];
  }

  const images = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === "string" && image.trim() !== "")
    : [];
  const singleImage = asString(value.image);

  return {
    id: asString(value.id) ?? asString(value._id) ?? slug,
    slug,
    name,
    description: asString(value.description) ?? "",
    category: asString(value.category) ?? "",
    brand: asString(value.brand) ?? "",
    images: singleImage ? [singleImage, ...images] : images,
    variants,
  };
}

export function normalizeProductDetail(payload: unknown): Product {
  const body = unwrap(payload);
  const source = isRecord(body) && (isRecord(body.product) || isRecord(body.item)) ? (body.product ?? body.item) : body;
  const product = normalizeProduct(source);

  if (!product) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The product could not be read.",
    });
  }

  return product;
}

export function normalizeProductList(payload: unknown): ProductList {
  const body = unwrap(payload);
  const source = Array.isArray(body)
    ? body
    : isRecord(body)
      ? body.items ?? body.products
      : undefined;

  if (!Array.isArray(source)) {
    throw new ApiError({
      status: 0,
      code: "INVALID_RESPONSE",
      message: "The product list could not be read.",
    });
  }

  return {
    items: source
      .map((item) => normalizeProduct(item))
      .filter((item): item is Product => item !== null),
    page: isRecord(body) ? (asNumber(body.page) ?? 1) : 1,
    pageSize: isRecord(body) ? (asNumber(body.pageSize) ?? source.length) : source.length,
    total: isRecord(body) ? (asNumber(body.total) ?? source.length) : source.length,
  };
}
