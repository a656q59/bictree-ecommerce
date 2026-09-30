import { describe, expect, it } from "vitest";

import type { Variant } from "../types/product.ts";
import { chooseVariantOption, matchVariant } from "./variants.ts";

const variants: Variant[] = [
  { id: "black-s", sku: "black-s", price: 100, compareAtPrice: null, stock: 2, color: "Black", size: "S" },
  { id: "black-m", sku: "black-m", price: 100, compareAtPrice: null, stock: 0, color: "Black", size: "M" },
  { id: "blue-m", sku: "blue-m", price: 120, compareAtPrice: null, stock: 3, color: "Blue", size: "M" },
];

describe("variant selection", () => {
  it("matches colour and size together", () => {
    expect(matchVariant(variants, { color: "Blue", size: "M" })?.id).toBe("blue-m");
  });

  it("moves to a size that exists for the chosen colour", () => {
    const next = chooseVariantOption(variants, { color: "Black", size: "S" }, "color", "Blue");
    expect(next).toEqual({ color: "Blue", size: "M" });
  });
});
