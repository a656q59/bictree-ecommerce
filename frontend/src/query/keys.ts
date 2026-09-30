import type { ProductFilters } from "../types/product.ts";

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters: ProductFilters) => ["products", "list", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
  },
  cart: ["cart"] as const,
};
