import { z } from "zod";

const orderItemSchema = z
  .object({
    variantId: z.string().regex(/^[a-fA-F0-9]{24}$/, "variantId must be a valid id"),
    quantity: z
      .number()
      .int("quantity must be a positive integer")
      .positive("quantity must be a positive integer")
      .max(100, "quantity cannot exceed 100"),
  })
  .strict();

// Checkout reads the authenticated user's cart from the database.
// items is optional so clients can post an empty body {} to checkout the entire cart.
export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "Order must include at least one item").optional(),
  })
  .strict()
  .optional()
  .default({});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

