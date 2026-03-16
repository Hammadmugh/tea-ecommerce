# Complete Testing Guide - Ecommerce Tea Project

## 📋 Table of Contents
1. [Setup & Prerequisites](#setup--prerequisites)
2. [Backend API Testing](#backend-api-testing)
3. [Frontend Testing](#frontend-testing)
4. [Complete User Flows](#complete-user-flows)
5. [Admin Testing](#admin-testing)
6. [Error Scenarios](#error-scenarios)
7. [Performance Checks](#performance-checks)

---

## Setup & Prerequisites

### 1. Environment Setup
```bash
# Backend
cd backend
npm install
# Create .env file with:
PORT=5000
CONNECTION_STRING=mongodb://localhost:27017/ecommerce-tea
JWT_SECRET=your_jwt_secret_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend
cd ../frontend
npm install
# Create .env.local file with:
VITE_API_URL=http://localhost:5000/api
```

### 2. Start Services
```powershell
# Terminal 1: Backend
cd backend
npm run dev
# Expected: Server running on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Expected: Frontend running on http://localhost:5173

# Terminal 3: MongoDB
mongod
# Ensure MongoDB is running on localhost:27017
```

### 3. Verify Connectivity
```bash
# Check backend health
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing

# Expected Response: 200 OK
```

---

## Backend API Testing

### Using Postman Collection
- Import: `backend/Ecommerce-Tea-API.postman_collection.json`
- Import Environment: `backend/Ecommerce-Tea-Dev.postman_environment.json`

### Test Sequence

#### 1. **Authentication Tests**

**A. Signup (Create User)**
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}

Expected: 201 Created
Response includes: token, user object with _id, role: "customer"
```

**B. Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}

Expected: 200 OK
Response: token, user object
Save token for subsequent requests in Authorization header
```

**C. Get Profile**
```
GET /api/auth/profile
Authorization: Bearer {token}

Expected: 200 OK
Response: User profile data
```

**D. Logout**
```
POST /api/auth/logout
Authorization: Bearer {token}

Expected: 200 OK
```

#### 2. **Product Tests**

**A. Get All Products**
```
GET /api/products?page=1&limit=12

Expected: 200 OK
Response includes:
{
  "success": true,
  "data": [ product objects ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 12,
    "totalProducts": X,
    "totalPages": Y,
    "hasNextPage": true/false
  }
}
```

**Test Filters:**
```
GET /api/products?category=chai&minPrice=2&maxPrice=5
GET /api/products?sort=-basePrice&limit=20
GET /api/products?searchTerm=ginger
```

**B. Get Product by ID**
```
GET /api/products/{productId}

Expected: 200 OK
Response: Single product with variants populated
```

**C. Get Product by Slug**
```
GET /api/products/by-slug/{slug}

Expected: 200 OK
Response: Product by slug
```

**D. Create Product (Admin)**
```
POST /api/admin/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Test Tea",
  "slug": "test-tea-blend",
  "description": "A test tea blend",
  "category": "premium",
  "basePrice": 15.99,
  "image": "/test-image.png",
  "origin": "India",
  "organic": true,
  "vegan": true
}

Expected: 201 Created
Response: New product object with _id
```

#### 3. **Variant Tests**

**A. Create Variant**
```
POST /api/admin/products/{productId}/variants
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "label": "50g bag",
  "value": "50",
  "stock": 100,
  "priceAdjustment": 0,
  "sku": "SKU-50G-001"
}

Expected: 201 Created
```

**B. Get Variants for Product**
```
GET /api/products/{productId}/variants

Expected: 200 OK
Response: Array of variants for the product
```

#### 4. **Cart Tests**

**A. Add Item to Cart**
```
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "{productId}",
  "variantId": "{variantId}",
  "quantity": 2
}

Expected: 200 OK
Response: Updated cart
```

**B. Get Cart**
```
GET /api/cart
Authorization: Bearer {token}

Expected: 200 OK
Response: {
  "success": true,
  "data": {
    "user": "{userId}",
    "items": [
      {
        "product": {...},
        "variant": {...},
        "quantity": 2,
        "priceAtAddTime": 15.99
      }
    ],
    "totalItems": 2,
    "totalPrice": 31.98
  }
}
```

**C. Update Cart Item**
```
PUT /api/cart/item/{cartItemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}

Expected: 200 OK
Response: Updated cart
```

**D. Remove Item from Cart**
```
DELETE /api/cart/item/{cartItemId}
Authorization: Bearer {token}

Expected: 200 OK
Response: Updated cart
```

**E. Clear Cart**
```
DELETE /api/cart/clear
Authorization: Bearer {token}

Expected: 200 OK
Response: Empty cart
```

#### 5. **Order Tests**

**A. Place Order**
```
POST /api/orders/place
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street",
    "city": "Amsterdam",
    "postalCode": "1012AB",
    "country": "Netherlands"
  },
  "paymentMethod": "visa"
}

Expected: 201 Created
Response: {
  "success": true,
  "message": "Order placed successfully",
  "orderId": "ORD-20260316-XXXX",
  "data": { order object }
}

✓ Cart should be cleared
✓ Stock should be decremented
✓ StatusHistory should have initial entry
```

**B. Get My Orders**
```
GET /api/orders/my-orders?page=1&limit=10
Authorization: Bearer {token}

Expected: 200 OK
Response: List of user's orders with pagination
```

**C. Get Order by ID**
```
GET /api/orders/{orderId}
Authorization: Bearer {token}

Expected: 200 OK
Response: Single order details
```

**D. Update Order Status (Admin)**
```
PUT /api/orders/{orderId}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "confirmed",
  "note": "Order confirmed and pending shipment"
}

Expected: 200 OK
Response: Updated order with statusHistory entry
✓ Verify statusHistory array has new entry
✓ Verify timestamp is current
```

**E. Update Payment Status (Admin)**
```
PUT /api/orders/{orderId}/payment-status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "completed"
}

Expected: 200 OK
Response: Updated order
```

#### 6. **Admin Tests**

**A. Get Analytics**
```
GET /api/admin/analytics
Authorization: Bearer {admin_token}

Expected: 200 OK
Response: Analytics dashboard data
```

**B. Get All Users**
```
GET /api/admin/users?page=1&limit=20
Authorization: Bearer {admin_token}

Expected: 200 OK
Response: List of users with pagination
```

**C. Get All Orders**
```
GET /api/admin/orders?page=1&limit=20
Authorization: Bearer {admin_token}

Expected: 200 OK
Response: All orders in system
```

---

## Frontend Testing

### 1. **Landing Page Tests**
- [ ] Page loads without errors
- [ ] Navigation bar displays correctly
- [ ] Footer appears at bottom
- [ ] Hero section visible
- [ ] Featured products load and display

### 2. **Collections Page Tests**
```
Test Path: /collections
- [ ] Product grid displays (12 products per page default)
- [ ] Pagination works (next/prev buttons)
- [ ] Filters work:
  - [ ] Filter by category
  - [ ] Filter by price range
  - [ ] Search functionality
  - [ ] Sort by price/newest
- [ ] Products load from API (not local data)
- [ ] Product images display
- [ ] Click product → ProductDetailPage
```

### 3. **Product Detail Page Tests**
```
Test Path: /product/{productId}
- [ ] Product details load from API
- [ ] Product image displays
- [ ] Product name, price, description visible
- [ ] Variants dropdown appears
- [ ] Can select variant
- [ ] Add to cart button works
- [ ] Quantity selector works (1-1000)
- [ ] Related products show
- [ ] Back button works
```

### 4. **Cart Tests**
```
Test Path: /cart
- [ ] CartBag component displays items
- [ ] Item count shows correct total
- [ ] Price calculation shows correctly:
  - [ ] Subtotal
  - [ ] Delivery fee (€3.95)
  - [ ] Total
- [ ] Remove item button works
- [ ] Update quantity works
- [ ] Empty cart message when no items
- [ ] Proceed to checkout button
```

### 5. **Checkout Page Tests**
```
Test Path: /checkout

Step 1: My Bag
- [ ] Cart items display
- [ ] Correct quantities and prices
- [ ] Back to shopping button
- [ ] Correct total calculation
- [ ] Continue button advances to step 2

Step 2: Delivery
- [ ] All form fields present:
  - [ ] Full Name
  - [ ] Email
  - [ ] Phone
  - [ ] Address
  - [ ] City
  - [ ] Postal Code
  - [ ] Country
- [ ] Form validation works (required fields)
- [ ] Back button returns to step 1
- [ ] Continue to Payment button advances to step 3

Step 3: Review & Payment
- [ ] Order summary displays correctly
- [ ] Delivery address shows entered data
- [ ] Payment methods available:
  - [ ] Visa
  - [ ] Mastercard
  - [ ] Maestro
  - [ ] iDEAL
- [ ] Can select different payment method
- [ ] "Place Order" button submits
- [ ] Loading state shows while submitting
- [ ] Success message with Order ID
- [ ] Cart clears after successful order
- [ ] Redirects to home page
```

### 6. **Authentication Tests**
```
Signup Page: /signup
- [ ] Form validates email format
- [ ] Validates password length (min 6)
- [ ] Validates password match
- [ ] Signup successful → token saved to localStorage
- [ ] Redirects to home after signup
- [ ] Can't signup with existing email

Login Page: /login
- [ ] Email required
- [ ] Password required
- [ ] Invalid credentials show error
- [ ] Valid login → token saved
- [ ] Redirects to home after login

Logout:
- [ ] Logout button in navbar
- [ ] Clears token from localStorage
- [ ] Redirects to home
```

### 7. **Admin Panel Tests**
```
Admin Routes: /admin/*
- [ ] Only accessible with admin token
- [ ] Analytics dashboard displays
- [ ] User management page accessible
- [ ] Order management page accessible
- [ ] Product management page accessible
```

---

## Complete User Flows

### Flow 1: New User Purchase
```
1. Open app on home page
   ✓ Expected: Landing page loads

2. Browse products
   ✓ Go to /collections
   ✓ Expected: Products load from API
   ✓ Filter/search works

3. View product details
   ✓ Click a product
   ✓ Expected: ProductDetailPage loads
   ✓ All details display

4. Add to cart
   ✓ Select variant
   ✓ Set quantity to 2
   ✓ Click "Add to Cart"
   ✓ Expected: CartContext updates
   ✓ Expected: Item added notification

5. Add another product
   ✓ Browse more products (add at least 2 items total)

6. View cart
   ✓ Click cart icon
   ✓ Expected: All items display
   ✓ Expected: Correct total calculation

7. Signup
   ✓ Click "Checkout"
   ✓ If not logged in → Signup form
   ✓ Fill: Name, Email, Password
   ✓ Click "Sign Up"
   ✓ Expected: Account created

8. Checkout
   ✓ Proceed through checkout steps
   ✓ Fill delivery address
   ✓ Select payment method
   ✓ Review order
   ✓ Click "Place Order"
   ✓ Expected: 
      - Order created in backend
      - Stock decremented
      - Cart cleared
      - Success message with Order ID
      - Redirected to home

9. Backend Verification
   ✓ Check MongoDB:
      - Order created with correct data
      - statusHistory has initial entry
      - Stock reduced in variants
      - Cart cleared for user
```

### Flow 2: Returning User Purchase
```
1. Open app
2. Click login
3. Enter credentials
4. Browse and add to cart
5. Checkout with different delivery address
6. Verify new order created
```

### Flow 3: Admin Order Management
```
1. Login as admin
2. Go to admin panel
3. View all orders
4. Click an order
5. Change status: pending → confirmed
   ✓ Verify statusHistory updated
   ✓ Verify timestamp added
6. Change status: confirmed → shipped
   ✓ Verify previous status in history
7. Update payment status to completed
8. Verify order shows all status transitions
```

---

## Error Scenarios

### Backend Errors

#### 1. **Stock Depletion**
```
Setup:
- Product has only 2 units in stock
- Variant has quantity: 2

Test:
1. User A adds 2 items to cart
2. User A places order
   ✓ Expected: Success, stock → 0
3. User B tries to add same variant
   ✓ Expected: Add succeeds but shows warning
4. User B tries to order 1 item
   ✓ Expected: Order succeeds, stock → -1 (BUG if this happens!)
   ✗ Should fail with "Insufficient stock"

Fix Verification:
- Ensure quantity validation catches this
- Max order quantity: 1000 per item
```

#### 2. **Invalid Token**
```
Test:
1. Make API request with invalid header
   Authorization: Bearer invalid_token
   ✓ Expected: 400 "Invalid token format"

2. Make request with expired token
   ✓ Expected: 401 "Token is not valid"

3. Make request with no Authorization header
   ✓ Expected: 401 "No token, authorization denied"
```

#### 3. **Empty Cart Checkout**
```
Test:
1. User clears cart
2. Navigate to checkout
3. Try to place order with empty cart
   ✓ Expected: 400 "Cart is empty"
```

#### 4. **Price Validation**
```
Test (Admin only):
1. Try to create product with negative price
   ✓ Expected: 400 "Price must be a positive number"

2. Try to create product with price = 0
   ✓ Should succeed (free samples) or fail (config dependent)
```

#### 5. **Pagination Edge Cases**
```
Test:
1. Request page=0
   ✓ Expected: Returns page 1

2. Request page=-5
   ✓ Expected: Returns page 1

3. Request limit=10000
   ✓ Expected: Caps at 100 items per page

4. Request page=999 (beyond total pages)
   ✓ Expected: Returns empty array or last page
```

#### 6. **Duplicate Variant**
```
Test (Admin):
1. Create product
2. Create variant: label="50g", value="50"
3. Try to create same variant again
   ✓ Expected: 409 "This variant already exists"
```

### Frontend Errors

#### 1. **Missing Product**
```
Test:
1. Try to access invalid product ID
   /product/invalid_id_123
   ✓ Expected: Error message or 404 page

2. Try to access product that doesn't exist
   /product/507f1f77bcf86cd799439011
   ✓ Expected: "Product not found"
```

#### 2. **Checkout Validation**
```
Test:
1. Try to place order with missing address
   ✓ Expected: Form validation error

2. Try to place order with invalid email
   ✓ Expected: Email validation error

3. Try quantity > 1000
   ✓ Expected: Validation fails
```

#### 3. **Network Error Handling**
```
Test:
1. Open checkout
2. Stop backend server
3. Click "Place Order"
   ✓ Expected: Error message displayed
   ✓ Expected: Loading state clears
   ✓ Expected: User can retry

Restart backend and retry
   ✓ Expected: Order should succeed
```

---

## Performance Checks

### 1. **Load Testing**
```
Backend:
- [ ] Get /api/products with 1000 products
  Expected: < 500ms
  
- [ ] Get /api/orders for user with 100 orders
  Expected: < 300ms
  
- [ ] Place order (full transaction)
  Expected: < 1s
```

### 2. **Frontend Performance**
```
- [ ] Collections page load time
  Expected: < 2s initial load
  
- [ ] Search/filter response
  Expected: < 300ms
  
- [ ] Checkout form submission
  Expected: Loading state visible, completes within 2s
```

### 3. **Database Optimization**
```
- [ ] Check indexes are created:
  ✓ User email unique
  ✓ Product slug unique
  ✓ Order orderId unique
  ✓ Order user indexed
  ✓ Order createdAt indexed

- [ ] Run MongoDB explain() on slow queries
  ✓ Verify IXSCAN not COLLSCAN
```

---

## Checklist: Pre-Deployment

- [ ] All 30 bugs fixed
- [ ] Authentication working (signup, login, logout)
- [ ] Products loaded from API (not local data)
- [ ] Cart properly synced with backend
- [ ] Orders create successfully with transactions
- [ ] Stock decrements correctly
- [ ] Status history tracks all order changes
- [ ] Admin can manage orders
- [ ] "Place Order" button calls API correctly
- [ ] Error handling displays proper messages
- [ ] Form validation works
- [ ] No console errors
- [ ] Network requests use correct ports (5000)
- [ ] Environment variables configured
- [ ] MongoDB connection stable
- [ ] CORS allowing requests
- [ ] JWT tokens working
- [ ] At least 3 complete order flows tested

---

## Quick Test Commands

```bash
# Backend Health Check
curl http://localhost:5000/api/health

# Get Products
curl http://localhost:5000/api/products?page=1&limit=5

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123","confirmPassword":"Test123"}'

# Login & Get Token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Use token in subsequent requests
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Expected Database State After Complete Test

```
Collections:
✓ users (at least 3-5 test users)
✓ products (pre-seeded with variants)
✓ variants (with decremented stock)
✓ orders (3-5 completed orders)
✓ carts (2-3 with items, rest empty)

Sample Order in DB:
{
  "orderId": "ORD-20260316-123456",
  "user": ObjectId,
  "items": [
    {
      "product": ObjectId,
      "productName": "Ceylon Tea",
      "quantity": 2,
      "pricePerUnit": 15.99,
      "totalPrice": 31.98
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "Amsterdam",
    "postalCode": "1012AB",
    "country": "Netherlands"
  },
  "subtotal": 31.98,
  "deliveryFee": 3.95,
  "totalAmount": 35.93,
  "paymentMethod": "visa",
  "paymentStatus": "pending",
  "orderStatus": "pending",
  "statusHistory": [
    {
      "status": "pending",
      "timestamp": "2026-03-16T10:30:00Z",
      "note": "Order placed successfully"
    },
    {
      "status": "confirmed",
      "timestamp": "2026-03-16T10:35:00Z",
      "note": "Order status updated to confirmed"
    }
  ],
  "createdAt": "2026-03-16T10:30:00Z",
  "updatedAt": "2026-03-16T10:35:00Z"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot GET /api/products` | Backend not running or port wrong. Check `npm run dev` and port 5000 |
| `CORS error` | Check `ALLOWED_ORIGINS` in .env includes frontend URL |
| `JWT verification failed` | JWT_SECRET mismatch or token expired. Check .env files |
| `Cannot read property '_id'` | Order not saved properly. Check transaction handling |
| `Stock not decremented` | Transaction failed silently. Check MongoDB connection |
| `Cart not clearing` | Verify cart clear API endpoint. Check if transaction rolled back |
| `Order appears but not saved` | Check MongoDB connection and collection |
| `Checkout button not working` | Check browser console for errors. Verify API endpoint |

