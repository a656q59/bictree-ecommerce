import { ProductCard } from "../../components/common/ProductCard.tsx";
import { SectionHeader } from "../../components/common/SectionHeader.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { ErrorState } from "../../components/ui/ErrorState.tsx";
import { ProductGridSkeleton } from "../../components/ui/ProductGridSkeleton.tsx";
import { homeDealCategory } from "../../constants/home.ts";
import { ApiError } from "../../errors/api-error.ts";
import { useProducts } from "./useProducts.ts";

const filters = { category: homeDealCategory, page: 1 };

export function HomeDeals() {
  const products = useProducts(filters);
  const message =
    products.error instanceof ApiError
      ? products.error.message
      : "The deals could not be loaded.";

  return (
    <section aria-busy={products.isPending} className="flex flex-col gap-4">
      <SectionHeader
        title="Grab the best deal on "
        highlight="Smartphones"
        to={`/products?category=${homeDealCategory}`}
      />
      {products.isPending ? <ProductGridSkeleton /> : null}
      {products.isError ? (
        <ErrorState
          title="Smartphone deals are unavailable"
          message={message}
          onRetry={() => void products.refetch()}
          retrying={products.isFetching}
        />
      ) : null}
      {products.isSuccess && products.data.items.length === 0 ? (
        <EmptyState
          title="No smartphone deals yet"
          message="There are no products in this category right now."
          actionLabel="Browse all products"
          actionTo="/products"
        />
      ) : null}
      {products.isSuccess && products.data.items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.data.items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
