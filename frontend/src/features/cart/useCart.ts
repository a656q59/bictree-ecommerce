import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../../errors/api-error.ts";
import { queryKeys } from "../../query/keys.ts";
import { getCart, removeCartItem, updateCartItem } from "../../services/endpoints/cart.ts";
import { createOrder } from "../../services/endpoints/orders.ts";
import { rememberOrder } from "../orders/order-storage.ts";

function useSendToLogin() {
  const navigate = useNavigate();

  return (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      navigate("/login", { state: { from: "/cart" } });
    }
  };
}

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: ({ signal }) => getCart(signal),
    refetchOnWindowFocus: true,
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const sendToLogin = useSendToLogin();

  return useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => updateCartItem(id, qty),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error) => {
      sendToLogin(error);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const sendToLogin = useSendToLogin();

  return useMutation({
    mutationFn: (id: string) => removeCartItem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error) => {
      sendToLogin(error);
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const sendToLogin = useSendToLogin();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: async (order) => {
      try {
        rememberOrder(order);
      } catch {
        // The confirmation still travels with the route for this visit.
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      navigate(`/orders/${order.id}`, { state: { order } });
    },
    onError: async (error) => {
      sendToLogin(error);
      if (error instanceof ApiError && error.status === 409) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      }
    },
  });
}
