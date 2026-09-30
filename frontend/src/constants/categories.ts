import { homeDealCategory, topCategories } from "./home.ts";
import { storeCategories } from "./navigation.ts";

export type ListingCategory = {
  slug: string;
  label: string;
};

const extras: ListingCategory[] = [{ slug: homeDealCategory, label: "Smartphones" }];

export const listingCategories: ListingCategory[] = [];

const seen = new Set<string>();
for (const category of [...storeCategories, ...topCategories, ...extras]) {
  if (seen.has(category.slug)) {
    continue;
  }
  seen.add(category.slug);
  listingCategories.push({ slug: category.slug, label: category.label });
}

export function categoryLabel(slug: string): string {
  return listingCategories.find((category) => category.slug === slug)?.label ?? slug.replaceAll("-", " ");
}
