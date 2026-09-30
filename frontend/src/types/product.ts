export type ProductSort = "price_asc" | "price_desc" | "newest";

export type ProductFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  q?: string;
  page?: number;
};

export type Variant = {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  size: string | null;
  color: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
  variants: Variant[];
};

export type ProductList = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
};
