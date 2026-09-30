import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/keys.ts";
import { getProducts } from "../../services/endpoints/products.ts";
import type { ProductFilters } from "../../types/product.ts";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: ({ signal }) => getProducts(filters, signal),
  });
}
