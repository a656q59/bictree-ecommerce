import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/keys.ts";
import { getProduct } from "../../services/endpoints/products.ts";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: ({ signal }) => getProduct(slug, signal),
    enabled: slug.length > 0,
  });
}
