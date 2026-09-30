import { describe, expect, it } from "vitest";

import type { Product } from "../types/product.ts";
import { discountPercent, displayVariant, savingsAmount } from "./money.ts";

const product: Product = {
  id: "1",
  slug: "galaxy-m13",
  name: "Galaxy M13",
  description: "",
  category: "smartphones",
  brand: "Samsung",
  images: [],
  variants: [
    {
      id: "out",
      sku: "out",
      price: 1000,
      compareAtPrice: 2000,
      stock: 0,
      size: null,
      color: "Black",
    },
    {
      id: "in",
      sku: "in",
      price: 10499,
      compareAtPrice: 14999,
      stock: 4,
      size: null,
      color: "Brown",
    },
  ],
};

describe("catalog pricing", () => {
  it("prefers the lowest in-stock variant", () => {
    expect(displayVariant(product)?.id).toBe("in");
  });

  it("calculates the off percent and the amount saved", () => {
    expect(discountPercent(10499, 14999)).toBe(30);
    expect(savingsAmount(10499, 14999)).toBe(4500);
    expect(discountPercent(100, 100)).toBeNull();
  });
});
