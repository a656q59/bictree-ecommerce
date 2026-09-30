import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ImageWithFallback } from "../components/common/ImageWithFallback.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { QuantityStepper } from "../components/ui/QuantityStepper.tsx";
import { ApiError } from "../errors/api-error.ts";
import { useCart, useCheckout, useRemoveCartItem, useUpdateCartItem } from "../features/cart/useCart.ts";
import { canCheckout } from "../services/endpoints/normalize-cart.ts";
import type { CartLine } from "../types/cart.ts";
import { formatInr } from "../utils/money.ts";

export function CartPage() {
  const cart = useCart();
  const checkout = useCheckout();
  const unauthenticated = cart.error instanceof ApiError && cart.error.status === 401;
  const message = cart.error instanceof ApiError ? cart.error.message : "The cart could not be loaded.";
  const checkoutMessage =
    checkout.error instanceof ApiError && checkout.error.status !== 401 ? checkout.error.message : null;
  const blocked = cart.data ? !canCheckout(cart.data) : true;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Cart</h1>
      {cart.isPending ? <CartSkeleton /> : null}
      {unauthenticated ? <SignInRedirect /> : null}
      {cart.isError && !unauthenticated ? (
        <ErrorState
          title="Cart is unavailable"
          message={message}
          onRetry={() => void cart.refetch()}
          retrying={cart.isFetching}
        />
      ) : null}
      {cart.isSuccess && cart.data.items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Add a product to see it here."
          actionLabel="Browse products"
          actionTo="/products"
        />
      ) : null}
      {cart.isSuccess && cart.data.items.length > 0 ? (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <ul className="flex flex-col gap-4">
            {cart.data.items.map((line) => (
              <CartLineRow key={line.id} line={line} />
            ))}
          </ul>
          <aside className="rounded-2xl border border-line p-5">
            <h2 className="text-sm font-medium text-muted">Order total</h2>
            <p className="mt-2 text-2xl font-semibold text-ink">{formatInr(cart.data.subtotal)}</p>
            {blocked ? (
              <p className="mt-3 text-sm text-danger">
                Update the unavailable items before checkout.
              </p>
            ) : null}
            {checkoutMessage ? (
              <p className="mt-3 text-sm text-danger" role="alert">
                {checkoutMessage}
              </p>
            ) : null}
            <button
              type="button"
              disabled={blocked || checkout.isPending}
              onClick={() => checkout.mutate()}
              className="mt-5 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkout.isPending ? "Placing order..." : "Checkout"}
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const lineError =
    (update.error instanceof ApiError && update.error.status !== 401 ? update.error.message : null) ??
    (remove.error instanceof ApiError && remove.error.status !== 401 ? remove.error.message : null);

  function commitQty(next: number) {
    const decreasing = next < line.qty;
    if (next < 1 || next === line.qty) {
      return;
    }
    if (!decreasing && next > line.stock) {
      return;
    }
    update.mutate({ id: line.id, qty: next });
  }

  return (
    <li className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 rounded-2xl border border-line p-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto]">
      <ImageWithFallback src={line.image} alt="" className="h-20 w-20 rounded-lg object-contain" />
      <div className="min-w-0">
        {line.productSlug ? (
          <Link to={`/products/${line.productSlug}`} className="font-medium break-words text-ink hover:text-primary">
            {line.productName}
          </Link>
        ) : (
          <p className="font-medium break-words text-ink">{line.productName}</p>
        )}
        {line.variantLabel ? <p className="mt-1 text-sm text-muted">{line.variantLabel}</p> : null}
        <p className="mt-1 text-sm text-ink">{formatInr(line.unitPrice)}</p>
        {!line.available ? (
          <p className="mt-2 text-sm text-danger">This item is no longer available.</p>
        ) : null}
        {line.available && line.qty > line.stock ? (
          <p className="mt-2 text-sm text-danger">Only {line.stock} left. Lower the quantity before checkout.</p>
        ) : null}
        {lineError ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {lineError}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={line.qty}
            max={Math.max(line.stock, line.qty)}
            onChange={commitQty}
            disabled={!line.available || update.isPending}
          />
          <button
            type="button"
            onClick={() => remove.mutate(line.id)}
            disabled={remove.isPending}
            className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            {remove.isPending ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
      <p className="col-start-2 text-sm font-semibold text-ink sm:col-start-auto sm:text-right">
        {formatInr(line.lineTotal)}
      </p>
    </li>
  );
}

function SignInRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true, state: { from: "/cart" } });
  }, [navigate]);

  return <p className="text-sm text-muted">Sign in is required to view your cart.</p>;
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}
