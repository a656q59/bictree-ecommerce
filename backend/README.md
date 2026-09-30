# E-Commerce Backend Service

A high-concurrency, transaction-safe e-commerce REST API built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB / Mongoose**. 

Engineered for data integrity under high traffic, featuring **dynamic stale-cart detection**, **atomic stock decrement**, and **ACID multi-document transactions** that eliminate race conditions and prevent overselling.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime & Language** | Node.js (v18+), TypeScript 5.9 (Strict mode) |
| **Framework & Routing** | Express 5.2, CORS, Zod 4.6 (Runtime validation) |
| **Database & ODM** | MongoDB 6+ (Replica Set required for ACID transactions), Mongoose 9.10 |
| **Security & Auth** | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`, 10 rounds, constant-time compare) |
| **Tooling & Tests** | `ts-node-dev` (hot reload), Jest 30, `ts-jest` |

---

## Setup & Environment

### Prerequisites
- **Node.js** v18+ & npm
- **MongoDB 6.0+** running as a **Replica Set** (`mongod --replSet rs0` or MongoDB Atlas cluster). Transactions require a replica set.

### Installation
```bash
cd backend
npm install
cp .env.example .env
```

### Environment Variables
Validated at boot via Zod in `src/config/env.ts` and deeply frozen (`Object.freeze`):

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | HTTP listening port (positive integer) |
| `MONGODB_URI` | Yes | — | MongoDB URI (e.g. `mongodb://localhost:27017/ecommerce?replicaSet=rs0`) |
| `JWT_SECRET` | Yes | — | Secret string for signing/verifying JWTs |

---

## Running the Application

```bash
# Development (with hot-reload via ts-node-dev)
npm run dev

# Production Build & Start
npm run build
npm start

# Health Check
curl http://localhost:5000/api/health
# {"success":true,"data":{"status":"ok"}}
```

### Running the Seed Script
Populates **30 products across 6 categories** with real variant combinations and intentionally includes zero-stock items (e.g. `SEED-CREW-WHT-M`) for testing out-of-stock and stale-cart scenarios:
```bash
npm run seed
```
*Note: The script is idempotent; it safely purges matching seed slugs and SKUs before re-inserting.*

### Running Tests
```bash
npm test
```

---

## Database Schema & Indexes

All models automatically initialize and build indexes at boot via `Promise.all([...init()])` in `src/config/database.ts`.

### 1. `User` (`src/models/User.ts`)
- `name` (String, 1-100 chars), `email` (String, unique, lowercase, trimmed), `passwordHash` (String, `select: false`), timestamps.
- **Index**: `{ email: 1 }` (unique) for fast lookup and collision prevention.

### 2. `Product` (`src/models/Product.ts`)
- `name`, `slug` (unique), `description`, `category`, `images` (`string[]`), `minPrice` & `maxPrice` (auto-derived pre-validation from variants), timestamps.
- Embedded `variants` (`_id: true`): `sku` (globally unique), `price` ($\ge 0$), `stock` (integer $\ge 0$), `attributes` (`Record<string, string>`).
- **Indexes**:
  - `{ slug: 1 }` (unique) — $O(1)$ product retrieval by slug.
  - `{ "variants.sku": 1 }` (unique) — Global SKU uniqueness across all products.
  - `{ category: 1, minPrice: 1 }` — Category filtering and price sorting.
  - `{ minPrice: 1 }`, `{ maxPrice: 1 }` — Range filtering and sorting.
  - `{ createdAt: -1 }`, `{ name: 1 }` — Newest and alphabetical sorting.
  - `{ name: "text", description: "text" }` (weights: name 5, description 1) — Keyword text search.

### 3. `Cart` (`src/models/Cart.ts`)
- `userId` (ObjectId, unique ref to User), timestamps.
- Embedded `items` (`_id: true`): `variantId` (ObjectId), `quantity` (1–100).
- **Security Design**: **Price is intentionally absent.** The cart stores only quantities and variant IDs. Prices are dynamically resolved from the catalog to prevent client tampering.
- **Index**: `{ userId: 1 }` (unique) — Enforces exactly one cart per customer.

### 4. `Order` (`src/models/Order.ts`)
- `userId` (ObjectId), `totalAmount` (Number, server-calculated), `status` (`PENDING | CONFIRMED | CANCELLED`), timestamps.
- Embedded `items` (`_id: false`): Snapshot of `productId`, `productName`, `variantId`, `sku`, `quantity`, and `purchasePrice` frozen at checkout.
- **Index**: `{ userId: 1, createdAt: -1 }` — Order history retrieval.

---

## Authentication Flow

1. **Registration (`POST /api/auth/register`)**: Validates input (8–72 char password, email format), hashes password via bcrypt (10 rounds), creates user, signs JWT with `{ sub: user.id }` (expires in 7 days).
2. **Login (`POST /api/auth/login`)**: Queries user by email with `+passwordHash`. If user is missing, runs `bcrypt.compare` against `DUMMY_PASSWORD_HASH` to prevent timing-attack email enumeration. Returns signed JWT and user profile.
3. **Guard (`requireAuth` Middleware)**: Parses `Authorization: Bearer <token>`, verifies signature with `JWT_SECRET`, checks that user still exists in MongoDB, and attaches `req.user = { id, name, email }`.

---

## Product Catalog Engine

- **Full-Text Search (`q`)**: Searches `$text: { $search: q }` against weighted name/description text index.
- **Category Filter (`category`)**: Exact category match.
- **Price Bounds (`minPrice`, `maxPrice`)**: Matches products where `maxPrice >= minPriceFilter` and `minPrice <= maxPriceFilter`.
- **Sorting (`sort`)**: Mapped to `price_asc` (`minPrice: 1`), `price_desc` (`minPrice: -1`), `newest` (`createdAt: -1`), or `name` (`name: 1`), all tie-broken with `_id: 1`.
- **Pagination (`page`)**: Fixed page size of 12. Executes `find()` and `countDocuments()` concurrently via `Promise.all()`.

---

## Cart Design & Optimistic Locking

- Adding an existing variant merges quantities (max 100).
- Guarded by Mongoose document versioning (`__v`). Concurrent cart writes retry up to 3 times on `VersionError` or duplicate key creation conflicts.

---

## Assignment-Critical Scenario 1: Stale-Cart Handling

> **Rule**: Current variant stock is checked dynamically when retrieving the cart and again during checkout. The cart does not silently change the user's requested quantity.

1. **Dynamic Live Availability on Fetch (`GET /api/cart`)**:
   `cart.service.ts` joins cart items with live variant documents in MongoDB. For every line:
   ```typescript
   availableStock = variant?.stock ?? 0;
   available = variant !== undefined && availableStock >= item.quantity;
   ```
2. **No Silent Clamping**:
   If a user requested 5 units and stock drops to 2 (or 0), the stored cart quantity **remains 5**. The API returns `quantity: 5, available: false, availableStock: 2`. The cart does not silently mutate quantities behind the customer's back.
3. **Re-Verification at Checkout**:
   Checkout verifies live inventory inside the transaction and rejects stale lines with `409 INSUFFICIENT_STOCK`.

---

## Order Design & Server-Side Totals

- **Tamper-Proof Totals**: The client never supplies prices or order totals. During checkout, live prices are read directly from MongoDB variants within the database session:
  $$\text{totalAmount} = \sum (\text{item.quantity} \times \text{variant.price})$$
- **Immutable Snapshot**: Order lines copy product name, SKU, and price at purchase time, isolating past orders from future catalog edits.

---

## Assignment-Critical Scenario 2: Atomic Stock Decrement & Concurrency Control

> **Rule**: Stock is decremented using an atomic conditional MongoDB update requiring `stock >= requestedQuantity`. The checkout operations are wrapped in a MongoDB transaction so stock, order creation, and cart clearing remain consistent.

### 1. Atomic Conditional Decrement
To eliminate Time-of-Check to Time-of-Use (TOCTOU) race conditions, stock is decremented at the database engine level inside [`src/services/order.service.ts`](file:///d:/bictree%20assignment/ecommerce/backend/src/services/order.service.ts):

```typescript
async function decrementStock(line: ResolvedLine, session: mongoose.ClientSession): Promise<void> {
  const result = await ProductModel.updateOne(
    {
      _id: line.product._id,
      variants: {
        $elemMatch: {
          _id: line.variantId,
          stock: { $gte: line.quantity }, // ATOMIC PRE-CONDITION
        },
      },
    },
    { $inc: { "variants.$.stock": -line.quantity } }, // ATOMIC DECREMENT
    { session },
  );

  if (result.matchedCount !== 1) {
    throw new AppError(409, "INSUFFICIENT_STOCK", "Requested quantity is not available");
  }
}
```

### 2. MongoDB Multi-Document ACID Transaction
All checkout operations run inside `session.withTransaction()`:
1. Load user's cart in session.
2. Resolve current variants and live prices.
3. **Sort lines deterministically** by `productId` and `variantId` to prevent cross-transaction deadlocks.
4. Execute atomic conditional decrement for every line.
5. Create order document (`status: "CONFIRMED"`).
6. Clear user cart (`cart.items = []`).

**Rollback Guarantee**: If any line item fails stock verification or any error occurs, the entire transaction automatically aborts. All stock decrements are restored, no order is persisted, and the user's cart remains intact.

### 3. How Overselling is Prevented
- **No In-Memory Race**: If 2 concurrent requests compete for the last item (`stock = 1`), only one update will match `$gte: 1`. The loser matches 0 documents, throws `409 INSUFFICIENT_STOCK`, and rolls back.
- **No Stock Leak**: If Item 1 decrements successfully but Item 2 has insufficient stock, the transaction rollback restores Item 1's stock immediately.

---

## Concurrency Test Strategy & Results

Simulate 10 concurrent checkout requests competing for a variant with only 5 units in stock using `Promise.allSettled()`:

```typescript
// 1. Setup: Variant created with stock = 5; 10 users have 1 unit in their carts
// 2. Dispatch all 10 checkouts simultaneously:
const results = await Promise.allSettled(userIds.map(id => orderService.createOrder(id)));

// 3. Expected Verified Outcome:
expect(results.filter(r => r.status === "fulfilled").length).toBe(5); // Exactly 5 succeed (HTTP 201)
expect(results.filter(r => r.status === "rejected").length).toBe(5);  // Exactly 5 fail (HTTP 409)

// 4. Invariant: Database variant stock is exactly 0 (never negative)
const product = await ProductModel.findById(productId);
expect(product.variants[0].stock).toBe(0);
```

---

## API Endpoints Reference

All responses follow standard envelopes: `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | Liveness probe (`{ status: "ok" }`) |
| `POST` | `/api/auth/register` | No | Register (`{ email, password, confirmPassword }`) |
| `POST` | `/api/auth/login` | No | Login (`{ email, password }`) |
| `GET` | `/api/auth/me` | Yes | Get authenticated user profile |
| `GET` | `/api/products` | No | List products (`category`, `minPrice`, `maxPrice`, `q`, `sort`, `page`) |
| `GET` | `/api/products/:slug` | No | Get single product by slug |
| `GET` | `/api/cart` | Yes | Get user cart with live `available` & `availableStock` |
| `POST` | `/api/cart/items` | Yes | Add item `{ variantId, quantity }` (merges duplicates) |
| `PATCH`| `/api/cart/items/:id` | Yes | Update item quantity `{ quantity }` |
| `DELETE`| `/api/cart/items/:id`| Yes | Remove item from cart |
| `POST` | `/api/orders` | Yes | Checkout user cart (accepts `{}` or optional `{ items: [...] }`) |

---

## Request & Response Examples

### 1. Register & Login
`POST /api/auth/login`
```json
// Request
{ "email": "shopper@example.com", "password": "SecretPassword123" }

// Response (200 OK)
{
  "success": true,
  "data": {
    "user": { "id": "66f917578e3914a1c5e42a05", "name": "shopper", "email": "shopper@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get Cart (Showing Live Stale-Stock Flags)
`GET /api/cart` (Header: `Authorization: Bearer <token>`)
```json
{
  "success": true,
  "data": {
    "id": "66f919a08e3914a1c5e42c01",
    "items": [
      {
        "id": "66f919a08e3914a1c5e42c02",
        "variantId": "66f918808e3914a1c5e42b02",
        "quantity": 2,
        "available": true,
        "availableStock": 12,
        "product": { "id": "66f918808e3914a1c5e42b01", "name": "Classic Cotton Crew", "slug": "classic-cotton-crew" },
        "variant": { "sku": "SEED-CREW-BLK-M", "price": 500, "attributes": { "color": "Black", "size": "M" } }
      },
      {
        "id": "66f919a08e3914a1c5e42c05",
        "variantId": "66f918808e3914a1c5e42b03",
        "quantity": 3,
        "available": false,
        "availableStock": 0,
        "product": { "id": "66f918808e3914a1c5e42b01", "name": "Classic Cotton Crew", "slug": "classic-cotton-crew" },
        "variant": { "sku": "SEED-CREW-WHT-M", "price": 500, "attributes": { "color": "White", "size": "M" } }
      }
    ]
  }
}
```

### 3. Checkout Order
`POST /api/orders` (Header: `Authorization: Bearer <token>`, Body: `{}`)

**Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "66f91be08e3914a1c5e42d99",
    "items": [
      {
        "productId": "66f918808e3914a1c5e42b01",
        "productName": "Classic Cotton Crew",
        "variantId": "66f918808e3914a1c5e42b02",
        "sku": "SEED-CREW-BLK-M",
        "quantity": 2,
        "purchasePrice": 500
      }
    ],
    "totalAmount": 1000,
    "status": "CONFIRMED",
    "createdAt": "2026-09-30T10:00:00.000Z"
  }
}
```

**Conflict / Overselling Prevented (409 Conflict)**:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Requested quantity is not available"
  }
}
```

### 4. Common Error Codes
| Status | Code | Cause |
| :---: | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Schema validation failure, malformed ID, invalid query |
| `400` | `CART_EMPTY` | Checkout attempted on an empty cart |
| `401` | `UNAUTHORIZED` | Missing, malformed, or expired Bearer token |
| `401` | `INVALID_CREDENTIALS` | Incorrect email or password |
| `404` | `PRODUCT_NOT_FOUND` | Product slug does not exist |
| `409` | `INSUFFICIENT_STOCK` | Stock insufficient during atomic conditional update |
| `409` | `EMAIL_ALREADY_EXISTS` | Registration with pre-existing email |
| `500` | `INTERNAL_ERROR` | Server exception or non-replica set transaction attempt |
