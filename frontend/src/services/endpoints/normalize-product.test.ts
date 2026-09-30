import { describe, expect, it } from "vitest";

import { ApiError } from "../../errors/api-error.ts";
import { normalizeProductDetail, normalizeProductList } from "./normalize-product.ts";

describe("normalizeProductList", () => {
  it("reads a wrapped list and a flat price", () => {
    const list = normalizeProductList({
      data: {
        items: [{ id: "p1", slug: "watch", name: "Watch", price: "1999", stock: 2 }],
        page: 1,
        total: 1,
      },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.variants[0]?.price).toBe(1999);
    expect(list.total).toBe(1);
  });

  it("rejects a body that is not a list", () => {
    expect(() => normalizeProductList({ ok: true })).toThrow(ApiError);
  });
});

describe("normalizeProductDetail", () => {
  it("reads a wrapped product", () => {
    const product = normalizeProductDetail({
      data: { product: { slug: "watch", name: "Watch", price: 1999, stock: 2 } },
    });

    expect(product.slug).toBe("watch");
    expect(product.variants[0]?.price).toBe(1999);
  });
});