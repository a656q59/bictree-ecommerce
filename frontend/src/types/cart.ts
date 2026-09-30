export type CartLine = {
  id: string;
  variantId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  variantLabel: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  available: boolean;
};

export type Cart = {
  items: CartLine[];
  subtotal: number;
  currency: string;
};
