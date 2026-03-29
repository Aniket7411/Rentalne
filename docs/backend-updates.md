# Backend Updates Required

This document outlines all the backend changes required to support the new frontend features.

## 1. User Authentication

### New Endpoints Required:
- `POST /api/users/signup` - User registration
  - Body: `{ name, email, password, phone, role: 'user' }`
  - Returns: `{ token, user }`

- `POST /api/users/login` - User login
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### User Model Updates:
- Add fields: `alternatePhone`, `address`
- Ensure `role` field supports 'user', 'admin', 'vendor'

---

## 2. User Profile & Dashboard

### New Endpoints Required:
- `GET /api/users/:userId/profile` - Get user profile
  - Returns: User profile with address, alternatePhone, etc.

- `PATCH /api/users/:userId/profile` - Update user profile
  - Body: `{ name, phone, alternatePhone, address }`
  - Returns: Updated user profile

- `GET /api/users/:userId/rentals` - Get user's rental orders
  - Returns: Array of rental orders

- `GET /api/users/:userId/service-requests` - Get user's service requests
  - Returns: Array of service requests

- `GET /api/users/:userId/wishlist` - Get user's wishlist
  - Returns: Array of wishlist items

- `POST /api/users/:userId/wishlist` - Add to wishlist
  - Body: `{ productId, productType: 'ac' | 'washing-machine' | 'refrigerator' }`
  - Returns: Created wishlist item

- `DELETE /api/users/:userId/wishlist/:wishlistItemId` - Remove from wishlist
  - Returns: Success message

- `GET /api/users/:userId/issues` - Get user's issues/concerns
  - Returns: Array of issues

- `POST /api/users/:userId/issues` - Submit user concern
  - Body: `{ subject, message, type: 'general' | 'order' | 'service' | 'payment' | 'other' }`
  - Returns: Created issue

- `GET /api/users/:userId/reviews` - Get user's reviews
  - Returns: Array of reviews

- `POST /api/orders/:orderId/review` - Submit review for order
  - Body: `{ rating (1-5), comment }`
  - Returns: Created review

---

## 3. Product Model Updates

### AC Product Model:
Update the AC model to include:
```javascript
{
  name: String, // Product name
  brand: String,
  model: String,
  capacity: String, // '1 Ton', '1.5 Ton', '2 Ton'
  type: String, // 'Split', 'Window'
  location: String,
  description: String,
  status: String, // 'Available', 'Rented Out', 'Under Maintenance'
  productType: String, // 'ac'
  
  // Pricing - tenure based
  price: {
    '3months': Number,
    '6months': Number,
    '9months': Number,
    '11months': Number
  },
  
  // Optional fields
  actualPrice: Number, // Original price
  discountPercent: Number, // Discount percentage
  benefits: String,
  condition: String, // 'Brand New' or 'Refurbished'
  dimensions: String, // Optional
  features: [String], // Array of features
  
  images: [String], // Array of image URLs
  createdAt: Date,
  updatedAt: Date
}
```

### Washing Machine Product Model:
```javascript
{
  name: String,
  capacity: String, // e.g., '6 Kg', '7 Kg', '8 Kg'
  type: String, // 'Automatic' or 'Semi automatic'
  brand: String, // Optional
  location: String,
  description: String,
  status: String,
  productType: String, // 'washing-machine'
  
  // Pricing - tenure based
  price: {
    '3months': Number,
    '6months': Number,
    '9months': Number,
    '11months': Number
  },
  
  // Optional fields
  actualPrice: Number,
  discountPercent: Number,
  benefits: String,
  condition: String, // 'Brand New' or 'Refurbished'
  dimensions: String, // Optional
  features: [String], // Array of features
  
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Refrigerator Product Model:
```javascript
{
  name: String,
  capacity: String, // '190 litres', '210 litres', '240 litres'
  brand: String, // Optional
  location: String,
  description: String,
  status: String,
  productType: String, // 'refrigerator'
  
  // Pricing - tenure based
  price: {
    '3months': Number,
    '6months': Number,
    '9months': Number,
    '11months': Number
  },
  
  // Optional fields
  actualPrice: Number,
  discountPercent: Number,
  benefits: String,
  condition: String, // 'Brand New' or 'Refurbished'
  dimensions: String, // Optional
  features: [String], // Array of features
  
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Product Management Endpoints

### Unified Product Endpoints:
- `GET /api/products` - Get all products (ACs, Washing Machines, Refrigerators)
  - Query params: `type` **or** `productType`, `brand`, `capacity`, `location`, `minPrice`, `maxPrice`, `tenure`, `condition`, `search`
  - Returns: Filtered products array
  - Each product response should include `productType` so the frontend can route to the proper details page

- `GET /api/products/:id` - Get product by ID
  - Returns: Product details
  - Accepts query param `type` to disambiguate if IDs overlap per collection (e.g., `GET /api/products/123?type=washing-machine`)

- `POST /api/admin/products` - Add new product (any type)
  - Body: Product data based on type
  - Returns: Created product

- `PATCH /api/admin/products/:id` - Update product
  - Body: Partial product data
  - Returns: Updated product

- `DELETE /api/admin/products/:id` - Delete product
  - Returns: Success message

### Product Inquiry/Rental Endpoint:
- `POST /api/products/:productId/inquiry` - Create rental inquiry
  - Body: `{
    name, phone, email, message,
    tenure: '3months' | '6months' | '9months' | '11months',
    paymentOption: 'payAll' | 'bookWithAmount',
    bookingAmount: Number (if bookWithAmount),
    productType: 'ac' | 'washing-machine' | 'refrigerator'
  }`
  - Returns: Created inquiry with `productDetails` snapshot

---

## 5. Service Booking Updates

### Service Booking Model:
Update to include time slot:
```javascript
{
  serviceId: ObjectId,
  serviceTitle: String,
  servicePrice: Number,
  name: String,
  phone: String,
  date: Date,
  timeSlot: String, // Valid slots surfaced in UI: '9-10', '10-12', '12-2' (extendable)
  address: String,
  addressType: String, // 'myself' or 'someoneElse'
  contactName: String,
  contactPhone: String,
  paymentOption: String, // 'payNow' or 'payLater'
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Service Booking Endpoint:
- `POST /api/service-bookings` - Create service booking
  - Body: Updated booking data with `timeSlot` field
  - Returns: Created booking

---

## 6. Contact Form Fix

### Contact Endpoint:
- `POST /api/contact` - Submit contact form
  - Body: `{ name, email, phone, message, type: 'general' | 'vendor-listing' }`
  - Ensure the endpoint properly stores the data in database
  - Persist `type` so vendor-listing submissions can surface in the Admin “Vendor Requests” tab
  - Optional: store in a dedicated `contacts`/`vendorRequests` collection for easier tracking
  - Returns: Success message with stored contact data

---

## 7. Order/Rental Model Updates

### Rental/Order Model:
```javascript
{
  userId: ObjectId,
  productId: ObjectId,
  productType: String, // 'ac' | 'washing-machine' | 'refrigerator'
  productDetails: Object, // Snapshot of product at time of order
  tenure: String, // '3months' | '6months' | '9months' | '11months'
  price: Number, // Price for selected tenure
  paymentOption: String, // 'payAll' | 'bookWithAmount'
  bookingAmount: Number, // If bookWithAmount
  remainingAmount: Number, // If bookWithAmount
  status: String, // 'Pending', 'Active', 'Completed', 'Cancelled'
  startDate: Date,
  endDate: Date,
  vendorName: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. Admin Updates

### Admin Product Management:
- Update admin endpoints to handle all product types (AC, Washing Machine, Refrigerator)
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Add product (any type)
- `PATCH /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Admin Inquiry Management:
- `GET /api/admin/product-inquiries` - Get all product inquiries (for all product types)
- `PATCH /api/admin/product-inquiries/:id` - Update inquiry status
- Ensure each inquiry record persists `productType`, `productId`, and `productDetails` snapshot so the admin UI can display the correct product label/link.

### Admin Service Management:
- Update service management to handle queries for Refrigerators and Washing Machines
- Similar to existing AC service queries

---

## 9. Database Schema Updates

### Required Collections/Tables:
1. **users** - User accounts
2. **products** - Unified products collection (ACs, Washing Machines, Refrigerators)
3. **rentals** - Rental orders
4. **service-bookings** - Service bookings
5. **wishlist** - User wishlists
6. **issues** - User concerns/issues
7. **reviews** - Product/order reviews
8. **contacts** - Contact form submissions
9. **product-inquiries** - Product rental inquiries

---

## 10. API Response Format

All API responses should follow this format:
```javascript
{
  success: Boolean,
  message: String, // Optional
  data: Any, // Response data
  total: Number // Optional, for paginated responses
}
```

---

## 11. Filtering & Search

### Product Filtering:
Support filtering by:
- Product type (ac, washing-machine, refrigerator)
- Brand
- Capacity
- Location
- Price range (minPrice, maxPrice)
- Tenure (3months, 6months, 9months, 11months)
- Condition (Brand New, Refurbished)
- Search text (name, brand, model, description)

---

## 12. Important Notes

1. **Tenure-based Pricing**: Products now use tenure-based pricing (3, 6, 9, 11 months) instead of monthly/quarterly/yearly.

2. **Payment Options**: Orders support two payment options:
   - `payAll`: Pay full amount upfront (with discount if applicable)
   - `bookWithAmount`: Pay booking amount now, remaining after installation

3. **Time Slots**: Service bookings use time slot ranges (9-10, 10-12, 12-2, etc.) instead of specific times.

4. **Product Types**: System now supports three product types: AC, Washing Machine, and Refrigerator.

5. **Features Array**: Products can have multiple features stored as an array.

6. **User Dashboard**: Users can now manage profile, wishlist, orders, issues, and reviews.

7. **Contact Form**: Ensure contact form submissions are properly stored in the database.

---

## 13. Migration Steps

1. Update existing AC documents to include new fields (name, tenure-based pricing, etc.)
2. Create new collections for wishlist, issues, reviews
3. Update user model to include alternatePhone and address
4. Migrate existing pricing from monthly/quarterly/yearly to tenure-based
5. Update service booking model to include timeSlot
6. Create unified products endpoint that handles all product types

---

## 14. Testing Checklist

- [ ] User signup and login
- [ ] User profile update (including address and alternate phone)
- [ ] Product creation (AC, Washing Machine, Refrigerator)
- [ ] Product filtering and search
- [ ] Product inquiry with payment options
- [ ] Service booking with time slots
- [ ] Wishlist add/remove
- [ ] Issue submission
- [ ] Review submission
- [ ] Contact form submission
- [ ] Admin product management for all types
- [ ] Order creation with tenure and payment options

---

## Contact

For any questions or clarifications regarding these backend updates, please contact the frontend development team.

