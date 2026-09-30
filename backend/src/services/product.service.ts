import mongoose from "mongoose";
import { ProductModel } from "../models/Product";
import { AppError } from "../utils/AppError";
import type { ProductListQuery } from "../validators/product.schemas";

// Fixed page size. The listing query does not accept a client page size.
export const PRODUCT_PAGE_SIZE = 12;

const SORTS = {
  price_asc: { minPrice: 1, _id: 1 },
  price_desc: { minPrice: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  name: { name: 1, _id: 1 },
} as const;

type ProductSort = ProductListQuery["sort"];

function buildFilter(query: ProductListQuery): mongoose.QueryFilter<typeof ProductModel> {
  const filter: mongoose.QueryFilter<typeof ProductModel> = {};

  if (query.category !== undefined) {
    filter.category = query.category;
  }

  // minPrice on the query is a floor: keep products that still have a variant
  // at or above it. That is stored as maxPrice on the product.
  if (query.minPrice !== undefined) {
    filter.maxPrice = { $gte: query.minPrice };
  }

  // maxPrice on the query is a cap: keep products whose cheapest variant is
  // still inside it. That is stored as minPrice on the product.
  if (query.maxPrice !== undefined) {
    filter.minPrice = { $lte: query.maxPrice };
  }

  if (query.q !== undefined) {
    filter.$text = { $search: query.q };
  }

  return filter;
}

function isInvalidTextSearch(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 2;
}

export async function listProducts(query: ProductListQuery) {
  const page = query.page ?? 1;
  const sort: ProductSort = query.sort ?? "newest";
  const filter = buildFilter(query);
  const skip = (page - 1) * PRODUCT_PAGE_SIZE;

  try {
    // Filtering, sorting, and the page slice all happen in MongoDB.
    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter).sort(SORTS[sort]).skip(skip).limit(PRODUCT_PAGE_SIZE).lean(),
      ProductModel.countDocuments(filter),
    ]);

    return {
      products,
      currentPage: page,
      pageSize: PRODUCT_PAGE_SIZE,
      totalProducts,
      totalPages: totalProducts === 0 ? 0 : Math.ceil(totalProducts / PRODUCT_PAGE_SIZE),
    };
  } catch (error) {
    if (query.q !== undefined && isInvalidTextSearch(error)) {
      throw new AppError(400, "VALIDATION_ERROR", "Search text is not valid");
    }
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  const product = await ProductModel.findOne({ slug }).lean();

  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  return product;
}
