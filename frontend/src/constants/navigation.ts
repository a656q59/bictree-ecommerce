export type StoreCategory = {
  slug: string;
  label: string;
};

export const storeCategories: StoreCategory[] = [
  { slug: "groceries", label: "Groceries" },
  { slug: "premium-fruits", label: "Premium Fruits" },
  { slug: "home-kitchen", label: "Home & Kitchen" },
  { slug: "fashion", label: "Fashion" },
  { slug: "electronics", label: "Electronics" },
  { slug: "beauty", label: "Beauty" },
  { slug: "home-improvement", label: "Home Improvement" },
  { slug: "sports-toys-luggage", label: "Sports, Toys & Luggage" },
];

export const deliveryPincode = "423651";
