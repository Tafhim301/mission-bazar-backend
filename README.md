# Mission Bazar — Backend API

A production-ready e-commerce REST API built with **Express.js v5 · TypeScript · Mongoose · MongoDB · SSLCommerz · Cloudinary**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [User](#user)
  - [Category](#category)
  - [Product](#product)
  - [Order](#order)
  - [Payment](#payment)
  - [Review](#review)
  - [Carousel](#carousel)
- [Error Format](#error-format)
- [Role & Permissions](#roles--permissions)
- [Payment Flow](#payment-flow)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js v5 |
| Language | TypeScript 5 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (access + refresh) + bcrypt |
| OTP | bcrypt-hashed, TTL-indexed MongoDB collection |
| File Upload | Multer + Cloudinary |
| Payment | SSLCommerz |
| Email | Nodemailer + EJS templates |
| PDF Invoice | PDFKit |
| Validation | Zod v4 |

---

## Project Structure

```
src/
├── app/
│   ├── config/          # env vars, cloudinary, DB connection
│   ├── errorHandlers/   # AppError, global error middleware
│   ├── middlewares/     # authenticate, authorize, validateRequest, upload
│   ├── modules/
│   │   ├── auth/        # register, verify-email, login, forgot/reset password
│   │   ├── carousel/    # homepage banner management
│   │   ├── category/    # 3-level category tree
│   │   ├── order/       # order lifecycle + COD/SSLCommerz
│   │   ├── otp/         # bcrypt OTP model with TTL
│   │   ├── payment/     # SSLCommerz IPN callbacks, invoice PDF
│   │   ├── product/     # dual pricing, variants, SKU
│   │   ├── review/      # ratings, seller replies, avgRating hooks
│   │   ├── sslcommerz/  # SSLCommerz service wrapper
│   │   └── user/        # profile, BD address book, cart
│   ├── routes/          # central route registration
│   └── utils/           # sendEmail, invoice PDF, queryBuilder, getTransactionId
├── app.ts
└── server.ts
```

---

## Getting Started

```bash
# 1. Clone and install
git clone <repo-url>
cd mission-bazar-server
npm install

# 2. Copy environment file
cp .env.example .env
# Fill in all required variables (see below)

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
npm start
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mission-bazar

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUND=12

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASS=your_store_pass
SSLCOMMERZ_IS_LIVE=false

# URLs (used for SSLCommerz callback URLs)
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Mission Bazar <no-reply@missionbazar.com>
```

---

## Authentication Flow

### Register → Verify → Login

```
POST /auth/register      →  Creates unverified user, sends 6-digit OTP to email
POST /auth/verify-email  →  Verifies OTP, sets isVerified=true, returns tokens
POST /auth/login         →  Email + password → access token (body) + refresh token (HttpOnly cookie)
```

### Password Reset

```
POST /auth/forgot-password  →  Sends OTP to email (always returns generic message)
POST /auth/reset-password   →  OTP + newPassword → updates password
```

### Token Refresh

```
POST /auth/refresh-token  →  Reads refresh token from HttpOnly cookie, returns new access token
```

**Access token lifetime:** 15 minutes  
**Refresh token lifetime:** 7 days (rotated on use)  
**OTP lifetime:** 5 minutes (MongoDB TTL index auto-deletes)

---

## API Reference

All endpoints are prefixed with `/api/v1`.

**Authentication header:**
```
Authorization: Bearer <accessToken>
```

**Standard success response:**
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

---

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ✗ | Register new user, send OTP email |
| `POST` | `/auth/verify-email` | ✗ | Verify OTP, activate account |
| `POST` | `/auth/login` | ✗ | Login with email + password |
| `POST` | `/auth/refresh-token` | Cookie | Rotate tokens |
| `POST` | `/auth/forgot-password` | ✗ | Send password reset OTP |
| `POST` | `/auth/reset-password` | ✗ | Reset password with OTP |
| `PATCH` | `/auth/change-password` | ✓ | Change password (logged in) |
| `POST` | `/auth/logout` | ✓ | Clear refresh token cookie |

#### POST /auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "01700000000"   // optional
}
```

#### POST /auth/verify-email
```json
{ "email": "john@example.com", "otp": "123456" }
```
Returns: `{ user, accessToken }`

#### POST /auth/login
```json
{ "email": "john@example.com", "password": "password123" }
```
Returns: `{ user, accessToken }` + sets `refreshToken` HttpOnly cookie

#### POST /auth/forgot-password
```json
{ "email": "john@example.com" }
```
Always returns `200` with a generic message (prevents email enumeration).

#### POST /auth/reset-password
```json
{ "email": "john@example.com", "otp": "123456", "newPassword": "newpass123" }
```

#### PATCH /auth/change-password
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```

---

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/user/me` | ✓ | Get own profile |
| `PATCH` | `/user/me` | ✓ | Update name / phone |
| `PATCH` | `/user/me/avatar` | ✓ | Upload profile image (multipart) |
| `POST` | `/user/me/address` | ✓ | Add a new address |
| `DELETE` | `/user/me/address/:addressId` | ✓ | Remove an address |
| `PATCH` | `/user/me/cart` | ✓ | Sync cart items |
| `DELETE` | `/user/me/cart` | ✓ | Clear cart |
| `GET` | `/user` | ADMIN | List all users (paginated) |
| `GET` | `/user/:id` | ADMIN | Get user by ID |
| `PATCH` | `/user/:id/status` | ADMIN | Update user status |
| `DELETE` | `/user/:id` | ADMIN | Soft-delete user |

#### POST /user/me/address
```json
{
  "label": "HOME",
  "contactName": "John Doe",
  "contactPhone": "01700000000",
  "street": "House 12, Road 5, Dhanmondi",
  "landmark": "Near Ruposhi Bangla Hotel",
  "district": "Dhaka",
  "zone": "Dhanmondi",
  "area": "Dhanmondi 27",
  "isDefault": true
}
```
`label` must be one of: `HOME` | `OFFICE` | `OTHERS`

#### PATCH /user/me/cart
```json
{
  "items": [
    { "product": "<productId>", "quantity": 2 }
  ]
}
```

---

### Category

3-level hierarchy: **MAIN → SUB → PRODUCT**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/category` | ✗ | Flat list of all active categories |
| `GET` | `/category/tree` | ✗ | Nested tree (MAIN → SUB → PRODUCT) |
| `GET` | `/category/:id` | ✗ | Single category |
| `POST` | `/category` | ADMIN | Create category (multipart) |
| `PATCH` | `/category/:id` | ADMIN | Update category (multipart) |
| `DELETE` | `/category/:id` | ADMIN | Delete (blocked if has children) |

**Create/Update body** (`multipart/form-data`):

| Field | Required | Notes |
|---|---|---|
| `name` | ✓ | Unique within same parent |
| `type` | ✓ | `MAIN` \| `SUB` \| `PRODUCT` |
| `parent` | For SUB/PRODUCT | ObjectId of parent category |
| `image` | ✗ | Image file → Cloudinary |
| `isActive` | ✗ | Boolean, default `true` |

---

### Product

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/product` | ✗ | Browse products (filterable, paginated) |
| `GET` | `/product/:id` | ✗ | Get by ObjectId |
| `GET` | `/product/slug/:slug` | ✗ | Get by slug |
| `POST` | `/product` | AGENT/ADMIN | Create product (multipart) |
| `PATCH` | `/product/:id` | AGENT/ADMIN | Update product (multipart) |
| `PATCH` | `/product/:id/status` | ADMIN | Change status |
| `DELETE` | `/product/:id` | AGENT/ADMIN | Soft-delete |

**Query parameters for GET /product:**

| Param | Example | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `12` | Items per page |
| `sort` | `-createdAt` | Field to sort by (`-` prefix = desc) |
| `search` | `samsung` | Full-text search on name/tags |
| `category` | `<id>` | Filter by category ObjectId |
| `minPrice` | `1000` | Minimum `singleItemPrice` |
| `maxPrice` | `50000` | Maximum `singleItemPrice` |
| `freeShipping` | `true` | Filter free-shipping products |
| `status` | `ACTIVE` | Default ACTIVE for public |

**Pricing logic:**

| Qty | Price Used |
|---|---|
| 1–11 | `singleItemPrice` |
| 12+ (dozen) | `wholesalePrice` (if set) |

If `discount` and `discountType` are set, they apply after base price selection:
- `PERCENTAGE`: `base × (1 - discount/100)`
- `FLAT`: `base - discount`

**Create product body** (`multipart/form-data`):

| Field | Required | Notes |
|---|---|---|
| `name` | ✓ | 2–200 chars |
| `singleItemPrice` | ✓ | Retail price |
| `wholesalePrice` | ✗ | Price for qty ≥ 12 |
| `discount` | ✗ | Requires `discountType` |
| `discountType` | ✗ | `PERCENTAGE` \| `FLAT` |
| `category` | ✓ | Category ObjectId |
| `stock` | ✓ | Integer ≥ 0 |
| `sku` | ✗ | Unique stock-keeping unit |
| `brand` | ✗ | |
| `description` | ✗ | |
| `freeShipping` | ✗ | Boolean |
| `status` | ✗ | `ACTIVE` \| `INACTIVE` \| `DRAFT` |
| `tags` | ✗ | JSON array: `["tag1","tag2"]` |
| `specifications` | ✗ | JSON array: `[{"key":"RAM","value":"8GB"}]` |
| `variants` | ✗ | JSON array: `[{"label":"Color","value":"Blue","image":"..."}]` |
| `images` | ✗ | Up to 5 image files → Cloudinary |

---

### Order

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/order` | ✓ | Place order |
| `GET` | `/order/my-orders` | ✓ | My orders (paginated) |
| `GET` | `/order/:id` | ✓ | Single order |
| `PATCH` | `/order/:id/cancel` | ✓ | Cancel order (PENDING only) |
| `GET` | `/order` | ADMIN | All orders |
| `PATCH` | `/order/:id/status` | ADMIN | Update order status |

**Order statuses:** `PENDING → PROCESSING → SHIPPED → DELIVERED`  
Cancellation only allowed when status is `PENDING`.

#### POST /order
```json
{
  "items": [
    { "product": "<productId>", "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "01700000000",
    "address": "House 12, Road 5, Dhanmondi",
    "city": "Dhaka",
    "postalCode": "1205"
  },
  "paymentMethod": "SSLCOMMERZ",
  "note": "Please pack carefully"
}
```

`paymentMethod`: `SSLCOMMERZ` | `COD`

**Response:**
- `SSLCOMMERZ`: `{ order, paymentUrl }` — redirect user to `paymentUrl`
- `COD`: `{ order }` — order goes directly to `PROCESSING`

On order creation: stock is decremented atomically. On cancellation: stock is restored.

---

### Payment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payment/init/:orderId` | ✓ | Retry / re-init SSLCommerz |
| `GET` | `/payment/my-payments` | ✓ | Payment history |
| `GET` | `/payment/invoice/:paymentId` | ✓ | Get invoice PDF URL |
| `POST` | `/payment/success` | IPN | SSLCommerz success callback |
| `POST` | `/payment/fail` | IPN | SSLCommerz fail callback |
| `POST` | `/payment/cancel` | IPN | SSLCommerz cancel callback |
| `POST` | `/payment/validate-payment` | IPN | SSLCommerz IPN validation |

> ⚠️ IPN endpoints (`/success`, `/fail`, `/cancel`, `/validate-payment`) are called by the SSLCommerz gateway, not by the client. They must be publicly accessible.

**Post-payment invoice flow:**
1. Transaction commits: Order status → `PROCESSING`, Payment status → `PAID`
2. Fire-and-forget: PDF generated → uploaded to Cloudinary → `invoiceUrl` saved on Order + Payment → invoice emailed to customer

---

### Review

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/review/product/:productId` | ✗ | Get reviews for a product |
| `POST` | `/review` | ✓ | Create review (multipart) |
| `PATCH` | `/review/:id` | ✓ | Update own review |
| `PATCH` | `/review/:id/reply` | ADMIN/AGENT | Seller reply |
| `DELETE` | `/review/:id` | ✓ | Delete own review |

After every create/update/delete, `Product.avgRating` and `Product.totalReviews` are recomputed via Mongoose post-hooks.

#### POST /review (multipart/form-data)

| Field | Required | Notes |
|---|---|---|
| `product` | ✓ | Product ObjectId |
| `rating` | ✓ | Integer 1–5 |
| `comment` | ✗ | Text review |
| `images` | ✗ | Up to 4 image files |

#### PATCH /review/:id/reply
```json
{ "comment": "Thank you for your feedback!" }
```

---

### Carousel

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/carousel` | ✗ | Active banners (sorted by `order`) |
| `GET` | `/carousel/all` | ADMIN | All banners including inactive |
| `POST` | `/carousel` | ADMIN | Create banner (multipart) |
| `PATCH` | `/carousel/:id` | ADMIN | Update banner (multipart) |
| `DELETE` | `/carousel/:id` | ADMIN | Delete banner + Cloudinary cleanup |

#### POST /carousel (multipart/form-data)

| Field | Required | Notes |
|---|---|---|
| `image` | ✓ | Banner image → Cloudinary |
| `title` | ✗ | Overlay title |
| `subtitle` | ✗ | Overlay subtitle |
| `link` | ✗ | Click-through URL |
| `order` | ✗ | Display order integer |
| `isActive` | ✗ | Boolean, default `true` |

---

## Error Format

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "path": "email",
      "message": "Email is required"
    }
  ]
}
```

**Common HTTP status codes:**

| Code | Meaning |
|---|---|
| `400` | Validation error / bad request |
| `401` | Not authenticated (missing/expired token) |
| `403` | Forbidden (insufficient role or unverified account) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, etc.) |
| `500` | Internal server error |

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| `USER` | Browse, cart, order, review, profile |
| `AGENT` | All USER capabilities + create/manage own products, reply to reviews |
| `ADMIN` | Full access — manage users, categories, products, orders, carousel, all reviews |

New accounts default to `USER`. Role changes are admin-only.  
Accounts must be email-verified (`isVerified: true`) before login is permitted.

---

## Payment Flow

### SSLCommerz

```
Client → POST /order { paymentMethod: "SSLCOMMERZ" }
       ← { order, paymentUrl }

Client → Redirect to paymentUrl (SSLCommerz gateway)
       ← User completes payment

SSLCommerz → POST /payment/success (IPN)
           → DB transaction: Payment PAID, Order PROCESSING
           → Async: PDF invoice → Cloudinary → email to customer

SSLCommerz → POST /payment/fail    (IPN) → Order FAILED
SSLCommerz → POST /payment/cancel  (IPN) → Order CANCELLED
```

### Cash on Delivery

```
Client → POST /order { paymentMethod: "COD" }
       ← { order }   (status: PROCESSING immediately)
```

---

## Postman Collection

Import `Mission-Bazar.postman_collection.json` into Postman.

**Collection variables auto-set by tests:**
- `accessToken` — set on Login and Verify Email
- `orderId`, `productId`, `categoryId`, `reviewId`, `paymentId`, `carouselId` — set on create calls

**Recommended test order:**
1. Register → Verify Email → Login
2. Create Category → Create Product
3. Place Order → (for SSLCommerz) use returned `paymentUrl`
4. My Orders → Get Order by ID
5. Create Review → Seller Reply

