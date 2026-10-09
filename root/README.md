# Meesho E-Commerce Platform

> A modern, full-stack e-commerce platform inspired by Meesho, built with **Next.js 16 App Router**, **Prisma + SQLite**, **Zustand** and **Tailwind CSS 4**.  
> Created for the **Cliffesto Web Development Hackathon**.

---

## 🏆 Hackathon Innovations & Pitch Guide

If you are preparing your final pitch or PowerPoint for the judges, **please read the [Presentation Guide](docs/PRESENTATION_GUIDE.md)**! It contains a slide-by-slide breakdown of the strongest technical implementations in this codebase.

**Key Features Implemented:**
- **Concurrency-Safe Flash Checkout:** 3-minute TTL inventory reservation locks powered by serializable DB transactions.
- **Production-Grade Razorpay Integration:** Secure, server-side test mode payments with constant-time HMAC-SHA256 signature verification.
- **Price History Tracker:** Recharts-powered API tracking real price changes over 7/30/90 day periods.
- **Bharat "Lite Mode":** Zustand-persisted edge state that strips heavy image payloads for tier-2/3 cities.
- **Immersive Editorial UX:** Framer Motion scroll-linked animations and a floating 3D product universe hero.

---

## Table of Contents

1. [Quick Overview](#1-quick-overview)  
2. [Tech Stack (Verified)](#2-tech-stack-verified)  
3. [Repository Layout](#3-repository-layout)  
4. [Windows Setup Guide](#4-windows-setup-guide)  
5. [Environment Variables](#5-environment-variables)  
6. [Dataset Setup](#6-dataset-setup)  
7. [Common Issues & Diagnostics](#7-common-issues--diagnostics)  
8. [API Reference](#8-api-reference)  
9. [Architecture Summary](#9-architecture-summary)  
10. [Team Workflow](#10-team-workflow)  

---

## 1. Quick Overview

| Feature | Status |
|---|---|
| Product catalogue (2 000 products from organizer CSV) | ✅ Implemented |
| Product search, filter, sort, pagination | ✅ Implemented |
| Light / Dark theme toggle | ✅ Implemented |
| Bharat Lite Mode (image suppression) | ✅ Implemented |
| User registration & login (JWT cookie) | ✅ Implemented |
| Add to Cart (client-side Zustand, `localStorage`) | ✅ Implemented |
| Server-side price calculation at checkout | ✅ Implemented |
| Flash Checkout reservation (180-second lock) | ✅ Implemented |
| Order history & order detail pages | ✅ Implemented |
| Expired-reservation inventory restoration | ✅ Implemented |
| Price history chart per product | ✅ Implemented |
| Related products section | ✅ Implemented |
| Automated tests | ⚠ Scaffolded — E2E requires pre-running dev server |
| External scheduler for cleanup cron | ⚠ Manual — call `GET /api/cron/cleanup-locks` |
| Deployment configuration | ⚠ Not included — SQLite is dev-only |

Demo login: `demo@meesho.com` / `demo123`

---

## 2. Tech Stack (Verified)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.4.0 |
| UI Library | React | 19.3.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS 4 + Turbopack | ^4 |
| ORM | Prisma | ^5.22.0 |
| Database | SQLite (dev) | — |
| Auth | `jose` JWT in `httpOnly` cookie | ^6 |
| Password hashing | `bcryptjs` | ^3 |
| State management | Zustand (cart, auth, theme, network) | ^5 |
| Charts | Recharts | ^3 |
| Icons | Lucide React | ^1.53 |
| Package manager | **npm** (lockfile: `package-lock.json`) | — |

---

## 3. Repository Layout

```
meesho-platform/              ← Git repository root
├── prisma/
│   ├── schema.prisma         ← Data models (User, Product, Order, etc.)
│   ├── seed.js               ← Dataset ingestion + demo user creation
│   └── dev.db                ← SQLite file (git-ignored, auto-created)
├── src/
│   ├── app/                  ← Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── auth/         ← login, logout, register, me
│   │   │   ├── cart/         ← checkout (reservation), confirm
│   │   │   ├── cron/         ← cleanup-locks (inventory restoration)
│   │   │   ├── orders/       ← order list, order detail
│   │   │   └── products/     ← product list, product detail
│   │   ├── auth/             ← Login & Register pages
│   │   ├── cart/             ← Shopping cart page
│   │   ├── orders/           ← Order history & detail pages
│   │   ├── product/[id]/     ← Product detail page
│   │   ├── globals.css       ← CSS variables for light/dark themes
│   │   ├── layout.tsx        ← Root layout (Navbar, theme script)
│   │   └── page.tsx          ← Homepage (product grid + search)
│   ├── components/           ← Shared React components
│   │   ├── AddToCartButton.tsx
│   │   ├── Navbar.tsx        ← Navigation, search, theme toggle, auth state
│   │   ├── PriceHistoryChart.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductSkeleton.tsx
│   │   └── SearchFilters.tsx
│   ├── lib/
│   │   ├── auth.ts           ← getAuthUser() — JWT verification helper
│   │   ├── prisma.ts         ← Singleton Prisma client
│   │   └── utils.ts          ← Tailwind class merger
│   └── store/
│       ├── authStore.ts      ← Zustand — user session (persisted)
│       ├── store.ts          ← Zustand — cart + Bharat Lite Mode (persisted)
│       └── themeStore.ts     ← Zustand — light/dark theme (persisted)
├── tests/
│   └── concurrency.test.ts   ← Node test-runner concurrency tests
├── docs/
│   ├── ARCHITECTURE.md       ← Detailed system design & diagrams
│   └── TEAM_WORKFLOW.md      ← Five-member workflow & ownership
├── .env.example              ← Template — copy to .env.local
├── .env.local                ← Your local secrets (git-ignored)
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json

../dataset/                   ← OUTSIDE the Git repo — organizer dataset
└── meesho_dataset-main/
    └── meesho_generated.csv  ← 2 000 products, 24 columns
```

> **The dataset is not inside the Git repository.** Each teammate must place or point to it separately. See [Section 6](#6-dataset-setup).

---

## 4. Windows Setup Guide

Follow these steps exactly from PowerShell. All commands are run from the `meesho-platform` directory unless otherwise stated.

### Step 1 — Install Node.js

Download and install **Node.js 20 LTS** from [nodejs.org](https://nodejs.org).  
Verify:
```powershell
node --version   # v20.x.x
npm --version    # 10.x.x
```

### Step 2 — Clone the repository

```powershell
git clone https://github.com/rishabh-dev1/hackthon_mjolnir.git
cd hackthon_mjolnir\meesho-platform
```

> If cloning to a different folder, adjust all subsequent paths accordingly.

### Step 3 — Open in VS Code

```powershell
code .
```

### Step 4 — Install dependencies

```powershell
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.  
If that fails, run it manually:
```powershell
npx prisma generate
```

### Step 5 — Configure environment variables

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` in VS Code and fill in:

| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` (already set) |
| `NEXTAUTH_SECRET` | **Yes** | Run the command below |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` (already set) |
| `MEESHO_DATASET_PATH` | No | See Section 6 |
| `CRON_SECRET` | Yes | Any random string |

Generate a secret:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 6 — Place the organizer dataset

See [Section 6](#6-dataset-setup) for your options.

### Step 7 — Initialize the database

```powershell
npx prisma db push
```

This creates `prisma/dev.db` and applies the schema. It is safe to run multiple times.

### Step 8 — Import the dataset and create the demo user

```powershell
node prisma/seed.js
```

Expected output:
```
✅ Demo user upserted: demo@meesho.com
📦 Importing Organizer Dataset from: ...
...imported 500 records
...imported 1000 records
...imported 1500 records
...imported 2000 records
✅ Successfully Imported: 2000
❌ Rejected: 0
```

Re-running seed is **safe** — it uses `upsert` and never overwrites `stockCount`.

### Step 9 — Start the development server

```powershell
npm run dev
```

### Step 10 — Open the application

Navigate to [http://localhost:3000](http://localhost:3000)

### Step 11 — Verify products load

The homepage should show 20 products. Check that images are visible (in non-Lite mode).

### Step 12 — Log in

Go to [http://localhost:3000/auth/login](http://localhost:3000/auth/login) and enter:
- Email: `demo@meesho.com`
- Password: `demo123`

Or click **"Fill demo credentials"** on the login page.

### Step 13 — Search and browse

Use the search bar or the **Shop** / **Sale** nav buttons. Click any product card to open the detail page.

### Step 14 — Add to cart

Click **Add to Cart** on the product detail page. The cart icon in the navbar should show a badge.

### Step 15 — Test checkout

Go to [http://localhost:3000/cart](http://localhost:3000/cart) and click **Secure Checkout**.

The server will:
1. Verify you are logged in.
2. Check stock in the database.
3. Decrement `stockCount` atomically inside a Serializable transaction.
4. Create a `FlashCheckoutLock` expiring in 180 seconds.
5. Return the expiry time — the cart page shows a countdown timer.

### Step 16 — View orders

Go to [http://localhost:3000/orders](http://localhost:3000/orders). Orders in status `PENDING` have an active reservation. They become `CANCELLED` after expiry if not confirmed.

### Stop the server

Press `Ctrl + C` in the PowerShell window running `npm run dev`.

### Restart the server

```powershell
npm run dev
```

---

## 5. Environment Variables

Full reference — see `.env.example` for annotated template.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NEXTAUTH_URL` | Yes | App base URL for cookie domain |
| `MEESHO_DATASET_PATH` | No | Absolute path to `meesho_generated.csv` |
| `CRON_SECRET` | Yes | Bearer token for `/api/cron/cleanup-locks` |

> `.env.local` is git-ignored. Never commit real values.

---

## 6. Dataset Setup

The organizer-provided CSV (`meesho_generated.csv`, 2 000 rows, 24 columns) is **not** inside the Git repository.

### Option A — Default relative layout (recommended for the team)

Place the extracted dataset at this path relative to the workspace root (one level above `meesho-platform`):

```
<workspace-root>/
├── dataset/
│   └── meesho_dataset-main/
│       └── meesho_generated.csv   ← goes here
└── meesho-platform/               ← Git repo
```

With this layout, `node prisma/seed.js` works without any extra configuration.

### Option B — Custom path via environment variable

If your dataset is somewhere else, add this to `.env.local`:

```env
MEESHO_DATASET_PATH="C:\Users\yourname\Downloads\meesho_generated.csv"
```

### Verifying the dataset

```powershell
# Count rows (should print 2001 — header + 2000 records)
(Get-Content "..\dataset\meesho_dataset-main\meesho_generated.csv" | Measure-Object -Line).Lines
```

### Column mapping (CSV → Database)

| CSV column | Prisma field | Type |
|---|---|---|
| `product_id` | `productId` | String (unique key) |
| `title` | `title` | String |
| `category` | `category` | String |
| `subcategory` | `subcategory` | String |
| `brand` | `brand` | String |
| `original_price` | `originalPrice` | Float |
| `discounted_price` | `discountedPrice` | Float |
| `discount_percentage` | `discountPercentage` | Float |
| `rating` | `rating` | Float |
| `review_count` | `reviewCount` | Int |
| `availability` | `availability` | String |
| `seller_name` | `sellerName` | String |
| `image_url` | `imageUrl` | String |
| `product_url` | `productUrl` | String |
| `description` | `description` | String |
| `colors_available` | `colorsAvailable` | String |
| `sizes_available` | `sizesAvailable` | String |
| `material` | `material` | String |
| `cod_available` | `codAvailable` | Boolean |
| `return_policy` | `returnPolicy` | String |
| `delivery_time` | `deliveryTime` | String |
| *(not in CSV)* | `stockCount` | Int (5–50, synthetic) |

> `stockCount` is synthetic demo data injected only on first create. It is never overwritten on re-import.

**Known dataset issue:** Some CSV records contain mismatched `title`/`image_url` values (e.g., product ID `MEESHO_1000924` has title "Aks Hair Oil - Watches" but an image URL pointing to a saree). This is a known quality issue in the organizer-generated dataset. The application faithfully renders both fields from the same record — no data has been altered.

---

## 7. Common Issues & Diagnostics

### Port 3000 is already in use

```powershell
# Find and kill the process using port 3000
netstat -ano | findstr :3000
# Note the PID from the last column, then:
taskkill /PID <PID> /F
```

Or start on a different port:
```powershell
$env:PORT=3001; npm run dev
```

### Database connection failure

Check that `DATABASE_URL` in `.env.local` is correct.  
Check that the file exists:
```powershell
Test-Path "prisma\dev.db"
```
If missing, run:
```powershell
npx prisma db push
node prisma/seed.js
```

### Prisma Client is outdated (schema/client mismatch)

```powershell
npx prisma generate
```

### Dataset not found during seed

```
❌ CRITICAL: Dataset CSV not found.
   Looked at: C:\...\prisma\...\meesho_generated.csv
```

- Check Option A/B in [Section 6](#6-dataset-setup).
- Set `MEESHO_DATASET_PATH` in `.env.local` to the absolute path.

### Products do not load (blank page / error in browser)

1. Open browser DevTools → Network tab → check `/api/products` response.
2. Check the terminal where `npm run dev` is running for `[GET /api/products]` errors.
3. If the database is empty, re-run `node prisma/seed.js`.

### Login fails / JWT errors

- Ensure `NEXTAUTH_SECRET` is set in `.env.local`.
- Clear browser cookies and try again.
- Check the terminal for `[jose]` errors.

### Accidentally reset the database

If you ran `npx prisma db push --force-reset` or deleted `dev.db`, re-run:
```powershell
npx prisma db push
node prisma/seed.js
```

> ⚠ **Never run `prisma db push --force-reset` as routine troubleshooting.** It deletes all data.

### API errors — how to inspect

- **Browser:** DevTools → Network tab → find the failing request → Response tab.
- **Server:** The terminal running `npm run dev` prints all `console.error(...)` output.
- **Common files to check:**
  - `src/app/api/...` — the relevant route handler.
  - `src/lib/auth.ts` — if the error is authentication-related.
  - `src/lib/prisma.ts` — if the error is database-related.

### Build fails

```powershell
npx tsc --noEmit    # check TypeScript errors
npm run build       # full production build
```

---

## 8. API Reference

All routes return JSON. Authenticated routes require the `meesho_token` httpOnly cookie set by `POST /api/auth/login`.

### Authentication

| Method | Route | Auth | Body | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{name, email, password}` | `{success, user: {id, name, email}}` | 400 validation, 409 duplicate email |
| POST | `/api/auth/login` | No | `{email, password}` | `{success, user}` + sets cookie | 401 wrong credentials |
| POST | `/api/auth/logout` | No | — | `{success: true}` + clears cookie | — |
| GET | `/api/auth/me` | Cookie | — | `{user: {id, name, email, role}}` | 401 not logged in |

### Products

| Method | Route | Auth | Query params | Success | Errors |
|---|---|---|---|---|---|
| GET | `/api/products` | No | `page, limit, search, category, sort, minPrice, maxPrice` | `{products[], pagination}` | 500 |
| GET | `/api/products/[id]` | No | — | `{product, priceHistory[]}` | 404, 500 |

Sort values: `rating_desc` (default), `price_asc`, `price_desc`, `newest`

### Cart & Checkout

| Method | Route | Auth | Body | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/cart/checkout` | **Yes** | `{items: [{productId, quantity}]}` | `{success, orderId, total, reservationExpiresAt}` | 401, 400, 404, 409 stock |
| POST | `/api/cart/confirm` | **Yes** | `{orderId}` | `{success, message}` | 401, 403, 404, 400 expired |

### Orders

| Method | Route | Auth | Query | Success | Errors |
|---|---|---|---|---|---|
| GET | `/api/orders` | **Yes** | `page, limit` | `{orders[], pagination}` | 401 |
| GET | `/api/orders/[id]` | **Yes** | — | `{order, items[]}` | 401, 403, 404 |

### Cron / Cleanup

| Method | Route | Auth | Success | Notes |
|---|---|---|---|---|
| GET | `/api/cron/cleanup-locks` | Bearer `CRON_SECRET` | `{cleaned, total}` | Restores inventory from expired locks. Call every 60–120s externally. |

### PowerShell examples

```powershell
# Login and capture cookie
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method POST `
  -ContentType 'application/json' `
  -Body '{"email":"demo@meesho.com","password":"demo123"}' `
  -SessionVariable session

# List products (page 1, sorted by price)
Invoke-RestMethod 'http://localhost:3000/api/products?page=1&limit=5&sort=price_asc'

# Trigger cleanup (replace YOUR_CRON_SECRET)
Invoke-RestMethod 'http://localhost:3000/api/cron/cleanup-locks' `
  -Headers @{ Authorization = 'Bearer YOUR_CRON_SECRET' }
```

---

## 9. Architecture Summary

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design, request-flow diagrams and data model documentation.

**Brief overview:**

```
Browser
  ├── Next.js App Router pages  (Server Components — SSR/SSG)
  │     └── fetch() to own API routes
  ├── Client Components         (Navbar, SearchFilters, Cart, Auth forms)
  │     └── Zustand stores      (cart, auth, theme, liteMode — persisted in localStorage)
  └── httpOnly Cookie           (meesho_token — JWT, 7-day expiry)

Server (Next.js route handlers)
  ├── /api/products             — public, paginated, searched
  ├── /api/auth/*               — register, login (bcrypt + jose JWT), logout, me
  ├── /api/cart/checkout        — Serializable transaction: stock check → decrement → lock → order
  ├── /api/cart/confirm         — mark PENDING → COMPLETED, delete locks
  ├── /api/cron/cleanup-locks   — delete expired locks, restore stock, cancel orders
  └── /api/orders/*             — authenticated, user-scoped

Database (Prisma + SQLite)
  └── Models: User, Product, Order, OrderItem, FlashCheckoutLock, PriceHistory
```

---

## 10. Team Workflow

See [`docs/TEAM_WORKFLOW.md`](docs/TEAM_WORKFLOW.md) for the full five-member workflow.

> ⚠ **Hackathon rule: maximum 3 commits to `main/master`.** Do not commit, push or rewrite Git history automatically.
