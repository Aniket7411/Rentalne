# Backend API & data reference (frontend recovery)

## What happened (read this first)

The **latest deployed frontend** was **accidentally deleted**. Only an **older backup** of the frontend remains. The **backend in this repo** is the current source of truth for behavior on the server.

This file was **generated from the actual backend code** in this project (`server.js`, `routes/`, `models/`, `controllers/`) so you can **rebuild the frontend to match production APIs** without guessing URLs, payloads, or error shapes.

### How to use this document

1. **Share this entire file** with Cursor (or any AI) when working on the recovered frontend, so it knows the real contracts.
2. **Align** HTTP paths, request bodies, field names (`orderId` vs `_id`, amounts in rupees vs paise on specific endpoints), and **display `message` / `error` from responses** in toasts and forms.
3. **Base URL:** use **`/api`** on your server — e.g. `http://localhost:5000/api` locally, or `https://<your-domain>/api` in production (adjust if you use a separate API host).
4. Treat the sections **Sample literals**, **Full request / response examples**, and **Global & auth errors** as **copy-paste references** for types and mocks; replace sample IDs with live data from your database.

If a future deployment used a **different commit** of this backend, compare that commit’s `routes/` and `server.js` to this file in case an endpoint drifted.

This document is maintained against the requirements in **`BACKEND_BRIEF_FOR_API_REFERENCE.md`** (single source of truth for the frontend rebuild).

---

## Technical summary

Generated from the codebase in this repo. Use **`/api`** as the path prefix unless you configure a reverse proxy.

**For AI / Cursor:** the sections **Sample literals**, **Full request / response examples**, and **Global & auth errors** contain concrete JSON, numeric examples (e.g. `8732`, paise amounts), and error `message` / `error` codes to mirror in the frontend.

**Base URL (examples):** `http://localhost:5000/api` (default port from `server.js`) or your deployed host + `/api`.

---

## Conventions

### Authentication

- **Header:** `Authorization: Bearer <JWT>`
- **JWT payload** (see `utils/jwt.js`): `{ userId, role, email? }` — `email` omitted for phone-only users.
- **401/403** bodies typically include `success: false`, `message`, and often `error` (`UNAUTHORIZED`, `FORBIDDEN`).

### Success / error envelopes

- Many endpoints: `{ success: true, ... }` or `{ success: true, data: ... }`.
- Validation (express-validator): `{ success: false, message: "<first error>" }` (400).
- Global errors (`middleware/errorHandler.js`): `{ success: false, message, error, stack? (dev only) }`.

### Order identifiers

- **`orderId`**: human-readable string on the order (e.g. `ORD-2026-001`).
- **`_id`**: MongoDB ObjectId.
- Several endpoints accept **either** for lookups (orders, payments).

### Money

- Amounts are in **INR** (rupees, 2 decimal places in API responses via `orderFormatter` / `money` utils).
- Razorpay uses **paise** internally (amount × 100).

### Environments

| Environment | Example base URL |
|---------------|-------------------|
| Local | `http://localhost:5000/api` (default `PORT` from `process.env.PORT` or **5000** in `server.js`) |
| Production | `https://<your-api-host>/api` — use the same host your frontend’s `NEXT_PUBLIC_API_URL` (or equivalent) targets. |

No path prefix other than `/api` is defined in `server.js` unless you add a reverse proxy.

### HTTP status vs JSON `success` field

- Most errors use **4xx/5xx** with `success: false`.
- **`GET /api/settings`:** on some failures the handler still returns **HTTP 200** with `success: true` and **default** discount values (see examples section) — not `success: false`.
- **`GET .../refund-status`:** may return **200** with `success: true`, `data: null` and `message: "No refund found for this order"` when there is no refund record.
- Prefer checking **HTTP status** first, then `success`, then `message` / `error`.

### Rupees vs paise by endpoint (do not mix these up)

| Endpoint | Body / field | Unit |
|----------|----------------|------|
| `POST /api/payments/create-order` | `amount` | **Rupees** (number, e.g. `8500` for ₹8500; validated against `finalTotal` or `advanceAmount`) |
| `POST /api/payments/initiate` | `amount` | **Rupees** |
| `POST /api/payments/calculate` | (per controller) | **Rupees** |
| `POST /api/users/orders/:orderId/create-razorpay-order` | `amount` | **Paise** (integer, e.g. `850000` for ₹8500 — see `orderController.createRazorpayOrderForPendingOrder`) |
| Order model / responses | `total`, `finalTotal`, `advanceAmount`, `remainingAmount`, item `price` | **Rupees** |
| Razorpay Checkout / verify | `amount` on gateway is paise; verify sends gateway ids + signature | Gateway uses **paise** |

### Catalog: `/api/acs` vs `/api/products` (canonical)

- **Both are mounted and intentionally duplicate catalog behavior** for the same **Product** collection.
- **`GET /api/acs`** and **`GET /api/acs/:id`** use `acController.getAllACs` / product-by-id style handlers (legacy path name).
- **`GET /api/products`** and **`GET /api/products/:id`** use `productController.getProducts` / `getProductById`.
- **For new frontend code, prefer `/api/products` and `/api/products/:id`** — clearer naming. Keeping `/api/acs` is for backward compatibility; responses are product-shaped.

### Order list URL (important)

- **There is no** `GET /api/users/orders` **without** a user id segment.
- **List orders:** `GET /api/users/:userId/orders` with **`Authorization`** (user must match `:userId`, or admin).
- **Single order:** `GET /api/users/orders/:orderId` **or** `GET /api/orders/:orderId` (same router; `:orderId` is Mongo `_id` **or** string `orderId`).

---

## Sample literals (use these shapes in frontend mocks)

Use values like below so types are obvious; replace with live data from your DB.

| Kind | Example | Notes |
|------|---------|--------|
| MongoDB `_id` | `"6732a1b2c3d4e5f678901234"` | 24 hex characters |
| Human `orderId` | `"ORD-2026-047"` | Unique string; frontend often generates before POST |
| `paymentId` (your DB) | `"PAY-1730456789012-8732"` | From server after `create-order` |
| Razorpay `order_id` | `"order_Ra1b2Cd3Ef4Gh5"` | Gateway id |
| Razorpay `payment_id` | `"pay_Rz9y8Xw7Vu6Ts5"` | After checkout |
| Phone (stored on User) | `"9876543210"` | 10 digits (no `+91`) |
| Phone (E.164 in forms) | `"+919876543210"` | Contact / inquiry validators |
| Lead phone | `"+919876543210"` | Must match `/^\+91[0-9]{10}$/` |
| Pincode | `"560001"` | 6 digits where validated |
| JWT | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` | `Authorization: Bearer <token>` |
| Session after OTP | `"a1f3c9e7b2d4567890abcef0123456789abcdef0123456789abcdef012345"` | 64-char hex `sessionId` |
| OTP | `"482931"` | 6 digits |
| Money (INR) | `8499`, `8499.5`, `500.00` | Numbers in JSON; responses rounded to 2 dp |
| Money (paise) | `849900` | Integer — **see Razorpay retry endpoint** |
| Coupon code | `"SUMMER24"` | Stored uppercase; validate accepts any case |
| Time slot | `"10-12"` | Also: `12-2`, `2-4`, `4-6`, `6-8` |
| Booking date | `"2026-04-15"` | `YYYY-MM-DD`, must be **tomorrow or later** |

---

## Full request / response examples (copy-paste for Cursor)

### `GET /api/health`

**Response `200`**

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### `GET /api/settings` (public)

**Response `200`**

```json
{
  "success": true,
  "data": {
    "instantPaymentDiscount": 10,
    "advancePaymentDiscount": 5,
    "advancePaymentAmount": 500
  }
}
```

If DB read fails, server still returns **`200`** with the same keys and defaults `10`, `5`, `500`.

---

### `POST /api/auth/login`

**Request**

```json
{
  "email": "riya.sharma@example.com",
  "password": "secret12"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6732a1b2c3d4e5f678901234",
    "_id": "6732a1b2c3d4e5f678901234",
    "name": "Riya Sharma",
    "email": "riya.sharma@example.com",
    "role": "user",
    "phone": "9876543210",
    "homeAddress": "12 MG Road",
    "nearLandmark": "Near Metro",
    "pincode": "560001",
    "alternateNumber": ""
  }
}
```

**Errors**

| Status | `message` | `error` |
|--------|-----------|---------|
| 400 | `Please provide email and password` | `VALIDATION_ERROR` |
| 401 | `Invalid email or password` | `UNAUTHORIZED` |

---

### `POST /api/auth/signup`

**Request**

```json
{
  "name": "Riya Sharma",
  "email": "riya.sharma@example.com",
  "password": "secret12",
  "phone": "9876543210",
  "homeAddress": "12 MG Road",
  "interestedIn": ["AC", "Refrigerator"]
}
```

**Response `201`:** same envelope as login (`success`, `message`, `token`, `user`).

**Errors**

| Status | Example `message` | `error` |
|--------|-------------------|---------|
| 400 | `Please provide name, email, password, and phone` | `VALIDATION_ERROR` |
| 400 | `Phone already exists` / `Email already exists` | `DUPLICATE_ENTRY` |

---

### `POST /api/auth/send-otp`

**Request**

```json
{ "phone": "9876543210" }
```

(`+9198765433210` is normalized to 10 digits.)

**Response `200`**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "sessionId": "a1f3c9e7b2d4567890abcef0123456789abcdef0123456789abcdef012345"
}
```

**Errors:** `400` `Please provide phone number`; `400` invalid 10-digit; `404` `User not found. Please sign up first.` (`USER_NOT_FOUND`); `500` `Failed to send OTP...` (`OTP_SEND_ERROR`). In **development**, success may include `otp` in JSON.

---

### `POST /api/auth/verify-otp`

**Request**

```json
{
  "phone": "9876543210",
  "otp": "482931",
  "sessionId": "a1f3c9e7b2d4567890abcef0123456789abcdef0123456789abcdef012345"
}
```

**Response `200`:** same as login (`token` + `user`; `email` may be `null`).

**Errors:** `400` missing fields; `INVALID_SESSION`; `OTP_EXPIRED`; `MAX_ATTEMPTS_EXCEEDED`; `INVALID_OTP` (may include `attemptsRemaining`); `404` `USER_NOT_FOUND`.

---

### `GET /api/users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "6732a1b2c3d4e5f678901234",
    "_id": "6732a1b2c3d4e5f678901234",
    "name": "Riya Sharma",
    "email": "riya.sharma@example.com",
    "phone": "9876543210",
    "homeAddress": "12 MG Road",
    "nearLandmark": "Near Metro",
    "pincode": "560001",
    "alternateNumber": "",
    "interestedIn": ["AC"],
    "role": "user",
    "address": {
      "homeAddress": "12 MG Road",
      "nearLandmark": "Near Metro",
      "pincode": "560001",
      "alternateNumber": ""
    },
    "createdAt": "2026-03-01T08:30:00.000Z"
  }
}
```

**Errors:** `401` no/invalid token (`UNAUTHORIZED`); `404` `User not found` (`NOT_FOUND`).

---

### `PATCH /api/users/profile`

**Request (top-level)**

```json
{
  "name": "Riya S.",
  "phone": "9876543210",
  "homeAddress": "45 Brigade Road",
  "pincode": "560025",
  "nearLandmark": "UB City",
  "alternateNumber": "9123456789",
  "interestedIn": ["AC", "Washing Machine"]
}
```

**Or nested `address`** (preferred if you send nested):

```json
{
  "name": "Riya S.",
  "address": {
    "homeAddress": "45 Brigade Road",
    "pincode": "560025",
    "nearLandmark": "UB City",
    "alternateNumber": "9123456789"
  }
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "6732a1b2c3d4e5f678901234",
    "name": "Riya S.",
    "email": "riya.sharma@example.com",
    "phone": "9876543210",
    "homeAddress": "45 Brigade Road",
    "nearLandmark": "UB City",
    "pincode": "560025",
    "alternateNumber": "9123456789",
    "address": {
      "homeAddress": "45 Brigade Road",
      "nearLandmark": "UB City",
      "pincode": "560025",
      "alternateNumber": "9123456789"
    },
    "updatedAt": "2026-03-28T10:15:00.000Z"
  }
}
```

---

### `GET /api/products?page=1&limit=20&category=AC`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6732b2c3d4e5f678901234abcd",
      "category": "AC",
      "name": "LG Dual Inverter 1.5 Ton",
      "brand": "LG",
      "model": "RS-Q19YNZE",
      "type": "Split",
      "capacity": "1.5 Ton",
      "location": "Bangalore",
      "price": {
        "3": 3200,
        "6": 6000,
        "9": 8200,
        "11": 9300,
        "12": 10000,
        "24": 16800
      },
      "discount": 10,
      "images": ["https://res.cloudinary.com/demo/image/upload/v1/ac1.jpg"],
      "features": {
        "specs": ["Inverter", "Copper coil"],
        "dimensions": "Indoor: 80x30x25 cm",
        "safety": ["Auto restart"]
      },
      "averageRating": 4.5,
      "totalReviews": 12,
      "condition": "New",
      "status": "Available",
      "monthlyPaymentEnabled": false,
      "monthlyPrice": null,
      "securityDeposit": 0,
      "createdAt": "2026-02-10T06:00:00.000Z",
      "updatedAt": "2026-02-10T06:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

**Error `400` (bad duration filter):**

```json
{
  "success": false,
  "message": "Invalid duration values: 5. Allowed values: 3, 6, 9, 11, 12, 24",
  "error": "VALIDATION_ERROR"
}
```

---

### `GET /api/products/6732b2c3d4e5f678901234abcd`

**Response `200`:** `{ "success": true, "data": { ...full product... } }`

**Response `404`:** `{ "success": false, "message": "Product not found", "error": "NOT_FOUND" }`

---

### `GET /api/users/cart`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "rentals": [
      {
        "id": "6732c3d4e5f678901234abcdef",
        "productId": "6732b2c3d4e5f678901234abcd",
        "quantity": 1,
        "price": {
          "3": 3200,
          "6": 6000,
          "9": 8200,
          "11": 9300,
          "12": 10000,
          "24": 16800
        },
        "product": { "_id": "6732b2c3d4e5f678901234abcd", "brand": "LG", "name": "LG Dual Inverter 1.5 Ton" },
        "paymentOption": "payAdvance",
        "createdAt": "2026-03-27T12:00:00.000Z"
      }
    ],
    "services": [
      {
        "id": "6732d4e5f678901234abcdef01",
        "serviceId": "6732e5f678901234abcdef0123",
        "serviceTitle": "AC Jet Wash Service",
        "servicePrice": 599,
        "bookingDetails": {
          "date": "2026-04-10",
          "time": "10-12",
          "address": "12 MG Road, Bangalore",
          "addressType": "someoneElse",
          "contactName": "Amit",
          "contactPhone": "+919988776655",
          "paymentOption": "payAdvance"
        },
        "createdAt": "2026-03-27T12:05:00.000Z"
      }
    ]
  }
}
```

---

### `POST /api/users/cart/rentals`

**Request**

```json
{
  "productId": "6732b2c3d4e5f678901234abcd",
  "quantity": 1,
  "paymentOption": "payAdvance"
}
```

**Response `201`**

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "6732c3d4e5f678901234abcdef",
    "productId": "6732b2c3d4e5f678901234abcd",
    "quantity": 1,
    "paymentOption": "payAdvance",
    "createdAt": "2026-03-28T09:00:00.000Z"
  }
}
```

**Errors:** `400` `Product ID is required`; `404` product not found.

---

### `POST /api/users/cart/services`

**Request**

```json
{
  "serviceId": "6732e5f678901234abcdef0123",
  "bookingDetails": {
    "date": "2026-04-10",
    "time": "2-4",
    "address": "221B Baker Street, Indiranagar, Bangalore",
    "addressType": "other",
    "contactName": "Amit Kumar",
    "contactPhone": "+919988776655",
    "paymentOption": "payAdvance"
  }
}
```

(`addressType` **`other`** here matches controller validation for this endpoint; cart schema enum also includes `someoneElse` for stored docs — keep consistent with the code path you use.)

---

### `POST /api/users/orders` — create order

**Headers:** `Authorization: Bearer <token>`

**Request (minimal realistic rental + pay now)**

```json
{
  "orderId": "ORD-2026-047",
  "paymentOption": "payNow",
  "paymentStatus": "pending",
  "total": 10000,
  "productDiscount": 1000,
  "discount": 1500,
  "couponCode": "SUMMER24",
  "couponDiscount": 500,
  "paymentDiscount": 1000,
  "finalTotal": 8500,
  "priorityServiceScheduling": true,
  "advanceAmount": null,
  "remainingAmount": null,
  "customerInfo": {
    "userId": "6732a1b2c3d4e5f678901234",
    "name": "Riya Sharma",
    "email": "riya.sharma@example.com",
    "phone": "9876543210",
    "homeAddress": "12 MG Road",
    "pincode": "560001"
  },
  "deliveryAddresses": [
    {
      "line1": "12 MG Road",
      "city": "Bangalore",
      "pincode": "560001",
      "phone": "9876543210"
    }
  ],
  "items": [
    {
      "type": "rental",
      "productId": "6732b2c3d4e5f678901234abcd",
      "quantity": 1,
      "duration": 12,
      "price": 10000,
      "isMonthlyPayment": false
    }
  ],
  "notes": "Please call before delivery",
  "orderDate": "2026-03-28T10:30:00.000Z"
}
```

**`customerInfo.userId`** must match the authenticated user (unless admin).

**Response `201`**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD-2026-047",
    "finalTotal": 8500,
    "advanceAmount": null,
    "remainingAmount": null,
    "paymentStatus": "pending",
    "status": "pending",
    "createdAt": "2026-03-28T10:31:00.000Z",
    "order": {
      "_id": "6732f678901234abcdef012345",
      "orderId": "ORD-2026-047",
      "userId": "6732a1b2c3d4e5f678901234",
      "items": [
        {
          "type": "rental",
          "productId": { "_id": "6732b2c3d4e5f678901234abcd", "brand": "LG", "name": "LG Dual Inverter 1.5 Ton" },
          "quantity": 1,
          "price": 10000,
          "duration": 12,
          "isMonthlyPayment": false
        }
      ],
      "total": 10000,
      "productDiscount": 1000,
      "discount": 1500,
      "couponCode": "SUMMER24",
      "couponDiscount": 500,
      "paymentDiscount": 1000,
      "finalTotal": 8500,
      "paymentOption": "payNow",
      "paymentStatus": "pending",
      "status": "pending",
      "priorityServiceScheduling": true,
      "customerInfo": {},
      "refundDisplayMessage": null,
      "createdAt": "2026-03-28T10:31:00.000Z",
      "updatedAt": "2026-03-28T10:31:00.000Z"
    }
  }
}
```

**Common create errors**

| Status | `message` | `error` |
|--------|-----------|---------|
| 403 | `Customer info userId must match authenticated user` | `FORBIDDEN` |
| 400 | `Order ID ORD-2026-047 already exists` | `ORDER_ID_DUPLICATE` |
| 400 | `Order items are required` | `VALIDATION_ERROR` |
| 400 | `Payment option must be "payNow", "payAdvance", or "payLater"` | `VALIDATION_ERROR` |
| 400 | `payAdvance option is only available for orders containing rentals` | `VALIDATION_ERROR` |

---

### `GET /api/users/:userId/orders?page=1&limit=10&status=pending`

**Example:** `GET /api/users/6732a1b2c3d4e5f678901234/orders?page=1&limit=10&status=pending`  
(`:userId` must be the authenticated user’s id unless `role === 'admin'`.)

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6732f678901234abcdef012345",
      "orderId": "ORD-2026-047",
      "finalTotal": 8500,
      "paymentStatus": "pending",
      "status": "pending",
      "items": [],
      "refundDisplayMessage": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

**Query params:** `status` (optional), `type` (`rental` | `service` | `all`), `page`, `limit`.

**403** if `:userId` ≠ logged-in user (non-admin):  
`{ "success": false, "message": "Not authorized to access these orders", "error": "FORBIDDEN" }`

---

### `GET /api/users/orders/ORD-2026-047` (or Mongo `_id`)

**Response `200`:** `{ "success": true, "data": { ...formatted order... } }`

For **cancelled + refund processed**, `data` may include:

```json
"refundStatus": "processed",
"refundAmount": 8500,
"refundDisplayMessage": "Amount has been refunded to your account.",
"refund": {
  "refundId": "rfnd_abc123",
  "razorpayRefundId": "rfnd_abc123",
  "amount": 8500,
  "amountInPaise": 850000,
  "status": "processed",
  "reason": "Changed plans",
  "processedAt": "2026-03-28T11:00:00.000Z"
},
"refundDetails": {
  "refundId": "rfnd_abc123",
  "amount": 8500,
  "status": "processed",
  "processedAt": "2026-03-28T11:00:00.000Z"
}
```

**Errors:** `404` `Order not found` (`NOT_FOUND`); `403` `You do not have permission to access this order` (`FORBIDDEN`).

---

### `POST /api/payments/create-order`

**Request**

```json
{
  "orderId": "ORD-2026-047",
  "amount": 8500
}
```

(`orderId` may be Mongo `_id` string instead. `amount` is **rupees**, must match server expectation within ₹0.01 — for `payAdvance` orders use `advanceAmount`, e.g. `500`.)

**Response `200`**

```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "paymentId": "PAY-1730456789012-8732",
    "orderId": "ORD-2026-047",
    "amount": 8500,
    "currency": "INR",
    "razorpayOrderId": "order_Ra1b2Cd3Ef4Gh5",
    "key": "rzp_live_XXXXXXXXXXXX",
    "paymentLink": null
  }
}
```

**Errors**

| Status | `message` | `error` |
|--------|-----------|---------|
| 400 | `Order ID and amount are required` | (no code) |
| 400 | `Order not found or does not belong to user` | `ORDER_NOT_FOUND` |
| 400 | `Order payment already completed` | `ORDER_ALREADY_PAID` |
| 400 | `Payment amount mismatch` | `AMOUNT_MISMATCH` (+ `details`) |
| 400 | `Payment amount (₹0.5) is less than minimum...` | `AMOUNT_TOO_LOW` |

---

### `POST /api/payments/verify`

**Request**

```json
{
  "razorpay_order_id": "order_Ra1b2Cd3Ef4Gh5",
  "razorpay_payment_id": "pay_Rz9y8Xw7Vu6Ts5",
  "razorpay_signature": "a83f5c2b9e1d7...",
  "paymentId": "PAY-1730456789012-8732"
}
```

Aliases accepted: `order_id`, `payment_id`, `signature`.

**Response `200` (success shape — see controller for full fields)**  
`{ "success": true, "message": "...", "data": { "paymentId", "orderId", "status", ... } }`

**Errors:** `400` `Razorpay order ID, payment ID, and signature are required`; `404` payment not found; `400` `Invalid payment signature...` (`SIGNATURE_MISMATCH`); `400` `Payment not captured...` (`PAYMENT_NOT_CAPTURED`).

---

### `POST /api/users/orders/ORD-2026-047/cancel`

**Request**

```json
{ "cancellationReason": "Ordered wrong capacity" }
```

**Response `200`**

```json
{
  "success": true,
  "message": "Order cancelled and refund processed successfully",
  "data": {
    "order": { "orderId": "ORD-2026-047", "status": "cancelled", "paymentStatus": "refunded" },
    "refund": { "status": "processed", "amount": 8500 }
  }
}
```

Alternate `message` values: `Order cancelled but refund processing failed...`; `Order cancelled successfully` (no card payment).

**Errors:** `400` `Cancellation reason is required`; `400` `Order is already cancelled`; `400` `Cannot cancel a completed order`; `404` order not found.

---

### `GET /api/users/orders/ORD-2026-047/refund-status`

**Response `200` (refund exists)**

```json
{
  "success": true,
  "data": {
    "refundId": "rfnd_abc123",
    "razorpayRefundId": "rfnd_abc123",
    "paymentId": "6733a1b2c3d4e5f678901234",
    "orderId": "6732f678901234abcdef012345",
    "amount": 8500,
    "amountInPaise": 850000,
    "status": "processed",
    "reason": "Ordered wrong capacity",
    "processedAt": "2026-03-28T11:00:00.000Z",
    "updatedAt": "2026-03-28T11:00:00.000Z",
    "razorpayRefundData": {}
  }
}
```

**Response `200` (no refund):**

```json
{
  "success": true,
  "message": "No refund found for this order",
  "data": null
}
```

**Errors:** `400` `Order is not cancelled` (`VALIDATION_ERROR`); `403` / `404` as order routes.

---

### Pending payment retry: `POST /api/users/orders/:orderId/create-razorpay-order`

**Important:** body `amount` is in **paise** (integer), not rupees.

**Request**

```json
{ "amount": 850000 }
```

(`850000` = ₹8500.00)

**Errors:** `400` `Amount is required`; `400` `Amount must be a positive number (in paise)`; plus order permission / not-found errors.

---

### `POST /api/coupons/validate`

**Request**

```json
{
  "code": "summer24",
  "orderTotal": 10000,
  "userId": "6732a1b2c3d4e5f678901234",
  "items": [
    { "type": "rental", "category": "AC", "duration": 12 }
  ]
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "6734b2c3d4e5f678901234abcd",
    "code": "SUMMER24",
    "title": "Spring sale",
    "description": "10% off",
    "type": "percentage",
    "value": 10,
    "minAmount": 5000,
    "maxDiscount": 2000,
    "discountAmount": 1000,
    "validFrom": "2026-01-01T00:00:00.000Z",
    "validUntil": "2026-12-31T23:59:59.000Z",
    "applicableCategories": ["AC"],
    "applicableDurations": [12, 24]
  }
}
```

**Error examples**

```json
{ "success": false, "message": "Coupon code is required", "error": "VALIDATION_ERROR" }
{ "success": false, "message": "Coupon code is invalid or expired", "error": "COUPON_INVALID" }
{ "success": false, "message": "Coupon is not yet valid", "error": "COUPON_NOT_STARTED" }
{ "success": false, "message": "Coupon has expired", "error": "COUPON_EXPIRED" }
{ "success": false, "message": "Coupon usage limit reached", "error": "COUPON_USAGE_LIMIT_REACHED" }
{ "success": false, "message": "Minimum order amount of ₹5000 required", "error": "COUPON_MIN_AMOUNT_NOT_MET" }
{ "success": false, "message": "You have already used this coupon", "error": "COUPON_USER_LIMIT_REACHED" }
{ "success": false, "message": "Coupon code is invalid or expired", "error": "COUPON_NOT_APPLICABLE" }
```

---

### Wishlist

**`GET /api/wishlist` → `200`**

```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "data": [
    {
      "_id": "6735c3d4e5f678901234abcd",
      "userId": "6732a1b2c3d4e5f678901234",
      "productId": "6732b2c3d4e5f678901234abcd",
      "product": { "brand": "LG", "model": "RS-Q19YNZE", "price": { "12": 10000 } },
      "createdAt": "2026-03-20T08:00:00.000Z",
      "updatedAt": "2026-03-20T08:00:00.000Z"
    }
  ]
}
```

**`POST /api/wishlist`** body: `{ "productId": "6732b2c3d4e5f678901234abcd" }`  
→ `201` with `message`: `Product added to wishlist`

**Errors:** `400` `Product ID is required`; `404` product not found; `400` `Product already in wishlist`

**`GET /api/wishlist/check/6732b2c3d4e5f678901234abcd` → `200`**

```json
{ "success": true, "isInWishlist": true }
```

**`DELETE /api/wishlist/:productId` → `200`**

```json
{ "success": true, "message": "Product removed from wishlist" }
```

---

### `POST /api/leads`

**Request**

```json
{
  "name": "Amit Kumar",
  "phone": "+919876543210",
  "interest": "rental",
  "source": "browse"
}
```

**Response `201`**

```json
{
  "success": true,
  "message": "Thank you! We will contact you soon.",
  "data": {
    "_id": "6739a1b2c3d4e5f678901234",
    "name": "Amit Kumar",
    "phone": "+919876543210",
    "email": "",
    "message": "",
    "source": "browse",
    "status": "new",
    "createdAt": "2026-03-28T14:00:00.000Z",
    "updatedAt": "2026-03-28T14:00:00.000Z"
  }
}
```

Validation failures: **`400`** `{ "success": false, "message": "<first validator message>" }` — e.g. `Phone number must be 10 digits with +91 prefix (e.g., +919876543210)`.

---

### `POST /api/contact`

**Request**

```json
{
  "name": "Amit Kumar",
  "email": "amit@example.com",
  "phone": "+919876543210",
  "message": "Need AC on rent in Whitefield."
}
```

**400** validation: `{ "success": false, "message": "Phone is required" }` etc.

---

### `POST /api/vendor-listing-request`

**Request (passes validator)**

```json
{
  "name": "Suresh Vendor",
  "phone": "+919988776655",
  "businessName": "CoolAir Supplies",
  "message": "We have 50 units in stock"
}
```

(`businessName` is required by validation; model may not store it — still send it.)

---

### `POST /api/acs/:id/inquiry`

**Request**

```json
{
  "name": "Neha",
  "email": "neha@example.com",
  "phone": "+919911223344",
  "duration": "Monthly",
  "message": "Need installation included"
}
```

**201 `data` example**

```json
{
  "_id": "6736d4e5f678901234abcdef",
  "acId": "6732b2c3d4e5f678901234abcd",
  "name": "Neha",
  "email": "neha@example.com",
  "phone": "+919911223344",
  "preferredDuration": "Monthly",
  "message": "Need installation included",
  "address": "",
  "status": "new",
  "createdAt": "2026-03-28T12:00:00.000Z"
}
```

---

### `POST /api/users/service-requests`

**Request**

```json
{
  "serviceType": "Repair",
  "productType": "AC",
  "brand": "LG",
  "model": "RS-Q19YNZE",
  "description": "Unit not cooling, water leaking",
  "address": "12 MG Road, Bangalore",
  "preferredDate": "2026-04-02",
  "preferredTime": "10-12"
}
```

**201:** `{ "success": true, "message": "Service request submitted successfully", "data": { ... } }`

---

### `POST /api/tickets`

**Request**

```json
{
  "subject": "Billing question for order ORD-2026-047",
  "description": "I was charged twice on UPI. Please check.",
  "category": "billing",
  "priority": "high",
  "relatedOrder": "6732f678901234abcdef012345",
  "attachments": ["https://res.cloudinary.com/demo/receipt1.jpg"]
}
```

---

### `GET /api/faqs`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6737e5f678901234abcdef01",
      "question": "What is the security deposit?",
      "answer": "It depends on the product...",
      "category": "rental",
      "createdAt": "2026-01-15T00:00:00.000Z",
      "updatedAt": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/admin/login` (Admin collection)

**Request**

```json
{ "email": "admin@example.com", "password": "adminpass" }
```

**Response `200`**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6738f678901234abcdef0123",
    "name": "Super Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**401:** `{ "success": false, "message": "Invalid credentials" }`

---

## Global & auth errors (middleware)

**No / bad Bearer token (`401`):**

```json
{
  "success": false,
  "message": "No token, authorization denied",
  "error": "UNAUTHORIZED"
}
```

```json
{
  "success": false,
  "message": "Token is not valid",
  "error": "UNAUTHORIZED"
}
```

**Admin only (`403`):**

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required",
  "error": "FORBIDDEN"
}
```

**Unknown route (`404`):**

```json
{
  "success": false,
  "message": "Route not found"
}
```

**Global handler (`middleware/errorHandler.js`) example `500`:**

```json
{
  "success": false,
  "message": "Server Error",
  "error": "SERVER_ERROR"
}
```

(Mongoose validation → often **`400`** with `message` joined from validators; CastError → **`404`** `Resource not found`; duplicate key **`400`** `Duplicate field value entered`.)

---

## Route index (all mounted paths)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/api/health` | No | `{ success, message }` |
| **ACs / catalog (products)** |
| GET | `/api/acs` | No | Query filters; returns **Products** (name kept for backward compatibility) |
| GET | `/api/acs/:id` | No | Product by Mongo id |
| POST | `/api/acs/:id/inquiry` | No | Rental inquiry (validated body) |
| **Leads & contact** |
| POST | `/api/leads` | No | Callback lead |
| POST | `/api/contact` | No | Contact form |
| POST | `/api/vendor-listing-request` | No | Vendor request (**validator expects `businessName`** — see quirks) |
| **Services & bookings** |
| GET | `/api/services` | No | List services |
| POST | `/api/service-bookings` | No | Create booking (validated) |
| GET | `/api/service-bookings/my-bookings` | User | My bookings |
| PATCH | `/api/service-bookings/:id` | User | Update booking |
| **Auth & users** |
| POST | `/api/auth/login` | No | Email + password |
| POST | `/api/auth/signup` | No | name, email, password, phone, … |
| POST | `/api/auth/forgot-password` | No | email |
| POST | `/api/auth/reset-password` | No | token, newPassword |
| POST | `/api/auth/send-otp` | No | phone (10-digit Indian) → `sessionId` |
| POST | `/api/auth/verify-otp` | No | phone, otp, sessionId |
| POST | `/api/auth/send-signup-otp` | No | Guest signup flow |
| POST | `/api/auth/verify-signup-otp` | No | Completes signup |
| GET | `/api/users/profile` | User | Profile |
| PATCH | `/api/users/profile` | User | Profile update |
| GET | `/api/users/:userId/orders` | User | **List** orders + `pagination`, query `status`, `type`, `page`, `limit` (must match token user unless admin) |
| **Products** |
| GET | `/api/products` | No | List + filters (see below) |
| GET | `/api/products/:id` | No | Single product |
| **Cart** (`/api/users/cart`) |
| GET | `/api/users/cart` | User | `{ data: { rentals, services } }` |
| POST | `/api/users/cart/rentals` | User | Add/update rental line |
| POST | `/api/users/cart/services` | User | Add/update service line |
| PATCH | `/api/users/cart/:itemId` | User | Update item |
| DELETE | `/api/users/cart/:itemId` | User | Remove line |
| DELETE | `/api/users/cart` | User | Clear cart |
| **Wishlist** |
| GET | `/api/wishlist` | User | |
| POST | `/api/wishlist` | User | Add |
| GET | `/api/wishlist/check/:productId` | User | |
| DELETE | `/api/wishlist/:productId` | User | |
| **Orders** (mounted at **`/api/users/orders`** and **`/api/orders`**) |
| GET | `.../orders/:orderId` | User | Get one (accepts `_id` or `orderId` string) — **not** the list endpoint |
| POST | `.../orders` | User | Create order |
| PATCH | `.../orders/:orderId/cancel` | User **or** Admin | Body: `cancellationReason` (required) |
| GET | `.../orders/:orderId/refund-status` | User **or** Admin | Cancelled + paid orders |
| POST | `.../orders/:orderId/create-razorpay-order` | User | Retry payment (pending) |
| POST | `.../orders/:orderId/verify-payment` | User | Verify Razorpay for pending order |
| PATCH | `.../orders/:orderId/status` | **Admin** | Fulfillment status (same router; use **admin** JWT) |
| **Payments** |
| POST | `/api/payments/webhook/razorpay` | No | Raw body / signature (Razorpay) |
| GET | `/api/payments/link` | User | Payment link helper |
| POST | `/api/payments/create-order` | User | Create Razorpay order — body: `orderId`, `amount` |
| POST | `/api/payments/refund` | Admin | Manual refund |
| POST | `/api/payments/process` | User | |
| POST | `/api/payments/initiate` | User | Legacy: `orderId`, `amount`, `paymentMethod`, `paymentGateway?` |
| POST | `/api/payments/verify` | User | Razorpay verify (see body below) |
| POST | `/api/payments/calculate` | User | |
| GET | `/api/payments/:paymentId` | User | Status |
| **Service requests (post-order repair etc.)** |
| GET | `/api/users/service-requests` | User | List mine |
| POST | `/api/users/service-requests` | User | Create |
| GET | `/api/users/service-requests/admin/all` | Admin | All |
| PATCH | `/api/users/service-requests/admin/:requestId` | Admin | Update |
| **Tickets** |
| POST | `/api/tickets` | User | Create |
| GET | `/api/tickets` | User | List |
| GET | `/api/tickets/:ticketId` | User | One |
| **FAQs** |
| GET | `/api/faqs` | No | List |
| **Coupons** |
| POST | `/api/coupons/validate` | No | Validate code |
| GET | `/api/coupons/available` | No | Public list |
| **Settings** |
| GET | `/api/settings` | No | `instantPaymentDiscount`, `advancePaymentDiscount`, `advancePaymentAmount` |
| GET | `/api/admin/settings` | Admin | + `updatedAt` |
| PUT | `/api/admin/settings` | Admin | Partial update |
| **Admin** (`/api/admin`) — *in `routes/admin.js`; several AC/rental/service routes use `auth` not `adminAuth` in source* |
| POST | `/api/admin/login` | No | Admin collection login → `token` + `user` |
| GET | `/api/admin/acs` | `auth` | List ACs (admin) |
| POST | `/api/admin/acs` | `auth` | Create AC |
| PATCH | `/api/admin/acs/:id` | `auth` | Update AC |
| DELETE | `/api/admin/acs/:id` | `auth` | Delete AC |
| GET | `/api/admin/rental-inquiries` | `auth` | List rental inquiries |
| PATCH | `/api/admin/rental-inquiries/:inquiryId` | `auth` | Update inquiry |
| GET | `/api/admin/vendor-requests` | `auth` | List vendor listing requests |
| POST | `/api/admin/services` | `auth` | Create service |
| PATCH | `/api/admin/services/:id` | `auth` | Update service |
| DELETE | `/api/admin/services/:id` | `auth` | Delete service |
| GET | `/api/admin/service-bookings` | `adminAuth` | List service bookings |
| PATCH | `/api/admin/service-bookings/:leadId` | `adminAuth` | Update booking status |
| GET | `/api/admin/products` | `adminAuth` | List products (admin) |
| POST | `/api/admin/products` | `adminAuth` | Create product |
| PATCH | `/api/admin/products/:id` | `adminAuth` | Update product |
| DELETE | `/api/admin/products/:id` | `adminAuth` | Delete product |
| GET | `/api/admin/orders` | `adminAuth` | List all orders |
| PATCH | `/api/admin/orders/:orderId/status` | `adminAuth` | Order fulfillment status |
| PATCH | `/api/admin/orders/:orderId/payment-status` | `adminAuth` | Manual payment update (e.g. pay-later marked paid) |
| GET | `/api/admin/service-requests` | `adminAuth` | List service requests |
| PATCH | `/api/admin/service-requests/:requestId` | `adminAuth` | Update service request |
| GET | `/api/admin/tickets` | `adminAuth` | List tickets |
| PATCH | `/api/admin/tickets/:ticketId/status` | `adminAuth` | Ticket status |
| POST | `/api/admin/tickets/:ticketId/remarks` | `adminAuth` | Admin remark |
| POST | `/api/admin/faqs` | `adminAuth` | Create FAQ |
| PATCH | `/api/admin/faqs/:id` | `adminAuth` | Update FAQ |
| DELETE | `/api/admin/faqs/:id` | `adminAuth` | Delete FAQ |
| GET | `/api/admin/coupons` | `adminAuth` | List coupons |
| GET | `/api/admin/coupons/:id` | `adminAuth` | One coupon |
| POST | `/api/admin/coupons` | `adminAuth` | Create coupon |
| PUT | `/api/admin/coupons/:couponId` | `adminAuth` | Update coupon |
| DELETE | `/api/admin/coupons/:couponId` | `adminAuth` | Delete coupon |
| GET | `/api/admin/coupons/:id/stats` | `adminAuth` | Usage stats |
| GET | `/api/admin/leads` | `adminAuth` | List leads |
| GET | `/api/admin/leads/stats` | `adminAuth` | Lead stats (**declare this route before** `GET /api/admin/leads/:id` in Express — already ordered in source) |
| GET | `/api/admin/leads/:id` | `adminAuth` | One lead |
| PATCH | `/api/admin/leads/:id` | `adminAuth` | Update lead |
| DELETE | `/api/admin/leads/:id` | `adminAuth` | Delete lead |
| GET | `/api/admin/users` | `adminAuth` | List users |
| GET | `/api/admin/users/:userId` | `adminAuth` | One user |
| GET | `/api/admin/users/:userId/orders` | `adminAuth` | User’s orders |
| GET | `/api/admin/users/:userId/stats` | `adminAuth` | User stats |

**Deprecated / not mounted:** `routes/rentalInquiries.js` exports an empty router — rental inquiries for users go through **`POST /api/acs/:id/inquiry`** and admin list above.

---

## End-to-end API sequences

Use these **in order** when wiring flows.

### A. Browse → product detail

1. `GET /api/products?category=AC&page=1&limit=20` (or `GET /api/acs?category=AC` — same data model).
2. `GET /api/products/6732b2c3d4e5f678901234abcd` for detail.

### B. Optional: public settings before checkout UI

1. `GET /api/settings` → use `instantPaymentDiscount`, `advancePaymentDiscount`, `advancePaymentAmount` for labels and advance ₹ amount.

### C. Authenticated user — rental in cart → order → Razorpay (pay now)

1. `POST /api/auth/login` or OTP flow → store `token`.
2. `POST /api/users/cart/rentals` with `productId`, `quantity`, `paymentOption` (`payNow` or `payAdvance`).
3. `GET /api/users/cart` to confirm line items.
4. `POST /api/users/orders` (or `/api/orders`) with full `items`, `paymentOption: "payNow"`, totals, `customerInfo`, etc. → `201`, `data.order`, `paymentStatus` often **`pending`** until gateway completes.
5. `POST /api/payments/create-order` with `{ "orderId": "ORD-2026-047", "amount": 8500 }` — **amount in rupees**, must match server expectation (`finalTotal` for pay now).
6. Open Razorpay Checkout with `razorpayOrderId`, `key`, amount in **paise** on client (`order_amount` from gateway response / `amount * 100`).
7. `POST /api/payments/verify` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, optional `paymentId` (`PAY-...`).
8. `GET /api/users/orders/ORD-2026-047` (or Mongo `_id`) to refresh `paymentStatus: "paid"`, `status` may move toward `confirmed` per business logic.

### D. Pay advance (rentals only)

1. Same cart + `POST /api/users/orders` with `paymentOption: "payAdvance"` and server-calculated `advanceAmount` / `remainingAmount` in body as your app submits.
2. `POST /api/payments/create-order` — **`amount` must be `advanceAmount` in rupees** (e.g. `500`), not full `finalTotal`.
3. After verify, order may still show remaining balance for later collection — re-read order object fields.

### E. Pay later

1. `POST /api/users/orders` with `paymentOption: "payLater"` and appropriate `paymentStatus` (typically **`pending`**).
2. **No** Razorpay `create-order` / `verify` required for the customer at checkout time.
3. Admin may later `PATCH /api/admin/orders/:orderId/payment-status` to mark paid (manual/UPI/cash).

### F. Pending order — retry payment (uses **paise**)

1. `POST /api/users/orders/:orderId/create-razorpay-order` with `{ "amount": 850000 }` — **integer paise**.
2. Complete checkout → `POST /api/users/orders/:orderId/verify-payment` (controller handles pending-order flow — align body with `orderController.verifyPaymentForPendingOrder`).

### G. Cancel order + refund

1. `PATCH /api/users/orders/:orderId/cancel` with `{ "cancellationReason": "..." }` (user or admin).
2. If paid online, server may set `paymentStatus: "refunded"` and create refund record.
3. `GET /api/users/orders/:orderId/refund-status` for dedicated refund object; or read `refundDisplayMessage` / `refund` on order from `GET` single order.

---

## Known cross-field quirks (read before implementing forms)

| Topic | Detail |
|--------|--------|
| **Cart `POST .../cart/services`** | `cartController` requires `bookingDetails.addressType === "other"` (with contact fields), **not** `someoneElse`. |
| **Cart schema** (`models/Cart.js`) | `bookingDetails.addressType` enum includes **`someoneElse`** — can appear in **GET cart** responses if old data saved that way; **new writes** should use **`other`** for service cart POST. |
| **Service booking** (`POST /api/service-bookings`) | Validator uses **`myself`** / **`other`**; payment option **`payNow`** / **`payLater`** (not `payAdvance`). |
| **ServiceBooking model** | Same: `addressType` `myself` \| `other`. |
| **Vendor listing** | Validator requires **`businessName`**; `VendorListing` schema does **not** store it — still send it to pass validation. |
| **Lead phone** | Must be exactly `+91` + 10 digits (`/^\+91[0-9]{10}$/`). |
| **Admin route auth** | `routes/admin.js` uses **`auth`** for AC/rental/vendor/service mutations and **`adminAuth`** for most dashboard data — confirm production expects strong `adminAuth` everywhere before relying on weaker routes. |
| **`updatePaymentStatus`** | Imported in `routes/orders.js` but **only mounted** as `PATCH /api/admin/orders/:orderId/payment-status`, not on user order router. |

---

## Key request / response shapes

### Auth: login (`POST /api/auth/login`)

**Body:** `{ "email", "password" }`

**200:** `{ success, message, token, user: { id, _id, name, email, role, phone, homeAddress, nearLandmark, pincode, alternateNumber } }`

### Auth: signup (`POST /api/auth/signup`)

**Body:** `{ name, email, password, phone, homeAddress?, interestedIn? }`  
Phone is normalized to 10 digits (strip leading `91`).

### OTP login

- **`POST /api/auth/send-otp`:** `{ phone }` → `{ success, message, sessionId }` (dev may return `otp`).
- **`POST /api/auth/verify-otp`:** `{ phone, otp, sessionId }` → same shape as login success.

### User profile

- **`GET /api/users/profile`:** `{ success, data: { id, _id, name, email, phone, homeAddress, nearLandmark, pincode, alternateNumber, interestedIn, role, address: {…}, createdAt } }`
- **`PATCH /api/users/profile`:** body may use **either** top-level `homeAddress` **or** nested `address.homeAddress` (and same for landmark, pincode, alternate).

### Products list (`GET /api/products` or `GET /api/acs`)

**Query:** `category`, `search`, `brand`, `capacity`, `type`, `location`, `duration` (comma-separated: `3,6,12,24`), `minPrice`, `maxPrice`, `page`, `limit`.

**200:** `{ success, data: Product[], total, page, limit }` — each product includes `price: { 3, 6, 9, 11, 12, 24 }` (missing keys filled with `null`).

### Cart

**`GET /api/users/cart`**

```json
{
  "success": true,
  "data": {
    "rentals": [
      {
        "id": "<cartItem _id>",
        "productId": "...",
        "quantity": 1,
        "price": {},
        "product": { }
      }
    ],
    "services": [
      {
        "id": "<cartItem _id>",
        "serviceId": "...",
        "serviceTitle": "",
        "servicePrice": 0,
        "bookingDetails": {
          "date": "YYYY-MM-DD",
          "time": "10-12",
          "address": "",
          "addressType": "myself|someoneElse",
          "contactName": "",
          "contactPhone": "",
          "paymentOption": "payNow|payAdvance"
        }
      }
    ]
  }
}
```

**Note:** Cart model allows `addressType` **`someoneElse`** for rentals path in schema; **service booking** validation elsewhere uses **`other`**. Align frontend with the endpoint you call.

**`POST /api/users/cart/rentals`:** `{ productId, quantity?, paymentOption? }` — `paymentOption`: `payNow` | `payAdvance` (default `payAdvance`).

**`POST /api/users/cart/services`:** `{ serviceId, bookingDetails: { date, time, address, addressType, contactName?, contactPhone?, paymentOption? } }` — for `addressType === "other"`, contact fields required.

### Create order (`POST /api/users/orders` or `POST /api/orders`)

**Headers:** `Authorization` required.

**Body (principal fields):**

```json
{
  "orderId": "ORD-2026-xxx",
  "items": [],
  "paymentOption": "payNow|payAdvance|payLater",
  "paymentStatus": "pending|paid|...",
  "total": 0,
  "productDiscount": 0,
  "discount": 0,
  "couponCode": "",
  "couponDiscount": 0,
  "paymentDiscount": 0,
  "finalTotal": 0,
  "customerInfo": {},
  "deliveryAddresses": [],
  "notes": "",
  "orderDate": "",
  "shippingAddress": "",
  "billingAddress": "",
  "priorityServiceScheduling": false,
  "advanceAmount": null,
  "remainingAmount": null
}
```

**Item types:**

- **Rental:** `type: "rental"`, `productId`, `quantity`, `price`, `duration` (3|6|9|11|12|24), optional `product`, `productDetails`, `deliveryInfo`, `isMonthlyPayment`, `monthlyPrice`, `monthlyTenure`, `securityDeposit`, installation charge snapshots, etc.
- **Service:** `type: "service"`, `serviceId`, `price`, optional `service`, `serviceDetails`, `bookingDetails`.

**Rules (high level):**

- `payAdvance` only if order contains **rentals**.
- `payLater` allowed for mixed orders per controller comments.
- `orderId` must be **unique** if provided.

**Order statuses (`status`):** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `installed`, `completed`, `cancelled`.

**Payment status (`paymentStatus`):** `pending`, `paid`, `failed`, `refunded`.

**Responses:** orders are often passed through `formatOrderResponse` — includes rounded money and, for cancelled orders with refunds, **`refundDisplayMessage`**, **`refund`**, **`refundDetails`**, **`refundAmount`**, **`refundStatus`**.

### List user orders (`GET /api/users/:userId/orders` only)

**Query:** `status`, `type` (`rental` | `service` | `all`), `page`, `limit`.

### Cancel order (`PATCH .../orders/:orderId/cancel`)

**Body:** `{ "cancellationReason": "required string" }`  
**Auth:** user (own order) or admin.

Triggers Razorpay refund when applicable (`payNow` → full `finalTotal`; `payAdvance` → `advanceAmount`).

### Payment: create Razorpay order (`POST /api/payments/create-order`)

**Body:** `{ orderId, amount }` — `orderId` can be Mongo id or `orderId` string; `amount` must match server expectation (`finalTotal` or `advanceAmount` for advance orders, within 0.01 tolerance).

**200 `data`:** `paymentId`, `orderId`, `amount`, `currency`, `razorpayOrderId`, `key` (Razorpay key id), `paymentLink?`.

### Payment: verify (`POST /api/payments/verify`)

**Body (any of these aliases):**

- `razorpay_order_id` or `order_id`
- `razorpay_payment_id` or `payment_id`
- `razorpay_signature` or `signature`
- Optional `paymentId` (your `PAY-...` id)

### Coupons

**`POST /api/coupons/validate`:** `{ code, orderTotal, userId?, items? }` — check controller for discount math and error codes (`COUPON_INVALID`, etc.).

**`GET /api/coupons/available`:** lists eligible public coupons (see `couponController`).

### Service booking (public `POST /api/service-bookings`)

Validated body includes: `serviceId`, `serviceTitle`, `servicePrice`, `name`, `phone` (E.164), **`date` or `preferredDate`**, **`time` or `preferredTime`**, `address`, `addressType` (`myself`|`other`), `contactName`/`contactPhone` if `other`, `paymentOption` (`payNow`|`payLater`), optional `description`, `notes`, `images[]`.

### Service request (`POST /api/users/service-requests`)

**Body:** `{ serviceType, productType, brand?, model?, description, address, preferredDate?, preferredTime? }`

- `serviceType`: `Repair` | `Maintenance` | `Installation`
- `productType`: `AC` | `Refrigerator` | `Washing Machine`

**Admin patch:** `{ status?, assignedTo?, technicianNotes? }` — status values include **`In Progress`** (space) per controller.

### Ticket (`POST /api/tickets`)

**Body:** `{ subject, description, category?, priority?, relatedOrder?, relatedServiceBooking?, relatedServiceRequest?, relatedRentalInquiry?, attachments? }`

Categories: `general`, `technical`, `billing`, `service`, `complaint`, `other`.  
Priority: `low`, `medium`, `high`, `urgent`.

### Lead (`POST /api/leads`)

**Body:** `{ name, phone (+91XXXXXXXXXX), interest: "rental"|"service", source: "browse"|"contact" }`

### Contact (`POST /api/contact`)

**Body:** `{ name, email, phone (E.164), message }` — optional `subject` not in validator but in model.

### Rental inquiry (`POST /api/acs/:id/inquiry`)

Validator: `name`, `email`, `phone` (E.164), `duration` ∈ `Monthly|Quarterly|Yearly`, optional `message`.

Controller also accepts **`productId` / `acId` in body**, **`acDetails`**, **`preferredDuration`** (maps to model `duration`), optional **`address`** (returned in response only).

### Admin login (`POST /api/admin/login`)

**Body:** `{ email, password }`  
**200:** `{ success, token, user: { _id, name, email, role } }` — uses **`Admin`** collection, not `User`.

For admin APIs that use `adminAuth`, the JWT must belong to a **`User` with `role: 'admin'`** or legacy **`Admin`** document (see `middleware/auth.js`).

---

## MongoDB / API data models (summary)

### User

- `name`, `email` (sparse unique), `password` (optional), **`phone`** (required, unique, 10+ digits stored)
- `homeAddress`, `pincode`, `nearLandmark`, `alternateNumber`
- `interestedIn`: `['AC','Refrigerator','Washing Machine']`
- `role`: `user` | `admin` | `vendor`
- `resetPasswordToken`, `resetPasswordExpire`
- `isGuestCheckout`, `guestCheckoutDate`

### Product (rental catalog)

- `category`: `AC` | `Refrigerator` | `Washing Machine`
- `name`, `brand`, `model`, `type`, `capacity`, `location`
- `price`: keys **3, 6, 9, 11, 12, 24** (numbers)
- `discount`, `images[]`, `features{ specs[], dimensions, safety[] }`
- Category extras: `energyRating`, `operationType`, `loadType`, `weight` (enum), `installationCharges` (AC only)
- `reviews[]`, `averageRating`, `totalReviews`
- `condition`: `New` | `Refurbished`
- `status`: `Available` | `Rented Out` | `Under Maintenance`
- `monthlyPaymentEnabled`, `monthlyPrice`, `securityDeposit`

### Order

- `orderId` (unique string), `userId`, `items[]` (see above)
- `total`, `productDiscount`, `discount`, `couponCode`, `couponDiscount`, `paymentDiscount`, `finalTotal`
- `paymentOption`, `paymentStatus`, `status`
- `priorityServiceScheduling`, `advanceAmount`, `remainingAmount`
- `customerInfo`, `deliveryAddresses[]`, `notes`, `orderDate`, `shippingAddress`, `billingAddress`
- `paymentDetails{ paymentId, transactionId, gateway, paidAt }`
- `cancellationReason`, `cancelledAt`, `cancelledBy` (`user`|`admin`)

### Cart

- `userId`, `type`: `rental`|`service`
- Rental: `productId`, `quantity`, `paymentOption`
- Service: `serviceId`, `serviceTitle`, `servicePrice`, `bookingDetails{ date, time, address, addressType, contactName, contactPhone, paymentOption }`

### Wishlist

- `userId`, `productId` (unique pair)

### Payment

- `paymentId` (string), `orderId`, `userId`, `amount`, `currency`, `paymentMethod`, `status`, `gatewayOrderId`, `transactionId`, `razorpayPaymentId`, refund fields

### Refund

- `refundId`, `razorpayRefundId`, `paymentId`, `orderId`, `amount`, `amountInPaise`, `status`, `reason`, `processedAt`, `razorpayRefundData`

### Service

- `title`, `description`, `price`, `originalPrice?`, `badge` (enum or null), `image`, `process[]`, `benefits[]`, `keyFeatures[]`, `recommendedFrequency`, **`category`** — must be one of `utils/serviceConstants.js`:

`Water Leakage Repair`, `AC Gas Refilling`, `AC Foam Wash`, `AC Jet Wash Service`, `AC Repair Inspection`, `Split AC Installation`

### ServiceBooking

- `bookingId`, `serviceId`, `userId?`, `serviceTitle`, `servicePrice`
- `name`, `phone`, `email?`, `date` (YYYY-MM-DD), `time` (slot enum)
- `address`, `nearLandmark`, `pincode`, `alternateNumber`
- `addressType`: `myself`|`other`, `contactName`, `contactPhone`
- `paymentOption`: `payNow`|`payLater`, `paymentStatus`, `description`, `images[]`
- `status`: `New`, `Contacted`, `In-Progress`, `Resolved`, `Rejected`, `Cancelled`
- `orderId`, `priorityScheduling`

### ServiceRequest

- `userId`, `serviceType`, `productType`, `brand`, `model`, `description`, `address`, `preferredDate`, `preferredTime`
- `status`: `Pending`, `Assigned`, `In Progress`, `Completed`, `Cancelled`
- `assignedTo`, `technicianNotes`, `completedAt`

### Ticket

- `user`, `subject`, `description`, `category`, `priority`, `status`
- Optional refs: `relatedOrder`, `relatedServiceBooking`, `relatedServiceRequest`, `relatedRentalInquiry`
- `attachments[]`, `adminRemark`, `remarkUpdatedAt`

### FAQ

- `question`, `answer`, `category`: `general`|`rental`|`service`|`payment`

### Coupon

- `code`, `title`, `description`, `type`: `percentage`|`fixed`, `value`, `minAmount`, `maxDiscount`, `validFrom`, `validUntil`, `usageLimit`, `usageCount`, `userLimit`, `applicableCategories[]`, `applicableDurations[]`, `isActive`

### Settings (singleton)

- `instantPaymentDiscount` (%), `advancePaymentDiscount` (%), `advancePaymentAmount` (₹), `updatedBy`

### AC (legacy schema — still in models; catalog may be Product-heavy)

- `brand`, `model`, `capacity`, `type` (`Split`|`Window`), `description`, `location`
- `price{ monthly, quarterly, yearly }`, `status`, `images[]`

### RentalInquiry

- `productId`, `acId?`, `productCategory`, `acDetails{...}`, `name`, `email`, `phone`, `message`
- `duration`: `Monthly`|`Quarterly`|`Yearly`
- `status`: `New`, `Contacted`, `In-Progress`, `Resolved`, `Rejected`

### VendorListing

- `name`, `phone`, `email`, `message?`  
  **Quirk:** `validateVendorListing` requires **`businessName`** but controller currently **does not persist** it — send it to pass validation, or fix backend.

### Lead (collection `callback_leads`)

- `name`, `phone` (+91…), `email`, `interest`, `source`, `status`, `notes`, `contactedAt`, `resolvedAt`

### Contact

- `name`, `email`, `phone`, `subject?`, `message`

### Admin (legacy)

- `name`, `email`, `password`, `role: 'admin'`

---

## Frontend alignment checklist

1. **API prefix:** all routes under `/api/...` as in `server.js`.
2. **Auth:** store JWT; send `Authorization: Bearer`.
3. **User id:** responses use both `id` and `_id` — normalize in one place.
4. **Orders:** support lookup by **`orderId` string** vs **`_id`** everywhere the backend does.
5. **Order list URL:** must call `GET /api/users/<mongoUserId>/orders`, not `GET /api/users/orders`.
6. **Razorpay:** `create-order` → checkout → `verify` with order id, payment id, signature (+ optional `paymentId`).
7. **Refunds / cancel:** expect `refundDisplayMessage`, nested `refund` / `refundDetails` on formatted orders.
8. **Settings:** drive pay-now / pay-advance UI from `GET /api/settings`.
9. **Service categories:** match `SERVICE_CATEGORIES` exactly (case-sensitive).
10. **Phone formats:** some forms want E.164 (`+919...`), leads want `+91` + 10 digits — follow each endpoint’s validation section above.
11. **Money:** `POST .../payments/create-order` = **rupees**; `POST .../orders/:id/create-razorpay-order` (pending retry) = **paise**.

---

## curl examples (replace tokens and ids)

```bash
# Health
curl -s http://localhost:5000/api/health

# Public settings
curl -s http://localhost:5000/api/settings

# Login
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"you@example.com\",\"password\":\"yourpassword\"}"

# Profile (paste JWT)
curl -s http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT"

# List products
curl -s "http://localhost:5000/api/products?category=AC&page=1&limit=10"

# User orders list — note :userId in path
curl -s "http://localhost:5000/api/users/USER_MONGO_ID/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT"

# Single order by business orderId
curl -s "http://localhost:5000/api/users/orders/ORD-2026-047" \
  -H "Authorization: Bearer YOUR_JWT"

# Create Razorpay order (amount in RUPEES)
curl -s -X POST http://localhost:5000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"ORD-2026-047\",\"amount\":8500}"

# Validate coupon
curl -s -X POST http://localhost:5000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"SUMMER24\",\"orderTotal\":10000}"
```

---

## Test data appendix (non-secret placeholders)

Use these only for **local/staging** smoke tests; create real rows via signup/admin if missing.

| Item | Placeholder |
|------|-------------|
| User email/password | Whatever you created via `POST /api/auth/signup` |
| User Mongo id | From login response `user._id` (24 hex chars) |
| Admin | `POST /api/admin/login` with credentials from your `Admin` seed script — **not** the same as User admin unless you unified accounts |
| Sample `productId` | Copy from `GET /api/products` → `data[0]._id` |
| Sample `orderId` | From `POST /api/users/orders` response `data.orderId` |
| Sample `paymentId` | From `POST /api/payments/create-order` → `data.paymentId` |

---

## Document version

| | |
|--|--|
| **Backend git commit** | `a228c9591a0c754fae7c31b75a982f11410e9859` |
| **Commit date** | 2025-11-26 (author timezone +0530) |
| **Reference updated** | 2026-03-28 (documentation pass; aligns with `BACKEND_BRIEF_FOR_API_REFERENCE.md`) |

If deployment differs from this commit, **diff `server.js` and `routes/`** against production before trusting this file.

---

### Note for maintainers

This file satisfies the checklist in **`BACKEND_BRIEF_FOR_API_REFERENCE.md`**: global contract, full route index (including admin rows), frontend-critical examples, end-to-end sequences, quirks, curl samples, test appendix, and version footer. Optional **OpenAPI 3** (`openapi.yaml`) was not generated; add it in a follow-up if tooling is introduced.

---

*If your deployed backend is an older commit, diff that deployment against this repo’s `routes/` and `server.js` for any path or field drift.*
