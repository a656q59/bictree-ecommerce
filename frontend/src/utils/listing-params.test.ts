import { describe, expect, it } from "vitest";

import { filtersToSearchParams, parseProductFilters } from "./listing-params.ts";

describe("listing params", () => {
  it("reads filters and drops an invalid sort or price", () => {
    const filters = parseProductFilters(
      new URLSearchParams("category=smartphones&q=galaxy&sort=nope&minPrice=1000&maxPrice=-5&page=2"),
    );

    expect(filters).toEqual({
      category: "smartphones",
      q: "galaxy",
      sort: undefined,
      minPrice: 1000,
      maxPrice: undefined,
      page: 2,
    });
  });

  it("omits the first page and empty filters from the url", () => {
    const params = filtersToSearchParams({
      category: "electronics",
      q: "phone",
      sort: "price_asc",
      minPrice: 500,
      page: 1,
    });

    expect(params.toString()).toBe("category=electronics&q=phone&sort=price_asc&minPrice=500");
  });
});
