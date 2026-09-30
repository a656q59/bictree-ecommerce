import { useSearchParams } from "react-router-dom";

import { ProductCard } from "../components/common/ProductCard.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { ProductGridSkeleton } from "../components/ui/ProductGridSkeleton.tsx";
import { categoryLabel } from "../constants/categories.ts";
import { ApiError } from "../errors/api-error.ts";
import { ProductListFilters } from "../features/catalog/ProductListFilters.tsx";
import { ProductPagination } from "../features/catalog/ProductPagination.tsx";
import { useProducts } from "../features/catalog/useProducts.ts";
import type { ProductFilters } from "../types/product.ts";
import { filtersToSearchParams, hasActiveFilters, parseProductFilters } from "../utils/listing-params.ts";

export function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const filters = parseProductFilters(params);
  const products = useProducts(filters);

  function updateFilters(patch: Partial<ProductFilters>, replace = false) {
    setParams((current) => {
      const next = { ...parseProductFilters(current), ...patch };
      return filtersToSearchParams(next);
    }, { replace });
  }

  const heading = listingHeading(filters);
  const message =
    products.error instanceof ApiError ? products.error.message : "The products could not be loaded.";
  const list = products.data;
  const currentPage = filters.page ?? 1;
  const pageSize = list && list.pageSize > 0 ? list.pageSize : 0;
  const totalPages = list && pageSize > 0 ? Math.ceil(list.total / pageSize) : 1;
  const rangeStart = list && list.items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = rangeStart > 0 && list ? rangeStart + list.items.length - 1 : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{heading}</h1>
          {products.isSuccess ? (
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              {products.data.total === 0
                ? "No products"
                : `Showing ${rangeStart}–${rangeEnd} of ${products.data.total}`}
            </p>
          ) : null}
        </div>
        {hasActiveFilters(filters) ? (
          <button
            type="button"
            onClick={() =>
              updateFilters({
                category: undefined,
                q: undefined,
                sort: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                page: 1,
              })
            }
            className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <ProductListFilters filters={filters} onChange={updateFilters} />

      <div aria-busy={products.isPending}>
        {products.isPending ? <ProductGridSkeleton count={8} /> : null}
        {products.isError ? (
          <ErrorState
            title="Products are unavailable"
            message={message}
            onRetry={() => void products.refetch()}
            retrying={products.isFetching}
          />
        ) : null}
        {products.isSuccess && products.data.items.length === 0 ? (
          <EmptyState
            title={currentPage > 1 ? "Nothing on this page" : "No products match"}
            message={
              currentPage > 1
                ? "This page is outside the current result set."
                : "Try another search, category, or price range."
            }
            actionLabel={hasActiveFilters(filters) || currentPage > 1 ? "Clear filters" : undefined}
            actionTo="/products"
          />
        ) : null}
        {products.isSuccess && products.data.items.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.data.items.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {products.isSuccess ? (
        <ProductPagination
          page={currentPage}
          totalPages={Math.max(1, totalPages)}
          onPage={(page) => {
            updateFilters({ ...filters, page });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}
    </div>
  );
}

function listingHeading(filters: ProductFilters): string {
  const category = filters.category ? categoryLabel(filters.category) : "";
  if (category && filters.q) {
    return `${category} · “${filters.q}”`;
  }
  if (filters.q) {
    return `Results for “${filters.q}”`;
  }
  if (category) {
    return category;
  }
  return "Products";
}
