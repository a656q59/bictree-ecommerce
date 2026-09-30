import { apiClient } from "../api/client.ts";
import type { Cart } from "../../types/cart.ts";
import { normalizeCart } from "./normalize-cart.ts";

export type AddCartItemInput = {
  variantId: string;
  qty: number;
};

export async function getCart(signal?: AbortSignal): Promise<Cart> {
  const { data } = await apiClient.get<unknown>("/api/cart", { signal });
  return normalizeCart(data);
}

export async function addCartItem(input: AddCartItemInput): Promise<void> {
  // The cart API names this field quantity. The rest of the app calls it qty.
  await apiClient.post("/api/cart/items", {
    variantId: input.variantId,
    quantity: input.qty,
  });
}

export async function updateCartItem(id: string, qty: number): Promise<void> {
  await apiClient.patch(`/api/cart/items/${encodeURIComponent(id)}`, { quantity: qty });
}

export async function removeCartItem(id: string): Promise<void> {
  await apiClient.delete(`/api/cart/items/${encodeURIComponent(id)}`);
}
