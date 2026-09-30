/**
 * Repeatable product catalog for the assignment database.
 *
 * From the backend directory:
 *   npm run seed
 *
 * Requires MONGODB_URI in backend/.env. The script deletes these 30 slugs
 * (and any document still using their SKUs) and inserts them again, so a
 * second run does not create duplicates. Variant ids change on each run, so
 * an existing cart line may come back unavailable until the shopper re-adds it.
 *
 * minPrice and maxPrice are the lowest and highest variant prices. The Product
 * model recalculates them on save; they are set here as well so the seed data
 * shows the same meaning.
 */
import { connectDatabase, disconnectDatabase } from "../src/config/database";
import { ProductModel } from "../src/models/Product";

type SeedVariant = {
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
};

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  minPrice: number;
  maxPrice: number;
  variants: SeedVariant[];
};

const images = {
  tee: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  shirt: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
  hoodie: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  shoe: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  boot: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
  formal: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
  jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
  watch: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  smart: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
  tote: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  bag: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  backpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  speaker: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
};

function variant(sku: string, price: number, stock: number, attributes: Record<string, string>): SeedVariant {
  return { sku, price, stock, attributes };
}

function product(input: Omit<SeedProduct, "minPrice" | "maxPrice">): SeedProduct {
  const prices = input.variants.map((item) => item.price);
  return {
    ...input,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

// Six categories, five products each. Prices sit on the assignment's sample
// points (500, 999, 1499, 2999, 4999, 9999, 19999). A few variants use stock 0
// so cart and checkout can show an unavailable line.
const products: SeedProduct[] = [
  product({
    name: "Classic Cotton Crew",
    slug: "classic-cotton-crew",
    description: "Everyday cotton crew neck for warm weather.",
    category: "T-Shirts",
    images: [images.tee],
    variants: [
      variant("SEED-CREW-BLK-M", 500, 12, { color: "Black", size: "M" }),
      variant("SEED-CREW-BLK-L", 500, 8, { color: "Black", size: "L" }),
      variant("SEED-CREW-WHT-M", 500, 0, { color: "White", size: "M" }),
      variant("SEED-CREW-WHT-L", 500, 4, { color: "White", size: "L" }),
    ],
  }),
  product({
    name: "Nike Sports Tee",
    slug: "nike-sports-tee",
    description: "Lightweight Nike training tee with a quick-dry knit.",
    category: "T-Shirts",
    images: [images.tee],
    variants: [
      variant("SEED-NIKE-TEE-BLK-M", 999, 10, { color: "Black", size: "M" }),
      variant("SEED-NIKE-TEE-BLK-L", 999, 6, { color: "Black", size: "L" }),
      variant("SEED-NIKE-TEE-BLU-M", 999, 7, { color: "Blue", size: "M" }),
      variant("SEED-NIKE-TEE-BLU-L", 999, 3, { color: "Blue", size: "L" }),
    ],
  }),
  product({
    name: "Linen Summer Shirt",
    slug: "linen-summer-shirt",
    description: "Breathable linen shirt for hot afternoons.",
    category: "T-Shirts",
    images: [images.shirt],
    variants: [
      variant("SEED-LINEN-WHT-M", 1499, 5, { color: "White", size: "M" }),
      variant("SEED-LINEN-WHT-L", 1499, 5, { color: "White", size: "L" }),
      variant("SEED-LINEN-SND-M", 1499, 4, { color: "Sand", size: "M" }),
      variant("SEED-LINEN-SND-L", 1499, 0, { color: "Sand", size: "L" }),
    ],
  }),
  product({
    name: "Heavyweight Hoodie",
    slug: "heavyweight-hoodie",
    description: "Brushed fleece hoodie. Larger sizes cost a little more.",
    category: "T-Shirts",
    images: [images.hoodie],
    variants: [
      variant("SEED-HOODIE-BLK-M", 2999, 9, { color: "Black", size: "M" }),
      variant("SEED-HOODIE-BLK-L", 3499, 4, { color: "Black", size: "L" }),
      variant("SEED-HOODIE-GRY-M", 2999, 6, { color: "Grey", size: "M" }),
      variant("SEED-HOODIE-GRY-L", 3499, 2, { color: "Grey", size: "L" }),
    ],
  }),
  product({
    name: "Merino Wool Polo",
    slug: "merino-wool-polo",
    description: "Fine merino polo that holds its shape through the day.",
    category: "T-Shirts",
    images: [images.shirt],
    variants: [
      variant("SEED-POLO-NVY-M", 4999, 4, { color: "Navy", size: "M" }),
      variant("SEED-POLO-NVY-L", 4999, 3, { color: "Navy", size: "L" }),
      variant("SEED-POLO-BLK-M", 4999, 4, { color: "Black", size: "M" }),
      variant("SEED-POLO-BLK-L", 4999, 2, { color: "Black", size: "L" }),
    ],
  }),

  product({
    name: "Canvas Everyday Sneaker",
    slug: "canvas-everyday-sneaker",
    description: "Canvas sneaker with a cushioned insole for daily wear.",
    category: "Shoes",
    images: [images.shoe],
    variants: [
      variant("SEED-CANVAS-WHT-8", 999, 8, { color: "White", size: "8" }),
      variant("SEED-CANVAS-WHT-9", 999, 6, { color: "White", size: "9" }),
      variant("SEED-CANVAS-BLK-8", 999, 7, { color: "Black", size: "8" }),
      variant("SEED-CANVAS-BLK-9", 999, 5, { color: "Black", size: "9" }),
    ],
  }),
  product({
    name: "Nike Road Runner",
    slug: "nike-road-runner",
    description: "Nike road-running shoe with a foam midsole.",
    category: "Shoes",
    images: [images.shoe],
    variants: [
      variant("SEED-NIKE-RUN-BLK-8", 2999, 6, { color: "Black", size: "8" }),
      variant("SEED-NIKE-RUN-BLK-9", 2999, 4, { color: "Black", size: "9" }),
      variant("SEED-NIKE-RUN-WHT-9", 2999, 3, { color: "White", size: "9" }),
      variant("SEED-NIKE-RUN-WHT-10", 2999, 0, { color: "White", size: "10" }),
    ],
  }),
  product({
    name: "Leather Oxford",
    slug: "leather-oxford",
    description: "Polished leather oxford for formal wear.",
    category: "Shoes",
    images: [images.formal],
    variants: [
      variant("SEED-OXFORD-BRN-8", 4999, 3, { color: "Brown", size: "8" }),
      variant("SEED-OXFORD-BRN-9", 4999, 3, { color: "Brown", size: "9" }),
      variant("SEED-OXFORD-BLK-8", 4999, 2, { color: "Black", size: "8" }),
      variant("SEED-OXFORD-BLK-9", 4999, 2, { color: "Black", size: "9" }),
    ],
  }),
  product({
    name: "Trail Hiking Boot",
    slug: "trail-hiking-boot",
    description: "Waterproof hiking boot with a deep lug sole.",
    category: "Shoes",
    images: [images.boot],
    variants: [
      variant("SEED-BOOT-OLV-9", 9999, 4, { color: "Olive", size: "9" }),
      variant("SEED-BOOT-OLV-10", 9999, 3, { color: "Olive", size: "10" }),
      variant("SEED-BOOT-BRN-9", 9999, 2, { color: "Brown", size: "9" }),
      variant("SEED-BOOT-BRN-10", 9999, 2, { color: "Brown", size: "10" }),
    ],
  }),
  product({
    name: "Court Sneaker",
    slug: "court-sneaker",
    description: "Low court sneaker. Every size is currently out of stock.",
    category: "Shoes",
    images: [images.shoe],
    variants: [
      variant("SEED-COURT-WHT-8", 1499, 0, { color: "White", size: "8" }),
      variant("SEED-COURT-WHT-9", 1499, 0, { color: "White", size: "9" }),
      variant("SEED-COURT-BLK-8", 1499, 0, { color: "Black", size: "8" }),
      variant("SEED-COURT-BLK-9", 1499, 0, { color: "Black", size: "9" }),
    ],
  }),

  product({
    name: "Slim Stretch Jean",
    slug: "slim-stretch-jean",
    description: "Slim jean with a little stretch through the thigh.",
    category: "Jeans",
    images: [images.jeans],
    variants: [
      variant("SEED-SLIM-IND-30", 1499, 7, { color: "Indigo", waist: "30" }),
      variant("SEED-SLIM-IND-32", 1499, 6, { color: "Indigo", waist: "32" }),
      variant("SEED-SLIM-BLK-30", 1499, 5, { color: "Black", waist: "30" }),
      variant("SEED-SLIM-BLK-32", 1499, 4, { color: "Black", waist: "32" }),
    ],
  }),
  product({
    name: "Straight Raw Denim",
    slug: "straight-raw-denim",
    description: "Unwashed straight denim that fades with wear.",
    category: "Jeans",
    images: [images.jeans],
    variants: [
      variant("SEED-RAW-IND-30", 2999, 4, { color: "Indigo", waist: "30" }),
      variant("SEED-RAW-IND-32", 2999, 5, { color: "Indigo", waist: "32" }),
      variant("SEED-RAW-IND-34", 2999, 0, { color: "Indigo", waist: "34" }),
    ],
  }),
  product({
    name: "Everyday Skinny Jean",
    slug: "everyday-skinny-jean",
    description: "Skinny jean cut for a close fit.",
    category: "Jeans",
    images: [images.jeans],
    variants: [
      variant("SEED-SKINNY-BLK-30", 999, 8, { color: "Black", waist: "30" }),
      variant("SEED-SKINNY-BLK-32", 999, 6, { color: "Black", waist: "32" }),
      variant("SEED-SKINNY-BLU-30", 999, 5, { color: "Blue", waist: "30" }),
      variant("SEED-SKINNY-BLU-32", 999, 5, { color: "Blue", waist: "32" }),
    ],
  }),
  product({
    name: "Wide Leg Denim",
    slug: "wide-leg-denim",
    description: "Full-length wide leg denim with a high rise.",
    category: "Jeans",
    images: [images.jeans],
    variants: [
      variant("SEED-WIDE-ECR-30", 4999, 3, { color: "Ecru", waist: "30" }),
      variant("SEED-WIDE-ECR-32", 4999, 3, { color: "Ecru", waist: "32" }),
      variant("SEED-WIDE-IND-30", 4999, 2, { color: "Indigo", waist: "30" }),
      variant("SEED-WIDE-IND-32", 4999, 2, { color: "Indigo", waist: "32" }),
    ],
  }),
  product({
    name: "Selvedge Jean",
    slug: "selvedge-jean",
    description: "Selvedge denim woven on a narrow loom.",
    category: "Jeans",
    images: [images.jeans],
    variants: [
      variant("SEED-SELVEDGE-32", 9999, 3, { color: "Indigo", waist: "32" }),
      variant("SEED-SELVEDGE-34", 9999, 2, { color: "Indigo", waist: "34" }),
    ],
  }),

  product({
    name: "Classic Analog Watch",
    slug: "classic-analog-watch",
    description: "Three-hand analog watch on a slim strap.",
    category: "Watches",
    images: [images.watch],
    variants: [
      variant("SEED-ANALOG-BLK", 1499, 10, { color: "Black", strap: "Leather" }),
      variant("SEED-ANALOG-BRN", 1499, 8, { color: "Brown", strap: "Leather" }),
    ],
  }),
  product({
    name: "Steel Chronograph",
    slug: "steel-chronograph",
    description: "Stainless chronograph with a mineral crystal.",
    category: "Watches",
    images: [images.watch],
    variants: [
      variant("SEED-CHRONO-SLV", 9999, 4, { color: "Silver", strap: "Steel" }),
      variant("SEED-CHRONO-BLK", 9999, 0, { color: "Black", strap: "Steel" }),
    ],
  }),
  product({
    name: "Sport Digital Watch",
    slug: "sport-digital-watch",
    description: "Digital sports watch with a resin strap.",
    category: "Watches",
    images: [images.watch],
    variants: [
      variant("SEED-DIGITAL-BLK", 999, 14, { color: "Black", strap: "Resin" }),
      variant("SEED-DIGITAL-BLU", 999, 9, { color: "Blue", strap: "Resin" }),
    ],
  }),
  product({
    name: "Leather Dress Watch",
    slug: "leather-dress-watch",
    description: "Dress watch with a small second hand.",
    category: "Watches",
    images: [images.watch],
    variants: [
      variant("SEED-DRESS-BRN", 4999, 5, { color: "Brown", strap: "Leather" }),
      variant("SEED-DRESS-BLK", 4999, 4, { color: "Black", strap: "Leather" }),
    ],
  }),
  product({
    name: "Apex Smart Watch",
    slug: "apex-smart-watch",
    description: "Smart watch with heart-rate and notification alerts.",
    category: "Watches",
    images: [images.smart],
    variants: [
      variant("SEED-APEX-MDN", 19999, 6, { color: "Midnight", strap: "Silicone" }),
      variant("SEED-APEX-SLV", 19999, 0, { color: "Silver", strap: "Silicone" }),
    ],
  }),

  product({
    name: "Canvas Market Tote",
    slug: "canvas-market-tote",
    description: "Open canvas tote for markets and commuting.",
    category: "Bags",
    images: [images.tote],
    variants: [
      variant("SEED-TOTE-NAT", 500, 15, { color: "Natural", material: "Canvas" }),
      variant("SEED-TOTE-BLK", 500, 11, { color: "Black", material: "Canvas" }),
    ],
  }),
  product({
    name: "City Backpack",
    slug: "city-backpack",
    description: "Compact backpack with a padded laptop sleeve.",
    category: "Bags",
    images: [images.backpack],
    variants: [
      variant("SEED-PACK-BLK", 1499, 8, { color: "Black", material: "Nylon" }),
      variant("SEED-PACK-NVY", 1499, 0, { color: "Navy", material: "Nylon" }),
    ],
  }),
  product({
    name: "Weekend Duffel",
    slug: "weekend-duffel",
    description: "Soft duffel sized for a two-night trip.",
    category: "Bags",
    images: [images.bag],
    variants: [
      variant("SEED-DUFFEL-OLV", 2999, 5, { color: "Olive", material: "Canvas" }),
      variant("SEED-DUFFEL-CHR", 2999, 4, { color: "Charcoal", material: "Canvas" }),
    ],
  }),
  product({
    name: "Leather Messenger",
    slug: "leather-messenger",
    description: "Full-grain leather messenger with a flap closure.",
    category: "Bags",
    images: [images.bag],
    variants: [
      variant("SEED-MESSENGER-BRN", 4999, 3, { color: "Brown", material: "Leather" }),
      variant("SEED-MESSENGER-BLK", 4999, 3, { color: "Black", material: "Leather" }),
    ],
  }),
  product({
    name: "Evening Clutch",
    slug: "evening-clutch",
    description: "Small structured clutch for evening wear.",
    category: "Bags",
    images: [images.bag],
    variants: [
      variant("SEED-CLUTCH-BLK", 9999, 4, { color: "Black", material: "Leather" }),
      variant("SEED-CLUTCH-GLD", 9999, 2, { color: "Gold", material: "Leather" }),
    ],
  }),

  product({
    name: "Daily Earbuds",
    slug: "daily-earbuds",
    description: "Wired earbuds for calls and commuting.",
    category: "Audio",
    images: [images.audio],
    variants: [
      variant("SEED-BUDS-BLK", 999, 20, { color: "Black", connection: "Wired" }),
      variant("SEED-BUDS-WHT", 999, 16, { color: "White", connection: "Wired" }),
    ],
  }),
  product({
    name: "Studio Headphones",
    slug: "studio-headphones",
    description: "Closed studio headphones for tracking and editing.",
    category: "Audio",
    images: [images.audio],
    variants: [
      variant("SEED-STUDIO-BLK", 4999, 6, { color: "Black", connection: "Wired" }),
      variant("SEED-STUDIO-SLV", 4999, 0, { color: "Silver", connection: "Wired" }),
    ],
  }),
  product({
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    description: "Portable Bluetooth speaker with a 12-hour battery.",
    category: "Audio",
    images: [images.speaker],
    variants: [
      variant("SEED-SPEAKER-CHR", 2999, 9, { color: "Charcoal", connection: "Bluetooth" }),
      variant("SEED-SPEAKER-SND", 2999, 7, { color: "Sand", connection: "Bluetooth" }),
    ],
  }),
  product({
    name: "Noise Cancelling Headphones",
    slug: "noise-cancelling-headphones",
    description: "Over-ear headphones with active noise cancelling.",
    category: "Audio",
    images: [images.audio],
    variants: [
      variant("SEED-ANC-BLK", 9999, 5, { color: "Black", connection: "Bluetooth" }),
      variant("SEED-ANC-CRM", 9999, 3, { color: "Cream", connection: "Bluetooth" }),
    ],
  }),
  product({
    name: "Reference Monitors",
    slug: "reference-monitors",
    description: "Open reference headphones for critical listening.",
    category: "Audio",
    images: [images.audio],
    variants: [
      variant("SEED-REF-BLK", 19999, 4, { color: "Black", connection: "Wired" }),
      variant("SEED-REF-WHT", 19999, 0, { color: "White", connection: "Wired" }),
    ],
  }),
];

async function seed(): Promise<void> {
  await connectDatabase();

  try {
    const slugs = products.map((item) => item.slug);
    const skus = products.flatMap((item) => item.variants.map((entry) => entry.sku));

    // Clear the previous copy of this catalog before insert so unique slug
    // and SKU indexes do not reject the new documents.
    const removed = await ProductModel.deleteMany({
      $or: [{ slug: { $in: slugs } }, { "variants.sku": { $in: skus } }],
    });

    const created = await ProductModel.create(products);
    const zeroStock = created.reduce(
      (count, item) => count + item.variants.filter((entry) => entry.stock === 0).length,
      0,
    );
    const categories = new Set(created.map((item) => item.category));

    console.log(`Removed ${removed.deletedCount} previous seed products.`);
    console.log(`Inserted ${created.length} products in ${categories.size} categories.`);
    console.log(`Variants with stock 0: ${zeroStock}.`);
  } finally {
    await disconnectDatabase();
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
