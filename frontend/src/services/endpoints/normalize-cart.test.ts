import { describe, expect, it } from "vitest";

import { canCheckout, normalizeCart } from "./normalize-cart.ts";

describe("normalizeCart", () => {
  it("marks a line unavailable when stock is below the quantity", () => {
    const cart = normalizeCart({
      items: [
        { id: "line-1", variantId: "v1", name: "Phone", slug: "phone", qty: 2, unitPrice: 100, stock: 1 },
      ],
    });

    expect(cart.items[0]?.available).toBe(false);
    expect(cart.items[0]?.lineTotal).toBe(200);
    expect(cart.subtotal).toBe(200);
    expect(canCheckout(cart)).toBe(false);
  });

  it("allows checkout when every line is still in stock", () => {
    const cart = normalizeCart({
      subtotal: 100,
      items: [{ id: "line-1", variantId: "v1", productName: "Phone", qty: 1, unitPrice: 100, stock: 4, available: true }],
    });

    expect(canCheckout(cart)).toBe(true);
  });
});
