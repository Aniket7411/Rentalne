## Rental Service API Contract

Base URL: `http://localhost:5000/api`

Auth:
- Admin endpoints require `Authorization: Bearer <token>` returned from `POST /admin/login`.
- Public endpoints do not require auth.

Conventions:
- All responses follow `{ success: boolean, message?: string, data?: any, total?: number }`. When the backend differs, the frontend accepts both `data` at root or inside `data`.

### Auth
- POST `/admin/login`
  - Body: `{ email: string, password: string }`
  - 200: `{ token: string, user: { id, name, role: 'admin' } }`
  - 401/400: `{ message }`

### Catalog (Public)
- GET `/acs`
  - Query params (optional): `brand`, `capacity`, `type`, `location`, `minPrice`, `maxPrice`, `duration`
  - 200: `{ data: AC[], total?: number }`

- GET `/acs/{id}`
  - 200: `{ data: AC }` | 404

- POST `/acs/{id}/inquiry`
  - Body: `{ acId: string, name, email, phone, duration, message }`
  - 200: `{ message, data: Inquiry }`

### Services (Public)
- GET `/services`
  - 200: `{ data: Service[] }`

- POST `/service-bookings`
  - Body: `{ name, phone, serviceId, preferredDate, preferredTime, address, notes }`
  - 200: `{ message, data: ServiceBooking }`

### Lead Capture (Public)
- POST `/leads`
  - Body: `{ name, phone, message }`
  - 200: `{ message, data: Lead }`

### Contact (Public)
- POST `/contact`
  - Body: `{ name, email, phone, message }`
  - 200: `{ message }`

### Vendor Listing Request (Public)
- POST `/vendor-listing-request`
  - Body: `{ name, phone, businessName?, message }`
  - 200: `{ message }`

### Admin - AC Management (Requires Bearer token)
- GET `/admin/acs`
  - 200: `{ data: AC[] }`

- POST `/admin/acs`
  - Body: `{ brand, model, capacity, type, description, location, status, price, images: string[] }`
  - 200: `{ message, data: AC }`

- PATCH `/admin/acs/{id}`
  - Body: Partial of above (images is an array of URLs; omit to preserve)
  - 200: `{ message, data: AC }`

- DELETE `/admin/acs/{id}`
  - 200: `{ message }`

### Admin - Leads and Inquiries (Requires Bearer token)
- GET `/admin/service-bookings`
  - 200: `{ data: Lead[] }`

- PATCH `/admin/service-bookings/{leadId}`
  - Body: `{ status: 'New'|'Contacted'|'In-Progress'|'Resolved'|'Rejected' }`
  - 200: `{ message, data: Lead }`

- GET `/admin/rental-inquiries`
  - 200: `{ data: Inquiry[] }`

- PATCH `/admin/rental-inquiries/{inquiryId}`
  - Body: `{ status: 'New'|'Contacted'|'In-Progress'|'Resolved'|'Rejected' }`
  - 200: `{ message, data: Inquiry }`

### Admin - Services Management (Requires Bearer token)
- POST `/admin/services`
  - Body: `{ title, description, price, image? }`
  - 200: `{ message, data: Service }`

- PATCH `/admin/services/{id}`
  - Body: Partial: `{ title?, description?, price?, image? }`
  - 200: `{ message, data: Service }`

- DELETE `/admin/services/{id}`
  - 200: `{ message }`

### Schemas (Representative)
- AC: `{ _id|id, brand, model, capacity, type, description, location, status, price: { monthly, quarterly, yearly }, images: string[], createdAt }`
- Lead: `{ _id|id, name, phone, message?, serviceId?, status, createdAt }`
- Service: `{ _id|id, title, description, price, image?, createdAt }`
- Inquiry: `{ _id|id, acId, name, email, phone, duration, message, status, createdAt }`
- ServiceBooking: `{ _id|id, serviceId, name, phone, preferredDate, preferredTime, address, notes?, status, createdAt }`

### End-to-End Test Plan
- Auth
  - Login success with valid admin credentials -> receives token; protected endpoints authorized.
  - Login failure -> 401/400.
- Catalog
  - GET `/acs` with/without filters returns arrays; prices/durations filter correctly.
  - GET `/acs/{id}` returns single AC; 404 on non-existing.
  - POST `/acs/{id}/inquiry` validates fields and stores inquiry.
- Services
  - GET `/services` returns array.
  - POST `/service-bookings` creates booking; validate phone/date/time.
- Lead capture and contact
  - POST `/leads` stores lead.
  - POST `/contact` stores message.
  - POST `/vendor-listing-request` stores vendor request.
- Admin ACs (with token)
  - GET `/admin/acs` returns list.
  - POST `/admin/acs` creates AC (images are URLs).
  - PATCH `/admin/acs/{id}` updates fields; images optional.
  - DELETE `/admin/acs/{id}` deletes AC.
- Admin Leads/Inquiries (with token)
  - GET and PATCH flows update status with allowed values.
- Admin Services
  - POST creates service; PATCH updates; DELETE removes.

### Notes on Unused APIs
- Not used by frontend: `GET /services/{id}`, `POST /service-requests` (distinct from `/service-bookings`).
- You can omit implementing those unless needed later.

### Environment Variables
- Frontend expects `REACT_APP_API_URL` to override base URL (`/api` default `http://localhost:5000/api`).

### Curl Smoke Tests
Replace `<BASE>` with your API base and `<TOKEN>` after login.

```bash
# Admin login
curl -s -X POST <BASE>/admin/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}'

# Catalog
curl -s "<BASE>/acs?brand=LG&type=Split"
curl -s "<BASE>/acs/123"
curl -s -X POST "<BASE>/acs/123/inquiry" -H "Content-Type: application/json" -d '{"acId":"123","name":"Test","email":"t@e.co","phone":"+919999999999","duration":"Monthly","message":"Need ASAP"}'

# Services
curl -s "<BASE>/services"
curl -s -X POST "<BASE>/service-bookings" -H "Content-Type: application/json" -d '{"serviceId":"svc1","name":"Test","phone":"+919999999999","preferredDate":"2025-11-30","preferredTime":"10:00","address":"Addr"}'

# Lead & Contact
curl -s -X POST "<BASE>/leads" -H "Content-Type: application/json" -d '{"name":"Lead","phone":"+919999999999","message":"Call me"}'
curl -s -X POST "<BASE>/contact" -H "Content-Type: application/json" -d '{"name":"A","email":"a@b.co","phone":"+919999999999","message":"Hi"}'
curl -s -X POST "<BASE>/vendor-listing-request" -H "Content-Type: application/json" -d '{"name":"Vendor","phone":"+919999999999","businessName":"Cool Air","message":"Onboard"}'

# Admin ACs
curl -s -H "Authorization: Bearer <TOKEN>" "<BASE>/admin/acs"
curl -s -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" "<BASE>/admin/acs" -d '{"brand":"LG","model":"X","capacity":"1.5 Ton","type":"Split","description":"Test","location":"Mumbai","status":"Available","price":{"monthly":1000,"quarterly":2500,"yearly":9000},"images":[]}'
curl -s -X PATCH -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" "<BASE>/admin/acs/123" -d '{"status":"Rented Out"}'
curl -s -X DELETE -H "Authorization: Bearer <TOKEN>" "<BASE>/admin/acs/123"

# Admin Leads/Inquiries
curl -s -H "Authorization: Bearer <TOKEN>" "<BASE>/admin/service-bookings"
curl -s -X PATCH -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" "<BASE>/admin/service-bookings/lead1" -d '{"status":"Contacted"}'
curl -s -H "Authorization: Bearer <TOKEN>" "<BASE>/admin/rental-inquiries"
curl -s -X PATCH -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" "<BASE>/admin/rental-inquiries/inq1" -d '{"status":"Resolved"}'

# Admin Services
curl -s -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" "<BASE>/admin/services" -d '{"title":"Deep Clean","description":"Full deep clean","price":999}'
curl -s -X PATCH -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" "<BASE>/admin/services/svc1" -d '{"price":799}'
curl -s -X DELETE -H "Authorization: Bearer <TOKEN>" "<BASE>/admin/services/svc1"
```


