import type { Product, Variant } from "../types/product.ts";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return inr.format(amount);
}

export function discountPercent(price: number, compareAtPrice: number | null): number | null {
  if (compareAtPrice === null || compareAtPrice <= price) {
    return null;
  }

  return Math.round((1 - price / compareAtPrice) * 100);
}

export function savingsAmount(price: number, compareAtPrice: number | null): number | null {
  if (compareAtPrice === null || compareAtPrice <= price) {
    return null;
  }

  return compareAtPrice - price;
}

export function displayVariant(product: Product): Variant | null {
  if (product.variants.length === 0) {
    return null;
  }

  const inStock = product.variants.filter((variant) => variant.stock > 0);
  const pool = inStock.length > 0 ? inStock : product.variants;

  return pool.reduce((lowest, variant) => (variant.price < lowest.price ? variant : lowest));
}
