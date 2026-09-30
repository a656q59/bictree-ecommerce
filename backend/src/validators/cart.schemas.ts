import { z } from "zod";

// 24-character hex ids only. Rejects objects and operators so they never reach MongoDB.
const objectIdSchema = (field: string) =>
  z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, `${field} must be a valid id`);

const quantitySchema = z
  .number()
  .int("quantity must be a positive integer")
  .positive("quantity must be a positive integer")
  .max(100, "quantity cannot exceed 100");

// Adding a line. Price is not accepted; the server reads it from the product.
export const addCartItemSchema = z
  .object({
    variantId: objectIdSchema("variantId"),
    quantity: quantitySchema,
  })
  .strict();

// PATCH replaces the line quantity. It does not add to the current quantity.
export const updateCartItemSchema = z
  .object({
    quantity: quantitySchema,
  })
  .strict();

export const cartItemParamsSchema = z
  .object({
    id: objectIdSchema("id"),
  })
  .strict();

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemParams = z.infer<typeof cartItemParamsSchema>;
