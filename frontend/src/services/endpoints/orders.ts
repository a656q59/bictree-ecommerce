import { apiClient } from "../api/client.ts";
import type { OrderConfirmation } from "../../types/order.ts";
import { normalizeOrder } from "./normalize-order.ts";

export async function createOrder(): Promise<OrderConfirmation> {
  const { data } = await apiClient.post<unknown>("/api/orders", {});
  return normalizeOrder(data);
}
