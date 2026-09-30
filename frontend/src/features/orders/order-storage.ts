import type { OrderConfirmation } from "../../types/order.ts";

function storageKey(id: string): string {
  return `megamart.order.${id}`;
}

export function rememberOrder(order: OrderConfirmation): void {
  sessionStorage.setItem(storageKey(order.id), JSON.stringify(order));
}

export function readRememberedOrder(id: string): OrderConfirmation | null {
  const raw = sessionStorage.getItem(storageKey(id));
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("id" in parsed) || !("total" in parsed)) {
      return null;
    }

    return parsed as OrderConfirmation;
  } catch {
    return null;
  }
}
