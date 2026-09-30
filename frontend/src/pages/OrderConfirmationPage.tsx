import { Link, useLocation, useParams } from "react-router-dom";

import { readRememberedOrder } from "../features/orders/order-storage.ts";
import type { OrderConfirmation } from "../types/order.ts";
import { formatInr } from "../utils/money.ts";

export function OrderConfirmationPage() {
  const { orderId = "" } = useParams();
  const location = useLocation();
  const order = orderFromState(location.state, orderId) ?? readRememberedOrder(orderId);

  if (!order) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-ink">Order confirmation</h1>
        <p className="mt-2 text-sm text-muted">
          This confirmation is no longer available on this device.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm font-medium text-success">Order placed</p>
      <h1 className="mt-2 text-2xl font-semibold break-all text-ink">Order {order.id}</h1>
      <p className="mt-3 text-sm text-muted">
        {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {formatInr(order.total)}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Continue shopping
      </Link>
    </section>
  );
}

function orderFromState(state: unknown, orderId: string): OrderConfirmation | null {
  if (typeof state !== "object" || state === null || !("order" in state)) {
    return null;
  }

  const order = state.order;
  if (typeof order !== "object" || order === null || !("id" in order) || !("total" in order)) {
    return null;
  }

  const confirmation = order as OrderConfirmation;
  return confirmation.id === orderId ? confirmation : null;
}
