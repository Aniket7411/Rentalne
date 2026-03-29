# Brief for backend: regenerate `BACKEND_API_REFERENCE.md`

**Context.** The production frontend was lost. A new frontend is being rebuilt **only** from accurate API documentation. The file `BACKEND_API_REFERENCE.md` in the frontend repo (or a copy you return) must become the **single source of truth** so implementation can be completed end-to-end without guessing.

**Your deliverable.** An updated **`BACKEND_API_REFERENCE.md`** that:

1. Matches **exactly** what is mounted in the current backend (`server.js`, route files, middleware).
2. Removes or marks **deprecated** routes that no longer exist.
3. For **every** route the frontend needs (see checklist below), includes **enough detail to implement clients** without reading controller code.

---

## 1. Global section (must be accurate)

- [ ] Base path: `/api` (or actual prefix).
- [ ] Environments: e.g. local `http://localhost:PORT/api`, production URL pattern.
- [ ] Auth: how JWT is sent; **401/403** body shape (`success`, `message`, `error` codes).
- [ ] Success / error envelope rules (HTTP 200 with `success: false`, etc.).
- [ ] **Money:** for each payment-related endpoint, state clearly **rupees vs paise** (this causes production bugs if wrong).
- [ ] **IDs:** when to use human `orderId` vs Mongo `_id`; which endpoints accept **either**.

---

## 2. Route index table

- [ ] Every **mounted** route appears in a table: `Method | Path | Auth (none / user / admin) | Notes`.
- [ ] No placeholder rows like “see Admin …” without a following subsection that lists **real** admin paths, or the row is expanded.
- [ ] If `/api/products` duplicates `/api/acs`, document **which is canonical** for new clients.

---

## 3. Per-endpoint depth (minimum for “frontend-critical” routes)

For each route used in user shopping and payments, include:

- [ ] **Request:** required/optional fields; validation rules; **exact enum strings** (e.g. `paymentOption`, `duration` months, cart `addressType`).
- [ ] **Response (success):** realistic JSON (not empty `{ ... }`).
- [ ] **Errors:** status code, example `message`, `error` code if any.

**Frontend-critical paths (must be complete):**

| Area | Examples |
|------|----------|
| Catalog | `GET /acs`, `GET /acs/:id` (+ `GET /products` if separate) |
| Auth | login, signup, forgot/reset password, OTP if enabled |
| Profile | `GET/PATCH /users/profile` |
| Wishlist | list, add, check, delete |
| Cart | `GET` cart, `POST` rentals, `POST` services, `PATCH` item, `DELETE` item, `DELETE` clear |
| Orders | `POST` create, `GET` one, `GET` list (pagination query params), `PATCH` cancel |
| Refund / retry | `GET` refund-status, `POST` create-razorpay-order (**units!**), `POST` verify-payment |
| Payments | `POST` create-order, `POST` verify (Razorpay fields + aliases) |
| Coupons / settings | validate coupon, public settings keys |
| Admin (if frontend uses) | login, product CRUD path(s), inquiries |

---

## 4. End-to-end flows (new section recommended)

Add **`## End-to-end API sequences`** with **ordered** calls, for example:

1. **Browse → detail:** which `GET` with which query params.
2. **Add rental to cart → checkout:** exact bodies for `POST /users/cart/rentals`, then `POST /users/orders`, then payment steps with **correct amounts**.
3. **Pay later vs pay now vs pay advance:** when Razorpay is skipped vs required; what `paymentStatus` is after each step.
4. **Cancel order + refund status:** when refund exists vs “no refund”.

No need for automated tests here—only **explicit sequences** developers can follow.

---

## 5. Known cross-field quirks (document plainly)

- [ ] Cart / service booking: **`someoneElse` vs `other`** for `addressType`—which validator applies to which route.
- [ ] Any mismatch between **mongoose schema enum** and **route validator**.

---

## 6. Optional but high value

- [ ] **OpenAPI 3** (`openapi.yaml`) generated from routes + validators, or
- [ ] **`curl` examples** for every frontend-critical route.

---

## 7. Test data appendix (non-secret)

- [ ] Dev/staging: sample **user** login, **admin** login (if safe).
- [ ] Sample `productId`, `orderId` for manual checks.

---

## 8. Version footer

At the bottom of `BACKEND_API_REFERENCE.md`, add:

- Git commit hash or tag of the backend this doc reflects.
- Date.
- One line: “If deployment differs from this commit, diff `routes/` before trusting this file.”

---

**Thank you.** A complete document here removes days of ambiguity for the frontend rebuild and reduces “tension” to a checklist. Please return the updated `BACKEND_API_REFERENCE.md` (and optional `openapi.yaml`) so the frontend team can conclude the project.
