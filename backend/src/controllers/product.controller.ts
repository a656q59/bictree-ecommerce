import type { NextFunction, Request, Response } from "express";
import * as productService from "../services/product.service";
import { sendSuccess } from "../utils/response";
import type { ProductListQuery, ProductSlugParams } from "../validators/product.schemas";

// Query and slug were parsed by validate(). This function only sets the HTTP response.
export function listProducts(req: Request, res: Response, next: NextFunction): void {
  productService
    .listProducts(req.validatedQuery as ProductListQuery)
    .then((result) => sendSuccess(res, result))
    .catch(next);
}

export function getProduct(req: Request, res: Response, next: NextFunction): void {
  const params = req.validatedParams as ProductSlugParams;

  productService
    .getProductBySlug(params.slug)
    .then((product) => sendSuccess(res, product))
    .catch(next);
}
