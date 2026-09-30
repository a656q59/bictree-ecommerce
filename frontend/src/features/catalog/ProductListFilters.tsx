import { useState } from "react";

import { listingCategories } from "../../constants/categories.ts";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback.ts";
import type { ProductFilters, ProductSort } from "../../types/product.ts";

type FilterPatch = Partial<ProductFilters>;

type ProductListFiltersProps = {
  filters: ProductFilters;
  onChange: (patch: FilterPatch, replace?: boolean) => void;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const sorts: readonly ProductSort[] = ["price_asc", "price_desc", "newest"];

function isSort(value: string): value is ProductSort {
  return sorts.some((sort) => sort === value);
}

function parseDraftPrice(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    return undefined;
  }

  return price;
}

type TextFieldProps = {
  id: string;
  label: string;
  initialValue: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  onCommit: (value: string) => void;
};

function DebouncedTextField({
  id,
  label,
  initialValue,
  placeholder,
  invalid = false,
  describedBy,
  onCommit,
}: TextFieldProps) {
  const [value, setValue] = useState(initialValue);
  const commit = useDebouncedCallback(300);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        inputMode={id === "listing-search" ? "text" : "numeric"}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={fieldClass}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          commit(() => onCommit(next));
        }}
      />
    </div>
  );
}

export function ProductListFilters({ filters, onChange }: ProductListFiltersProps) {
  const knownCategory = listingCategories.some((category) => category.slug === filters.category);
  const priceRangeInvalid =
    filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice;

  return (
    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={(event) => event.preventDefault()}>
      <DebouncedTextField
        key={filters.q ?? ""}
        id="listing-search"
        label="Search"
        placeholder="Search products"
        initialValue={filters.q ?? ""}
        onCommit={(value) => onChange({ q: value.trim() || undefined, page: 1 }, true)}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="listing-category" className="text-xs font-medium text-muted">
          Category
        </label>
        <select
          id="listing-category"
          value={filters.category ?? ""}
          className={fieldClass}
          onChange={(event) => onChange({ category: event.target.value || undefined, page: 1 })}
        >
          <option value="">All categories</option>
          {filters.category && !knownCategory ? (
            <option value={filters.category}>{filters.category}</option>
          ) : null}
          {listingCategories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <DebouncedTextField
        key={filters.minPrice ?? "min"}
        id="listing-min"
        label="Min price (₹)"
        initialValue={filters.minPrice === undefined ? "" : String(filters.minPrice)}
        invalid={priceRangeInvalid}
        onCommit={(value) => {
          if (value.trim() !== "" && parseDraftPrice(value) === undefined) {
            return;
          }
          onChange({ minPrice: parseDraftPrice(value), page: 1 }, true);
        }}
      />

      <DebouncedTextField
        key={filters.maxPrice ?? "max"}
        id="listing-max"
        label="Max price (₹)"
        initialValue={filters.maxPrice === undefined ? "" : String(filters.maxPrice)}
        invalid={priceRangeInvalid}
        describedBy={priceRangeInvalid ? "listing-price-error" : undefined}
        onCommit={(value) => {
          if (value.trim() !== "" && parseDraftPrice(value) === undefined) {
            return;
          }
          onChange({ maxPrice: parseDraftPrice(value), page: 1 }, true);
        }}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="listing-sort" className="text-xs font-medium text-muted">
          Sort
        </label>
        <select
          id="listing-sort"
          value={filters.sort ?? ""}
          className={fieldClass}
          onChange={(event) => {
            const sort = event.target.value;
            onChange({ sort: isSort(sort) ? sort : undefined, page: 1 });
          }}
        >
          <option value="">Recommended</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {priceRangeInvalid ? (
        <p id="listing-price-error" className="text-sm text-danger md:col-span-2 xl:col-span-5">
          Minimum price is higher than maximum price.
        </p>
      ) : null}
    </form>
  );
}
