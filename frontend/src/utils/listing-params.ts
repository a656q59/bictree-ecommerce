import type { ProductFilters, ProductSort } from "../types/product.ts";

const sorts: readonly ProductSort[] = ["price_asc", "price_desc", "newest"];

function isSort(value: string | null): value is ProductSort {
  return sorts.some((sort) => sort === value);
}

function parsePrice(value: string | null): number | undefined {
  if (value === null || value.trim() === "") {
    return undefined;
  }

  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    return undefined;
  }

  return price;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export function parseProductFilters(params: URLSearchParams): ProductFilters {
  const category = params.get("category")?.trim();
  const q = params.get("q")?.trim();
  const sort = params.get("sort");

  return {
    category: category || undefined,
    q: q || undefined,
    sort: isSort(sort) ? sort : undefined,
    minPrice: parsePrice(params.get("minPrice")),
    maxPrice: parsePrice(params.get("maxPrice")),
    page: parsePage(params.get("page")),
  };
}

export function filtersToSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  return params;
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return Boolean(
    filters.category ||
      filters.q ||
      filters.sort ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined,
  );
}
