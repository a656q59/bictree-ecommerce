import { Link } from "react-router-dom";

import type { Product } from "../../types/product.ts";
import { discountPercent, displayVariant, formatInr, savingsAmount } from "../../utils/money.ts";
import { ImageWithFallback } from "./ImageWithFallback.tsx";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const variant = displayVariant(product);
  const price = variant?.price ?? 0;
  const compareAt = variant?.compareAtPrice ?? null;
  const percent = discountPercent(price, compareAt);
  const saved = savingsAmount(price, compareAt);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="flex h-full flex-col rounded-xl border border-line bg-canvas p-3 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative">
        {percent !== null ? (
          <span className="absolute top-2 left-2 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-white">
            {percent}% OFF
          </span>
        ) : null}
        <ImageWithFallback
          key={product.images[0] ?? product.id}
          src={product.images[0]}
          alt=""
          className="mx-auto h-36 w-full object-contain"
        />
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-ink">{product.name}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="font-semibold text-ink">{formatInr(price)}</span>
        {compareAt !== null && compareAt > price ? (
          <span className="text-sm text-muted line-through">{formatInr(compareAt)}</span>
        ) : null}
      </p>
      <p className="mt-1 min-h-5 text-sm font-medium text-success">
        {saved !== null ? `Save - ${formatInr(saved)}` : ""}
      </p>
    </Link>
  );
}
