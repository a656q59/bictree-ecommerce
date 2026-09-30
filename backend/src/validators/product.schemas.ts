import { z } from "zod";

const SORT_VALUES = ["price_asc", "price_desc", "newest", "name"] as const;

// Query strings arrive as text. Empty values fail instead of being coerced to 0.
function optionalNonNegativeNumber(field: string) {
  return z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, `${field} must be a non-negative number`)
    .transform((value) => Number(value))
    .optional();
}

// Unknown keys are rejected so a client cannot pass operators or extra fields
// that would change the MongoDB query.
export const productListQuerySchema = z
  .object({
    category: z.string().trim().min(1, "category cannot be empty").optional(),
    minPrice: optionalNonNegativeNumber("minPrice"),
    maxPrice: optionalNonNegativeNumber("maxPrice"),
    q: z.string().trim().min(1, "q cannot be empty").max(100, "q is too long").optional(),
    sort: z.enum(SORT_VALUES, { error: "sort must be price_asc, price_desc, newest, or name" }).optional(),
    page: z
      .string()
      .trim()
      .regex(/^[1-9]\d*$/, "page must be a positive integer")
      .transform((value) => Number(value))
      .optional(),
  })
  .strict()
  .superRefine((query, ctx) => {
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["minPrice"],
        message: "minPrice cannot be greater than maxPrice",
      });
    }
  });

export const productSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug"),
  })
  .strict();

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;
