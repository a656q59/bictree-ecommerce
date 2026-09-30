import { apiClient } from "../api/client.ts";
import type { Product, ProductFilters, ProductList } from "../../types/product.ts";
import { normalizeProductDetail, normalizeProductList } from "./normalize-product.ts";

function toParams(filters: ProductFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (filters.category) params.category = filters.category;
  if (filters.q) params.q = filters.q;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = filters.page;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;

  return params;
}

export async function getProducts(filters: ProductFilters, signal?: AbortSignal): Promise<ProductList> {
  const { data } = await apiClient.get<unknown>("/api/products", {
    params: toParams(filters),
    signal,
  });

  return normalizeProductList(data);
}

export async function getProduct(slug: string, signal?: AbortSignal): Promise<Product> {
  const { data } = await apiClient.get<unknown>(`/api/products/${encodeURIComponent(slug)}`, { signal });
  return normalizeProductDetail(data);
}
