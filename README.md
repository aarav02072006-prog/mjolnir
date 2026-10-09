# Mjolnir Hackathon Stage 5 - Backend Architecture

## 🏹 Complete Backend Blueprint for E-commerce Platform

This repository contains the complete backend architecture for the Mjolnir Hackathon Stage 5, built with **PostgreSQL ACID compliance** and **Redis distributed locks** for Flash Checkout race condition handling.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Strategy & Schema](#database-strategy--schema)
3. [Flash Checkout & Race Condition Handling](#flash-checkout--3-minute-inventory-lock)
4. [Data Ingest](#data-ingest)
5. [REST APIs & Security](#rest-apis--security-architecture)
6. [Folder Structure](#folder-structure)
7. [Prerequisites & Installation](#prerequisites--installation)
8. [Environment Variables](#environment-variables)
9. [API Endpoints](#api-endpoints)
10. [Hackathon Timeline](#24-hour-hackathon-timeline)

---

## 🏗️ Architecture Overview

**Mjolnir Hackathon Backend** - A scalable, concurrency-proof e-commerce backend architecture featuring:

- **PostgreSQL** for strict ACID compliance (orders, payments, inventory)
- **Redis distributed locks** for Flash Checkout race condition handling
- **JWT stateless authentication**
- **express-validator** input validation
- **Meesho dataset** streaming ingest with sanitization
- **Clean modular folder structure** for judge evaluation

**Key Problem Solved**: Race condition when 1000 users simultaneously attempt to purchase the last item - handled via Redis atomic `DECRBY` + 3-minute TTL locks.

---

## 🗄️ Database Strategy & Schema (PostgreSQL)

**Why PostgreSQL?** MongoDB relations become complex at scale. E-commerce requires strict ACID compliance for orders, payments, and inventory.

### Core Tables

| Table | Key Columns |
|-------|-------------|
| **Users** | id, name, email, password_hash, role |
| **Products** | id, sku, title, price, stock_quantity, category |
| **Orders** | id, user_id, total_price, status (PENDING, LOCKED, COMPLETED, FAILED), created_at |
| **Order_Items** | id, order_id, product_id, quantity, price_at_checkout |

### Indexes

```sql
CREATE INDEX idx_products_category ON Products(category);
```

### Model Operations

- **Products**: `getAllProducts`, `getProductById`, `createProduct`, `updateProductStock`, `decreaseProductStock`, `searchProducts`
- **Orders**: `createOrder`, `createOrderItem`, `getOrderById`, `getOrdersByUser`, `updateOrderStatus`, `getOrderItemsByOrder`, `getCompletedOrdersSummary`

---

## 🏎️ Flash Checkout & 3-Minute Inventory Lock (Race Condition Handling)

**The Critical Race Condition**: When 1000 users simultaneously click "Checkout" on the last item, database queries can fail or oversell inventory.

### Execution Flow

1. **Intercept Checkout** → Don't hit DB directly
2. **Atomic Decrement**: Redis `DECRBY` command - atomic operation, never gives same unit to 2 users
3. **3-Minute Lock**: `SET lock:product_{id}:user_{id} "LOCKED" EX 180` (180 seconds = 3 minutes)
4. **Success Scenario**: User completes payment within 3 min → PostgreSQL permanent stock deduct → order status `COMPLETED`
5. **Timeout/Fail Scenario**: 3 min expire → Redis lock auto-deletes → Background worker marks order `FAILED` → Redis `INCR` restores stock

### Lock Lifecycle

| State | Action | Duration |
|-------|--------|----------|
| **LOCKED** | User has 3 min to complete payment | 180 seconds |
| **COMPLETED** | Payment verified → permanent stock deduct | Persistent |
| **FAILED** | Timeout → stock restored → order marked failed | Persistent |

### Key Files

- `src/services/inventory.service.js` - Core Redis distributed locking logic
- `src/controllers/order.controller.js` - Flash checkout endpoints (`/lock`, `/confirm`, `/status`)

---

## 📦 Data Ingest

### Meesho Dataset Processing

**Challenge**: Large dataset loading into RAM can crash the server.

**Solution**: Streaming, chunked reading with sanitization and bulk inserts.

### Process

1. **Streaming**: `fs.createReadStream` reads data in chunks (not all at once)
2. **Sanitization**: Filter null values, weird characters, missing prices during load
3. **Bulk Insert**: `INSERT INTO Products VALUES (), (), ()` - 1000 records at once (vs one-by-one)

### Script

- `src/scripts/ingest.js` - Meesho dataset ingestion with:
  - `node ingest.js --file=<path> --batch-size=<number>`
  - Streaming readline interface
  - CSV sanitization (null/weird chars/missing prices)
  - Batch INSERT with ON CONFLICT handling
  - Progress reporting (valid rows, skipped rows, duration)

---

## 🔒 REST APIs & Security Architecture

### Authentication

- **bcrypt**: Password hashing with 10 salt rounds
- **JWT**: Stateless JSON Web Tokens (no server-side session storage)
- **Token Flow**: `Authorization: Bearer <token>` header

### Input Validation

- **express-validator**: Zod/Joi alternative for body/param/query validation
- **Core rules**: Negative quantity prevention, email format, numeric ranges

### API Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Products** | `GET /api/v1/products` | List products with pagination, filter, sort |
| | `GET /api/v1/products/:id` | Get single product |
| | `POST /api/v1/products` | Create product (admin) |
| **Orders** | `GET /api/v1/orders` | User orders with pagination |
| | `GET /api/v1/orders/:id` | Single order details |
| **Checkout** | `POST /api/v1/checkout/lock` | Flash lock inventory (3 min TTL) |
| | `POST /api/v1/checkout/confirm/:id` | Confirm payment, complete order |
| | `GET /api/v1/checkout/status/:id` | Check lock validity |
| **Auth** | `POST /api/v1/auth/login` | User login, generate JWT |

### Security Middleware

- `authMiddleware` - JWT verification, attaches `req.user`
- `roleMiddleware` - Role-based access control
- `optionalAuthMiddleware` - Works with/without token
- `validateProductCreation` - Product creation rules
- `validateOrderCreation` - Order creation rules

---

## 📁 Folder Structure (Clean & Modular)

```
mjolnir-hackathon/
├── .env                  # Environment variables
├── package.json          # Dependencies
├── README.md             # This file
├── backend/
│   ├── src/
│   │   ├── config/       # DB, Redis & Env connections
│   │   ├── controllers/  # Request handling (Auth, Products, Orders)
│   │   ├── middlewares/  # JWT Auth verification, Zod Validation
│   │   ├── models/       # DB queries / Prisma ORM schemas
│   │   ├── routes/       # Express API route definitions
│   │   ├── services/     # Core logic (Redis locking, Payment processing)
│   │   ├── scripts/      # Meesho dataset ingestion & cleaning logic
│   │   └── server.js     # App entry point
│   └── node_modules/     # Installed dependencies
```

**Why this structure?** Judges can immediately understand the code organization - each concern is separated (config, controllers, middlewares, models, routes, services, scripts).

---

## ⚙️ Prerequisites & Installation

### Prerequisites

- **Node.js** v14+ (v24.3.0 tested)
- **PostgreSQL** 13+ with `mjolnir_ecommerce` database
- **Redis** 6+ server (localhost:6379 default)

### Installation

```bash
# 1. Clone/repo navigate
cd C:\Users\mishr\Desktop\Meesho\hackthon_mjolnir\backend

# 2. Install dependencies
npm install

# 3. Start services
#   - PostgreSQL must be running
#   - Redis must be running (redis-server)

# 4. Start the server
node src/server.js

# 5. Test health endpoint
curl http://localhost:3000/
```

### Default Ports

- **HTTP**: 3000 (configurable via `PORT` env var)
- **PostgreSQL**: 5432
- **Redis**: 6379

---

## 🌿 Environment Variables

Create `backend/.env` file:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=mjolnir_ecommerce
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Authentication
JWT_SECRET=your_jwt_secret_key_here_make_it_32_bytes_minimum
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes in ms
RATE_LIMIT_MAX=100
```

---

## � API Endpoints Reference

### Health Check

```
GET /  →  {"success": true, "message": "Mjolnir Hackathon Backend is running"}
```

### Products

```
GET  /api/v1/products?page=1&limit=10&category=electronics&sort=price_asc
GET  /api/v1/products/:id
POST /api/v1/products  (body: {sku, title, price, stockQuantity, category})
```

### Orders

```
GET  /api/v1/orders?page=1&limit=10
GET  /api/v1/orders/:id
POST /api/v1/checkout/lock  (body: {productId, quantity, userId})
POST /api/v1/checkout/confirm/:id
GET  /api/v1/checkout/status/:id
```

### Authentication

```
POST /api/v1/auth/login  (body: {email, password})
```

### Rate Limiting

- 100 requests per 15 minutes per IP (`/api/` prefix)
- Configurable via `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX` env vars

---

## ⏱️ 24-Hour Hackathon Timeline (Backend Focus)

| Phase | Focus Area | Goal | Hours |
|-------|-----------|------|-------|
| **1** | Setup & Auth | DB/Redis connect, folder structure, JWT Login/Signup | 1-4 |
| **2** | Flash Checkout & Lock | Redis distributed locks, 3-min TTL, race condition handling | 5-8 |
| **3** | Data Ingest | Streaming ingest, sanitization, bulk INSERT from Meesho dataset | 9-12 |
| **4** | REST APIs & Security | JWT auth, express-validator, API grouping, security middleware | 13-16 |
| **5** | Folder Structure | Clean modular organization judges can inspect | 17-24 |

**Total**: 24 hours for complete backend architecture

---

## 🏆 Hackathon Features Showcase

### Race Condition Handling (Stage 5 Highlight)

```
The Execution Flow:
1. Intercept Checkout → Don't hit DB directly
2. Atomic Decrement → Redis DECR command (atomic, never same unit to 2 users)
3. 3-Minute Lock → SET lock:product_{id}:user_{id} "LOCKED" EX 180
4. Success → User completes payment within 3 min → PostgreSQL permanent deduct → COMPLETED
5. Timeout → Redis lock auto-deletes → Background worker marks FAILED → INCR restores stock
```

### Scalability

- **PostgreSQL ACID**: Transactional integrity for orders/payments/inventory
- **Redis Distributed**: Locks work across multiple server instances
- **Streaming Ingest**: Large datasets without server crash
- **Stateless JWT**: No session storage, horizontal scaling friendly

### Code Quality

- **Modular**: Each concern separated (config, controllers, etc.)
- **Surgical Changes**: Minimal, focused modifications
- **Error Handling**: Try/catch, proper status codes, meaningful messages
- **Atomic Operations**: Redis DECRBY guarantees no race conditions

---

## 🛠️ Development & Contribution

### Adding New Features

1. **Model**: Add DB query in `src/models/`
2. **Controller**: Add handler in `src/controllers/`
3. **Route**: Define endpoint in `src/routes/`
4. **Middleware**: Add validation/auth in `src/middlewares/`
5. **Service**: Add business logic in `src/services/`

### Testing

```bash
# Run all tests
npm test

# Or manually verify
curl -s http://localhost:3000/
curl -s http://localhost:3000/api/v1/products
```

### Common Commands

```bash
# Restart with auto-reload (development)
npm run dev  # (add nodemon to package.json if needed)

# Check environment
cat backend/.env

# Verify Redis connection
redis-cli ping
```

---

## 📞 Support

- **Architecture**: Complete backend blueprint for Mjolnir Hackathon Stage 5
- **Race Condition**: Solved with Redis distributed locks + 3-minute TTL
- **Database**: PostgreSQL ACID compliance for all transactional data
- **Authentication**: JWT stateless tokens with bcrypt password hashing

---

**Built with ❤️ for Mjolnir Hackathon Stage 5**