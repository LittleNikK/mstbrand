# MST STORE — Official MST Blockchain Merchandise & Goodies Platform

> **"Built for Builders. Powered by MST Blockchain."**  
> Official brand reference: [https://www.mstblockchain.com/](https://www.mstblockchain.com/)  
> A production-grade, modern Web3 tech merchandise and developer goodies storefront engineered with Next.js App Router, React 19, TypeScript, Tailwind CSS, and MongoDB.

---

## 1. ARCHITECTURE & TECH STACK

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Lucide React
- **Brand Identity**: Inspired by official MST Blockchain design language (MST Red `#FF2D2D`, dark surfaces `#0A0A0A`, typography with Plus Jakarta Sans & Inter)
- **Backend**: Next.js Route Handlers (`app/api/**/route.ts`), Server Components, Server-only business logic layer
- **Database**: Official MongoDB Node.js driver (`mongodb`), connection pooling, compound & unique indexes, text search index, SKU index
- **Authentication**: JWT signed session cookies (`jose`), salted password hashing (`bcryptjs`), role-based authorization (`customer`, `staff`, `admin`)
- **Inventory & Oversell Guard**: Concurrency-safe atomic reservations (`$gte` stock condition + `$inc: { stock: -qty }`) guaranteeing merchandise and variants are never oversold
- **Payments**: Razorpay gateway integration with HMAC-SHA256 server signature verification, idempotent webhook processing, and test-mode simulation
- **Testing**: Vitest unit test suites for merchandise validation, variant stock calculations, pricing, coupon rules, HMAC signatures, and state machines

---

## 2. DIRECTORY STRUCTURE

```
mst-store/
├── app/
│   ├── layout.tsx                     # MST typography & global providers
│   ├── page.tsx                       # High-impact merchandise storefront homepage
│   ├── globals.css                    # Design tokens & MST brand styling
│   ├── not-found.tsx                  # Custom 404 recovery page
│   ├── error.tsx                      # Global error boundary
│   ├── loading.tsx                    # Minimalist MST loading skeleton
│   ├── sitemap.ts                     # Dynamic SEO sitemap
│   ├── robots.ts                      # Crawler instructions
│   ├── (shop)/
│   │   ├── shop/page.tsx              # Filterable, searchable merchandise catalog
│   │   ├── product/[slug]/page.tsx    # Detailed product view with size/color variants & specs
│   │   ├── cart/page.tsx              # Persistent shopping bag with coupon calculator
│   │   ├── checkout/page.tsx          # Multi-step checkout with atomic stock reserve
│   │   ├── order/[id]/page.tsx        # Order confirmation & live tracking timeline
│   │   └── wishlist/page.tsx          # Customer saved gear
│   ├── (account)/
│   │   ├── login/page.tsx             # Sign in with instant demo fill
│   │   ├── register/page.tsx          # New community membership registration
│   │   ├── forgot-password/page.tsx   # Enumeration-safe reset link
│   │   ├── reset-password/page.tsx    # Secure token password update
│   │   └── account/page.tsx           # Order history & saved addresses
│   ├── admin/
│   │   ├── layout.tsx                 # Server-protected admin layout & sidebar
│   │   ├── page.tsx                   # Operations overview & financial KPIs
│   │   ├── products/                  # Merchandise catalog & new product entry with variants
│   │   ├── inventory/                 # Stock movement audit log & low stock watchlist
│   │   ├── orders/                    # Order status & courier tracking updates
│   │   ├── customers/                 # Community builder directory & lifetime spend
│   │   └── discounts/                 # Promotional coupon code generator
│   └── api/
│       ├── auth/                      # login, register, logout, me, reset-password
│       ├── products/                  # Catalog queries & product by ID
│       ├── collections/               # Official MST merchandise collections
│       ├── cart/                      # Cart calculations, discounts, merge
│       ├── wishlist/                  # Wishlist storage & retrieval
│       ├── checkout/                  # Atomic stock reservation & order initiation
│       ├── payments/verify/           # Signature verification & order paid transition
│       ├── webhooks/razorpay/         # Signed webhook handling & idempotency
│       ├── newsletter/                # Newsletter subscription
│       ├── upload/                    # MIME-validated local/cloud image upload
│       └── admin/                     # Admin CRUD endpoints & overview metrics
├── components/
│   ├── layout/                        # Header, AnnouncementBar, Footer
│   ├── home/                          # Hero, CollectionShowcase, FeaturedDrop, Standards, Story
│   ├── products/                      # ProductCard, ProductDetailView
│   ├── cart/                          # CartDrawer with free shipping tracker
│   ├── admin/                         # OrderDetailClient, DiscountsClient
│   └── providers/                     # AuthProvider, CartProvider, ToastProvider
├── lib/
│   ├── db/mongodb.ts                  # MongoClient singleton with connection pool
│   ├── db/indexes.ts                  # Index creation script
│   ├── auth/                          # JWT, password hashing, session guards
│   ├── config/env.ts                  # Validated environment configuration
│   ├── services/                      # Product, Cart, Order, Inventory, Payment, Email
│   └── validations/                   # Zod schemas for auth, products, checkout
├── types/index.ts                     # Domain TypeScript interfaces with variants & specs
├── scripts/
│   ├── seed.ts                        # 12+ official MST merchandise items, collections & demo accounts
│   ├── init-indexes.ts                # Database indexes initializer
│   └── verify-order.ts                # Order & atomic decrement verification tool
├── tests/unit/                        # Vitest suites for pricing, auth, payment HMAC, schema
├── .env.example                       # Documented environment templates
├── Dockerfile                         # Production Docker deployment
└── README.md
```

---

## 3. GETTING STARTED

### Prerequisites
- Node.js 20+ or 22+
- Local or Cloud MongoDB instance running on port 27017

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Seed Database & Indexes
Run the deterministic seed script to populate official MST merchandise items, collections, admin & customer accounts, and demo orders:
```bash
npm run seed
npm run db:indexes
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the specified port).

---

## 4. DEFAULT DEMO CREDENTIALS

The seed script creates the following pre-configured credentials:

| Role | Email | Password |
|---|---|---|
| **Store Admin** | `admin@mststore.com` | `Admin@123456` |
| **Customer** | `customer@mststore.com` | `Customer@123456` |

*Tip: The login page includes quick **"Instant Demo Logins"** buttons to autofill these credentials with a single click.*

---

## 5. PROMOTION CODES

The database includes the following active vouchers for testing checkout discounts:
- `MSTBUILDER10` — 10% off entire bag
- `GENESIS500` — ₹500 off on orders of ₹3,000 or more
- `DEVCON20` — 20% off on orders of ₹4,000 or more

---

## 6. MONGODB COLLECTIONS & INDEXES

1. **`products`**:
   - `{ slug: 1 }` (unique)
   - `{ sku: 1 }` (sparse unique)
   - `{ category: 1, status: 1 }`
   - `{ status: 1, createdAt: -1 }`
   - Text index: `{ name: "text", description: "text", brand: "text", sku: "text" }`
2. **`orders`**:
   - `{ orderNumber: 1 }` (unique format `MST-YYYY-XXXX`)
   - `{ userId: 1, createdAt: -1 }`
   - `{ paymentStatus: 1 }`
   - `{ fulfillmentStatus: 1 }`
3. **`users`**:
   - `{ email: 1 }` (unique)
   - `{ role: 1 }`
4. **`inventory_movements`**:
   - `{ productId: 1, createdAt: -1 }`
5. **`webhook_events`**:
   - `{ eventId: 1 }` (unique idempotency key)
6. **`discount_codes`**:
   - `{ code: 1 }` (unique)

---

## 7. AUTOMATED TESTING & BUILD

Run unit tests:
```bash
npm run test
```
Run type-checking:
```bash
npm run typecheck
```
Run linter:
```bash
npm run lint
```
Build production bundle:
```bash
npm run build
```
