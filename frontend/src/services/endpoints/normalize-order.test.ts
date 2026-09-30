import { describe, expect, it } from "vitest";

import { normalizeOrder } from "./normalize-order.ts";

describe("normalizeOrder", () => {
  it("reads the checkout payload from the orders API", () => {
    const order = normalizeOrder({
      success: true,
      data: {
        id: "order-1",
        status: "CONFIRMED",
        totalAmount: 2500,
        items: [
          { productName: "Shirt", quantity: 2, purchasePrice: 500 },
          { productName: "Hat", quantity: 1, purchasePrice: 1500 },
        ],
      },
    });

    expect(order).toMatchObject({
      id: "order-1",
      status: "CONFIRMED",
      total: 2500,
      currency: "INR",
      itemCount: 2,
    });
  });
});
