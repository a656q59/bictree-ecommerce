import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ImageWithFallback } from "../components/common/ImageWithFallback.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { QuantityStepper } from "../components/ui/QuantityStepper.tsx";
import { categoryLabel } from "../constants/categories.ts";
import { ApiError } from "../errors/api-error.ts";
import { useAddToCart } from "../features/cart/useAddToCart.ts";
import { useProduct } from "../features/catalog/useProduct.ts";
import type { Product } from "../types/product.ts";
import { discountPercent, displayVariant, formatInr, savingsAmount } from "../utils/money.ts";
import { choiceFromVariant, chooseVariantOption, matchVariant, optionValues } from "../utils/variants.ts";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const product = useProduct(slug);
  const message =
    product.error instanceof ApiError ? product.error.message : "The product could not be loaded.";
  const missing = product.error instanceof ApiError && product.error.status === 404;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {product.isPending ? <DetailSkeleton /> : null}
      {product.isError ? (
        <ErrorState
          title={missing ? "Product not found" : "Product is unavailable"}
          message={message}
          onRetry={missing ? undefined : () => void product.refetch()}
          retrying={product.isFetching}
        />
      ) : null}
      {product.isSuccess ? <ProductPurchase key={product.data.id} product={product.data} /> : null}
    </div>
  );
}

function ProductPurchase({ product }: { product: Product }) {
  const [choice, setChoice] = useState(() => choiceFromVariant(displayVariant(product)));
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const addToCart = useAddToCart();
  const variant = matchVariant(product.variants, choice);
  const colors = optionValues(product.variants, "color");
  const sizes = optionValues(product.variants, "size");
  const price = variant?.price ?? displayVariant(product)?.price ?? 0;
  const compareAt = variant?.compareAtPrice ?? null;
  const percent = discountPercent(price, compareAt);
  const saved = savingsAmount(price, compareAt);
  const stock = variant?.stock ?? 0;
  const image = product.images[imageIndex] ?? product.images[0] ?? null;
  const buyError = addToCart.error instanceof ApiError && addToCart.error.status !== 401 ? addToCart.error.message : null;

  function choose(key: "color" | "size", value: string) {
    setChoice((current) => chooseVariantOption(product.variants, current, key, value));
    setQty(1);
  }

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div>
        <ImageWithFallback
          key={image ?? product.id}
          src={image}
          alt={product.name}
          className="h-80 w-full rounded-2xl border border-line object-contain"
        />
        {product.images.length > 1 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((src, index) => (
              <li key={`${src}-${index}`} className="shrink-0">
                <button
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === imageIndex}
                  onClick={() => setImageIndex(index)}
                  className={`rounded-lg border p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    index === imageIndex ? "border-primary" : "border-line"
                  }`}
                >
                  <ImageWithFallback src={src} alt="" className="size-16 object-contain" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          {product.category ? (
            <>
              <span aria-hidden="true"> / </span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
                {categoryLabel(product.category)}
              </Link>
            </>
          ) : null}
          <span aria-hidden="true"> / </span>
          <span className="text-ink">{product.name}</span>
        </nav>
        <h1 className="mt-3 text-2xl font-semibold break-words text-ink">{product.name}</h1>
        {product.brand ? <p className="mt-1 text-sm text-muted">{product.brand}</p> : null}
        <p className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-semibold text-ink">{formatInr(price)}</span>
          {compareAt !== null && compareAt > price ? (
            <span className="text-sm text-muted line-through">{formatInr(compareAt)}</span>
          ) : null}
          {percent !== null ? (
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white">{percent}% OFF</span>
          ) : null}
        </p>
        {saved !== null ? <p className="mt-1 text-sm font-medium text-success">Save - {formatInr(saved)}</p> : null}

        {colors.length > 0 ? (
          <OptionGroup label="Colour" values={colors} selected={choice.color} onSelect={(value) => choose("color", value)} />
        ) : null}
        {sizes.length > 0 ? (
          <OptionGroup label="Size" values={sizes} selected={choice.size} onSelect={(value) => choose("size", value)} />
        ) : null}

        <p className="mt-4 text-sm font-medium text-ink">{stockMessage(variant !== null, stock)}</p>
        {variant ? <p className="mt-1 text-xs text-muted">SKU {variant.sku}</p> : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <QuantityStepper value={Math.min(qty, Math.max(stock, 1))} max={stock} onChange={setQty} disabled={stock < 1} />
          <button
            type="button"
            disabled={!variant || stock < 1 || addToCart.isPending}
            onClick={() => {
              if (!variant || stock < 1) return;
              addToCart.mutate({ variantId: variant.id, qty: Math.min(qty, stock) });
            }}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addToCart.isPending ? "Adding..." : "Buy"}
          </button>
        </div>
        {buyError ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {buyError}
          </p>
        ) : null}
        {product.description ? (
          <p className="mt-6 text-sm leading-6 break-words whitespace-pre-wrap text-ink">{product.description}</p>
        ) : null}
      </div>
    </article>
  );
}

function OptionGroup({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => {
          const active = value === selected;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(value)}
              className={`rounded-full border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active ? "border-primary bg-primary text-white" : "border-line text-ink hover:border-primary"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function stockMessage(availableCombination: boolean, stock: number): string {
  if (!availableCombination) return "That combination is not available.";
  if (stock <= 0) return "Out of stock";
  if (stock < 5) return `Only ${stock} left`;
  return "In stock";
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2" aria-hidden="true">
      <div className="h-80 animate-pulse rounded-2xl bg-surface" />
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-surface" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-surface" />
        <div className="h-6 w-32 animate-pulse rounded bg-surface" />
        <div className="h-10 w-48 animate-pulse rounded-full bg-surface" />
      </div>
    </div>
  );
}
