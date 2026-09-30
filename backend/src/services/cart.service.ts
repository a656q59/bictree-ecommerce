import mongoose from "mongoose";
import { CartModel, type CartDocument } from "../models/Cart";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/AppError";
import type { AddCartItemInput, UpdateCartItemInput } from "../validators/cart.schemas";

const MAX_WRITE_ATTEMPTS = 3;

type VariantSnapshot = {
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
};

export type CartItemView = {
  id: string;
  variantId: string;
  quantity: number;
  available: boolean;
  availableStock: number;
  product: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variant: {
    sku: string;
    price: number;
    attributes: Record<string, string>;
  } | null;
};

export type CartView = {
  id: string | null;
  items: CartItemView[];
};

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 11000;
}

function isVersionError(error: unknown): boolean {
  return error instanceof Error && error.name === "VersionError";
}

function attributesOf(value: unknown): Record<string, string> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const attributes: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      attributes[key] = entry;
    }
  }
  return attributes;
}

// Current product data for every variant in the cart. Missing variants stay
// absent from the map so the response can mark those lines unavailable.
async function loadVariants(variantIds: mongoose.Types.ObjectId[]): Promise<Map<string, VariantSnapshot>> {
  const products = await ProductModel.find({ "variants._id": { $in: variantIds } }).lean();
  const variants = new Map<string, VariantSnapshot>();

  for (const product of products) {
    for (const variant of product.variants) {
      variants.set(variant._id.toString(), {
        productId: product._id.toString(),
        productName: product.name,
        productSlug: product.slug,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        attributes: attributesOf(variant.attributes),
      });
    }
  }

  return variants;
}

// Availability is calculated here and is not written back to the cart.
// quantity stays whatever the user asked for, even when stock is lower.
async function presentCart(cart: CartDocument | null): Promise<CartView> {
  if (!cart || cart.items.length === 0) {
    return { id: cart?.id ?? null, items: [] };
  }

  const variants = await loadVariants(cart.items.map((item) => item.variantId));

  return {
    id: cart.id,
    items: cart.items.map((item) => {
      const variant = variants.get(item.variantId.toString());
      const availableStock = variant?.stock ?? 0;

      return {
        id: item._id.toString(),
        variantId: item.variantId.toString(),
        quantity: item.quantity,
        available: variant !== undefined && availableStock >= item.quantity,
        availableStock,
        product: variant
          ? { id: variant.productId, name: variant.productName, slug: variant.productSlug }
          : null,
        variant: variant
          ? { sku: variant.sku, price: variant.price, attributes: variant.attributes }
          : null,
      };
    }),
  };
}

async function requireVariant(variantId: string): Promise<void> {
  const product = await ProductModel.exists({ "variants._id": variantId });
  if (!product) {
    throw new AppError(404, "VARIANT_NOT_FOUND", "Variant not found");
  }
}

export async function getCart(userId: string): Promise<CartView> {
  const cart = await CartModel.findOne({ userId });
  return presentCart(cart);
}

export async function addItem(userId: string, input: AddCartItemInput): Promise<{ cart: CartView; created: boolean }> {
  await requireVariant(input.variantId);
  const variantId = new mongoose.Types.ObjectId(input.variantId);

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      try {
        const created = await CartModel.create({
          userId,
          items: [{ variantId, quantity: input.quantity }],
        });
        return { cart: await presentCart(created), created: true };
      } catch (error) {
        // Another request created this user's cart first. Read it and merge.
        if (isDuplicateKeyError(error)) {
          continue;
        }
        throw error;
      }
    }

    const existing = cart.items.find((item) => item.variantId.equals(variantId));
    const created = existing === undefined;

    if (existing) {
      const nextQuantity = existing.quantity + input.quantity;
      if (nextQuantity > 100) {
        throw new AppError(400, "VALIDATION_ERROR", "quantity cannot exceed 100");
      }
      existing.quantity = nextQuantity;
    } else {
      cart.items.push({ variantId, quantity: input.quantity });
    }

    try {
      await cart.save();
      return { cart: await presentCart(cart), created };
    } catch (error) {
      if (isVersionError(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new AppError(409, "CONFLICT", "Cart was updated at the same time. Retry the request");
}

export async function updateItem(userId: string, itemId: string, input: UpdateCartItemInput): Promise<CartView> {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new AppError(404, "CART_NOT_FOUND", "Cart not found");
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "Cart item not found");
  }

  // Replace the requested quantity. Do not clamp it to current stock.
  item.quantity = input.quantity;
  await cart.save();
  return presentCart(cart);
}

export async function removeItem(userId: string, itemId: string): Promise<CartView> {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw new AppError(404, "CART_NOT_FOUND", "Cart not found");
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new AppError(404, "CART_ITEM_NOT_FOUND", "Cart item not found");
  }

  item.deleteOne();
  await cart.save();
  return presentCart(cart);
}
