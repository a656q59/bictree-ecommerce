export const homeDealCategory = "smartphones";

export const topCategories = [
  { slug: "mobile", label: "Mobile" },
  { slug: "cosmetics", label: "Cosmetics" },
  { slug: "electronics", label: "Electronics" },
  { slug: "furniture", label: "Furniture" },
  { slug: "watches", label: "Watches" },
  { slug: "decor", label: "Decor" },
  { slug: "accessories", label: "Accessories" },
] as const;

export const brandOffers = [
  { name: "Apple", query: "Apple", eyebrow: "IPHONE", surface: "bg-brand-ink", ink: "text-white" },
  { name: "realme", query: "realme", eyebrow: "REALME", surface: "bg-brand-gold", ink: "text-ink" },
  { name: "Xiaomi", query: "Xiaomi", eyebrow: "XIAOMI", surface: "bg-brand-peach", ink: "text-ink" },
] as const;
