import mongoose, { type InferSchemaType } from "mongoose";

// Variant attributes stay an open string map (color, size, storage, and so on).
// Categories do not share one fixed attribute set, so color and size are not schema fields.
function isStringAttributeMap(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every((entry) => typeof entry === "string");
}

// Embedded in Product. There is no Variant collection.
const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Floor of 0 is enforced here. Checkout still uses an atomic conditional
    // decrement so concurrent purchases cannot push stock below zero.
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: isStringAttributeMap,
        message: "Variant attributes must be an object of strings",
      },
    },
  },
  // Each variant gets its own _id. The cart stores that id; it does not store a price.
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    // Image URLs only. Files are not stored in MongoDB.
    images: {
      type: [String],
      default: [],
    },
    // Lowest variant price on this product.
    // Listing sorts price_asc / price_desc by this value, and a max-price
    // filter keeps products whose cheapest variant is still within the cap
    // (minPrice <= requested maxPrice).
    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // Highest variant price on this product.
    // A min-price filter keeps products that still have a variant at or above
    // the floor (maxPrice >= requested minPrice). The API never asks the
    // client to derive these two numbers.
    maxPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (variants: unknown[]) => variants.length > 0,
        message: "Product must include at least one variant",
      },
    },
  },
  { timestamps: true },
);

// Runs before required-field checks, so saved products cannot drift from
// their variant prices even if a caller passes stale minPrice / maxPrice.
productSchema.pre("validate", function () {
  if (this.variants.length === 0) {
    return;
  }

  const prices = this.variants.map((variant) => variant.price);
  this.minPrice = Math.min(...prices);
  this.maxPrice = Math.max(...prices);
});

// slug uniqueness is declared on the field above.
// variants.sku is unique across the whole collection, not just inside one product.
productSchema.index({ "variants.sku": 1 }, { unique: true });

// Category pages filter on category and usually sort by the "from" price.
productSchema.index({ category: 1, minPrice: 1 });

// Price sort and the minPrice <= maxFilter predicate when no category is selected.
productSchema.index({ minPrice: 1 });

// maxPrice >= minFilter predicate used by the minimum-price filter.
productSchema.index({ maxPrice: 1 });

// newest
productSchema.index({ createdAt: -1 });

// name
productSchema.index({ name: 1 });

// q= search. Name outweighs description so a title match ranks first.
// Combined with the indexes above; search is not done by loading every product.
productSchema.index(
  { name: "text", description: "text" },
  { name: "product_text_search", weights: { name: 5, description: 1 } },
);

export type Variant = InferSchemaType<typeof variantSchema>;
export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = mongoose.HydratedDocument<Product>;

export const ProductModel = mongoose.model("Product", productSchema);
