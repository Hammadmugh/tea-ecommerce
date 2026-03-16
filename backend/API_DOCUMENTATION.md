# Ecommerce Tea API Documentation

## Overview
This API collection provides complete CRUD operations for an e-commerce platform specializing in tea products. It implements JWT-based authentication, role-based access control, product management with variants, shopping cart functionality, and order management.

## Files
- **Ecommerce-Tea-API.postman_collection.json** - Complete API collection with all endpoints
- **Ecommerce-Tea-Dev.postman_environment.json** - Development environment variables

## Setup Instructions

### 1. Import Postman Collection
- Open Postman
- Click "Import" → Select "Ecommerce-Tea-API.postman_collection.json"
- Click "Import"

### 2. Import Environment
- Click on "Environments" in the left sidebar
- Click "Import"
- Select "Ecommerce-Tea-Dev.postman_environment.json"
- Click "Import"

### 3. Select Environment
- Click the environment dropdown (top-right)
- Select "Ecommerce Tea - Development"

## API Endpoints Structure

### Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication (`/auth`)

### `POST /auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": "...", "email": "...", "role": "user" },
  "token": "jwt_token_here"
}
```

---

### `POST /auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "role": "user" },
  "token": "jwt_token_here"
}
```

---

### `GET /auth/validate`
Validate JWT token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "user": { "id": "...", "email": "...", "role": "user" }
}
```

---

### `POST /auth/refresh`
Refresh JWT token before expiration.

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token_here"
}
```

---

## 2. Products (`/products`)

### `GET /products`
Get all products with pagination and filtering.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `category` - Filter by category (e.g., "chai", "black")
- `minPrice` - Filter by minimum price
- `maxPrice` - Filter by maximum price
- `flavor` - Filter by flavor (e.g., "spicy", "fruity")
- `sortBy` - Sort field (e.g., "price", "name", "createdAt")
- `sortOrder` - Sort direction ("asc", "desc")

**Example:**
```
GET /products?page=1&limit=10&category=chai&minPrice=3&maxPrice=10&sortBy=price&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Ceylon Ginger Cinnamon chai tea",
      "slug": "ceylon-ginger-cinnamon-chai-tea",
      "description": "...",
      "price": 3.90,
      "image": "...",
      "variants": [
        {
          "id": "...",
          "label": "50g bag",
          "value": "50",
          "stock": 100,
          "price": 3.90
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalProducts": 45,
    "totalPages": 5
  }
}
```

---

### `GET /products/{id}`
Get a specific product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Ceylon Ginger Cinnamon chai tea",
    "description": "...",
    "variants": [
      {
        "id": "...",
        "label": "50g bag",
        "stock": 100,
        "price": 3.90
      }
    ]
  }
}
```

---

## 3. Product Management (Admin) (`/admin/products`)

### `POST /admin/products`
Create a new product. **Requires admin role.**

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Ceylon Ginger Cinnamon chai tea",
  "slug": "ceylon-ginger-cinnamon-chai-tea",
  "description": "A lovely warming Chai tea",
  "origin": "Iran",
  "organic": true,
  "vegan": true,
  "collection": "chai",
  "flavor": "Spicy",
  "caffeine": "Medium",
  "allergens": "Nuts-free",
  "ingredients": "Black Ceylon tea, Ginger...",
  "image": "/tea.png",
  "steeping": {
    "servingSize": "2 tsp per cup",
    "temperature": "100°C",
    "time": "3-5 minutes",
    "colorAfter3Min": "#BC575F"
  }
}
```

---

### `PUT /admin/products/{id}`
Update a product. **Requires admin role.**

---

### `DELETE /admin/products/{id}`
Delete a product. **Requires admin role.**

---

## 4. Variants (`/admin/variants`)

### `POST /admin/variants`
Create a product variant with stock management.

**Request Body:**
```json
{
  "productId": "{{productId}}",
  "label": "50g bag",
  "value": "50",
  "priceAdjustment": 0,
  "stock": 100,
  "image": "/packaging-50g.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "productId": "...",
    "label": "50g bag",
    "stock": 100,
    "price": 3.90
  }
}
```

---

### `PUT /admin/variants/{id}`
Update variant stock and price.

**Request Body:**
```json
{
  "label": "50g bag",
  "stock": 150,
  "priceAdjustment": 0
}
```

---

### `GET /products/{productId}/variants/{variantId}/stock`
Check if a variant is in stock.

**Response:**
```json
{
  "success": true,
  "inStock": true,
  "stock": 100,
  "variantId": "...",
  "price": 3.90
}
```

---

## 5. Cart (`/cart`)

### `GET /cart`
Get user's shopping cart.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "userId": "...",
    "items": [
      {
        "id": "...",
        "productId": "...",
        "productName": "Ceylon Ginger Cinnamon chai tea",
        "variantId": "...",
        "variantLabel": "50g bag",
        "quantity": 2,
        "price": 3.90,
        "totalPrice": 7.80
      }
    ],
    "subtotal": 7.80,
    "deliveryFee": 3.95,
    "total": 11.75
  }
}
```

---

### `POST /cart/add`
Add product to cart (validates stock).

**Request Body:**
```json
{
  "productId": "...",
  "variantId": "...",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cartItem": {
    "id": "...",
    "quantity": 2,
    "price": 3.90
  }
}
```

**Validation:**
- ✅ Checks if variant exists
- ✅ Validates stock availability
- ✅ Prevents adding more than available stock

---

### `PUT /cart/update`
Update quantity of cart item (validates stock).

**Request Body:**
```json
{
  "cartItemId": "...",
  "quantity": 5
}
```

---

### `DELETE /cart/{cartItemId}`
Remove item from cart.

---

### `DELETE /cart/clear`
Clear entire cart.

---

## 6. Orders (`/orders`)

### `POST /orders`
Create a new order from cart. **Validates stock before confirming.**

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "shippingAddress": "123 Main St, New York, NY",
  "paymentMethod": "credit_card",
  "notes": "Please deliver after 5 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "...",
    "userId": "...",
    "items": [...],
    "subtotal": 7.80,
    "deliveryFee": 3.95,
    "total": 11.75,
    "status": "pending",
    "createdAt": "2026-03-15T..."
  }
}
```

**Backend Actions:**
- ✅ Validates cart not empty
- ✅ Checks stock for each item
- ✅ Deducts stock from inventory
- ✅ Clears user's cart
- ✅ Creates order record

---

### `GET /orders`
Get user's order history with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "items": [...],
      "total": 11.75,
      "status": "pending",
      "createdAt": "2026-03-15T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalOrders": 5,
    "totalPages": 1
  }
}
```

---

### `GET /orders/{id}`
Get specific order details.

---

## 7. Order Management (Admin) (`/admin/orders`)

### `GET /admin/orders`
Get all orders (admin view). **Requires admin role.**

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status (pending, shipped, delivered, cancelled)
- `sortBy` - Sort field
- `sortOrder` - Sort direction

---

### `PUT /admin/orders/{id}/status`
Update order status. **Requires admin role.**

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

**Status Values:** `pending`, `shipped`, `delivered`, `cancelled`

---

## 8. Admin Dashboard (`/admin/analytics`)

### `GET /admin/analytics`
Get dashboard analytics. **Requires admin role.**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalOrders": 320,
    "totalRevenue": 5234.50,
    "totalProducts": 45,
    "lowStockItems": 12,
    "todayRevenue": 345.20,
    "pendingOrders": 8
  }
}
```

---

### `GET /admin/analytics/revenue`
Get revenue report by date range. **Requires admin role.**

**Query Parameters:**
- `startDate` - Date in YYYY-MM-DD format
- `endDate` - Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5234.50,
    "totalOrders": 320,
    "averageOrderValue": 16.36,
    "dailyRevenue": [
      { "date": "2026-03-01", "revenue": 234.50, "orders": 12 }
    ]
  }
}
```

---

### `GET /admin/analytics/stock`
Get stock report for all products. **Requires admin role.**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVariants": 120,
    "inStock": 115,
    "lowStock": 5,
    "outOfStock": 0,
    "products": [
      {
        "productId": "...",
        "productName": "Ceylon Ginger Cinnamon chai tea",
        "variants": [
          { "label": "50g bag", "stock": 100 },
          { "label": "100g bag", "stock": 50 }
        ]
      }
    ]
  }
}
```

---

## 9. User Management (Superadmin) (`/admin/users`)

### `GET /admin/users`
Get all users. **Requires superadmin role.**

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `role` - Filter by role (user, admin, superadmin)
- `isBlocked` - Filter by blocked status (true/false)

---

### `PUT /admin/users/{userId}/block`
Block a user. **Requires superadmin role.**

**Request Body:**
```json
{
  "reason": "Suspicious activity detected"
}
```

---

### `PUT /admin/users/{userId}/unblock`
Unblock a user. **Requires superadmin role.**

---

### `POST /admin/users/create-admin`
Create new admin user. **Requires superadmin role.**

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

---

### `PUT /admin/users/{adminId}/role`
Update user role. **Requires superadmin role.**

**Request Body:**
```json
{
  "role": "user"
}
```

---

## Authentication & Authorization

### Token Storage
After login, the JWT token is returned. Store it in Postman environment:

1. In login response, copy the `token` value
2. Go to "Environments" → Select your environment
3. Find the `token` variable and paste the token

### Role-Based Access Control

| Endpoint | User | Admin | Superadmin |
|----------|------|-------|-----------|
| View Products | ✅ | ✅ | ✅ |
| Create Product | ❌ | ✅ | ✅ |
| Update Product | ❌ | ✅ | ✅ |
| Delete Product | ❌ | ✅ | ✅ |
| Manage Cart | ✅ | ❌ | ❌ |
| Create Order | ✅ | ❌ | ❌ |
| View Own Orders | ✅ | ✅ | ✅ |
| View All Orders | ❌ | ✅ | ✅ |
| Update Order Status | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Manage Admins | ❌ | ❌ | ✅ |
| Block/Unblock Users | ❌ | ❌ | ✅ |

---

## Error Handling

### Common Error Responses

**400 - Bad Request**
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": ["field validation errors"]
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "message": "Token expired or invalid",
  "code": "UNAUTHORIZED"
}
```

**403 - Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "SERVER_ERROR"
}
```

---

## Workflow Examples

### Example 1: Customer Purchase Journey

1. **Signup** → `POST /auth/signup`
2. **Get Products** → `GET /products?category=chai`
3. **View Product Details** → `GET /products/{id}`
4. **Add to Cart** → `POST /cart/add`
5. **View Cart** → `GET /cart`
6. **Create Order** → `POST /orders`
7. **View Order History** → `GET /orders`

---

### Example 2: Admin Product Management

1. **Login as Admin** → `POST /auth/login`
2. **Create Product** → `POST /admin/products`
3. **Create Variants** → `POST /admin/variants`
4. **View All Orders** → `GET /admin/orders`
5. **Update Order Status** → `PUT /admin/orders/{id}/status`
6. **View Analytics** → `GET /admin/analytics`

---

### Example 3: Superadmin User Management

1. **Login as Superadmin** → `POST /auth/login`
2. **Get All Users** → `GET /admin/users`
3. **Block User** → `PUT /admin/users/{userId}/block`
4. **Create Admin** → `POST /admin/users/create-admin`
5. **View Analytics** → `GET /admin/analytics`

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Prices are in EUR (€)
- Stock validation happens server-side for cart and orders
- Cart is stored in database per user (not client-side)
- Orders automatically reduce stock inventory
- Blocked users cannot login or access protected routes
