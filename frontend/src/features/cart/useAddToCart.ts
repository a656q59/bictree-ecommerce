import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../../errors/api-error.ts";
import { queryKeys } from "../../query/keys.ts";
import { addCartItem, type AddCartItemInput } from "../../services/endpoints/cart.ts";

export function useAddToCart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (input: AddCartItemInput) => addCartItem(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      navigate("/cart");
    },
    onError: (error, variables) => {
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login", {
          state: { from: location.pathname, pendingItem: variables },
        });
      }
    },
  });
}
