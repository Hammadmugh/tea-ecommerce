# 🚀 Quick Testing Checklist - Ecommerce Tea

## 5-Minute Initial Health Check

```bash
# Terminal 1: Start Backend
cd backend && npm run dev
# Wait for: "✅ MongoDB connected"

# Terminal 2: Start Frontend  
cd frontend && npm run dev
# Wait for: "VITE v... ready in X ms"

# Terminal 3: Run API Tests
cd backend && node test-api.js
# All tests should show ✓ pass
```

---

## 10-Minute Manual Test Flow

### Step 1: Signup & Login (2 min)
```
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill: Name, Email, Password
4. Click "Sign Up" 
   ✓ Should redirect to home with login state
5. Logout from navbar menu
6. Click "Log In"
7. Enter credentials
   ✓ Should be logged in
```

### Step 2: Browse Products (2 min)
```
1. Click "Collections" 
   ✓ Products should load (NOT from local data)
   ✓ Should show 12 items per page
2. Verify each product card shows:
   - [ ] Image
   - [ ] Name
   - [ ] Price
   - [ ] "View Details" button
3. Click a product
   ✓ ProductDetailPage loads
```

### Step 3: Add to Cart (2 min)
```
1. On ProductDetailPage:
   - [ ] Select a variant from dropdown
   - [ ] Set quantity to 2
   - [ ] Click "Add to Cart"
   ✓ Should show cart notification
2. Add 1-2 more products to cart
3. Click cart icon
   ✓ All items listed correctly
   ✓ Subtotal: correct (qty × price)
   ✓ Delivery Fee: €3.95
   ✓ Total: correct
```

### Step 4: Checkout Flow (4 min)
```
1. Click "Proceed to Checkout"

   STEP 1: My Bag
   - [ ] All items show with prices
   - [ ] Total matches cart
   - [ ] Click "Continue to Delivery"

   STEP 2: Delivery
   - [ ] Fill all address fields
   - [ ] Click "Continue to Payment"

   STEP 3: Review & Payment
   - [ ] Order summary shows
   - [ ] Delivery address correct
   - [ ] Select payment method
   - [ ] Click "Place Order"
   
   ✓ Loading button shows
   ✓ Success message with Order ID
   ✓ Redirects to home
```

### Step 5: Verify Backend (2 min)
```
1. Open MongoDB client
2. Check database:
   - [ ] New order created with Order ID
   - [ ] Items in order match cart
   - [ ] Stock decremented in variants
   - [ ] Cart cleared for user
   - [ ] statusHistory has initial entry
```

---

## API Endpoints Quick Test (Postman)

| Method | Endpoint | Expected Status | Notes |
|--------|----------|-----------------|-------|
| POST | /auth/signup | 201 | Creates user + returns token |
| POST | /auth/login | 200 | Returns token |
| GET | /auth/profile | 200 | Requires token |
| GET | /products | 200 | Page defaults to 1, limit to 12 |
| GET | /products?page=0 | 200 | Should return page 1 |
| GET | /products/{id} | 200 | Returns single product |
| POST | /cart/add | 200 | Adds item to cart, requires token |
| GET | /cart | 200 | Requires token |
| PUT | /cart/item/{id} | 200 | Update quantity, requires token |
| DELETE | /cart/item/{id} | 200 | Remove item, requires token |
| DELETE | /cart/clear | 200 | Clear entire cart, requires token |
| POST | /orders/place | 201 | Creates order, clears cart, requires token |
| GET | /orders/my-orders | 200 | Get user's orders, requires token |
| GET | /orders/{orderId} | 200 | Get order details, requires token |

---

## Common Issues & Quick Fixes

| Issue | Fix | Verify |
|-------|-----|--------|
| Products don't load | Check portman endpoint using 5000 not 3001 | `productApi.js` line 3 |
| Checkout button does nothing | Check createOrder API is imported | `CheckoutPage.jsx` line 5 |
| Order not saved | Check MongoDB is running | `mongod` in terminal |
| Orders appear but stock unchanged | Verify transaction code | `orderController.js` has `session` usage |
| "No token" error | Check Bearer format in header | `Authorization: Bearer {token}` |
| CORS error | Add frontend URL to ALLOWED_ORIGINS | `.env`: `ALLOWED_ORIGINS=http://localhost:5173` |
| Checkout shows 2 items but total wrong | Check price calculation | `quantity × priceAtAddTime` |
| Can still order with empty cart | Update cart validation | `orderController.js` line 40 |

---

## Stress Test Scenarios

### Test 1: High Stock Deduction
```
1. Product variant has 5 units
2. User A orders 3 units
   ✓ Stock should be 2
3. User B orders 2 units
   ✓ Stock should be 0
4. User C tries to order 1 unit
   ✓ Should fail: "Insufficient stock"
5. Verify stock never goes negative
```

### Test 2: Concurrent Orders
```
1. Open app in 2 browsers (A & B)
2. Both add same product to cart
3. Both proceed to checkout simultaneously
4. Submit orders within 1 second of each other
   ✓ Both should succeed OR one should fail (no oversell)
   ✓ Stock should be correct
   ✓ Both orders in database
```

### Test 3: Pagination Edge Cases
```
1. GET /products?page=1&limit=12
   ✓ Returns 12 items
2. GET /products?page=100&limit=12
   ✓ Returns empty array OR last page
3. GET /products?limit=10000
   ✓ Returns max 100 items
4. GET /products?page=-5
   ✓ Returns page 1
```

### Test 4: Max Quantity Order
```
1. Try to add 1001 items in checkout
   ✓ Validation error: "Maximum quantity is 1000"
2. Try to add 1000 items
   ✓ Should succeed
3. Try to add item with quantity = 0
   ✓ Validation error: "Quantity must be at least 1"
```

---

## Database Inspection

### Check Order Was Created with Transactions
```javascript
// In MongoDB shell
use ecommerce-tea

// View latest order
db.orders.findOne({}, { sort: { createdAt: -1 } })

// Verify structure:
// ✓ Has orderId: "ORD-20260316-XXXXX"
// ✓ Has statusHistory array with entries
// ✓ Has shippingAddress with all fields
// ✓ totalAmount = subtotal + deliveryFee + tax

// Check stock was decremented
db.variants.findOne({ _id: ObjectId("...") })
// ✓ stock should be less than before
```

### Check Cart Was Cleared
```javascript
db.carts.findOne({ user: ObjectId("...") })
// After order, items should be empty []
```

### Verify No Duplicate Orders
```javascript
db.orders.count({ orderId: "ORD-20260316-12345" })
// Should be 1 (not 0, not 2)
```

---

## Browser Dev Tools Checks

### Console (F12)
```
✓ No red errors
✓ No "CORS error" messages
✓ No "Cannot read property" errors
✓ No "401 Unauthorized" errors
```

### Network Tab (F12 → Network)
```
✓ POST /api/auth/login → 200
✓ GET /api/products → 200
✓ POST /api/cart/add → 200
✓ POST /api/orders/place → 201
✓ No 500 errors
✓ No 403 errors
```

### LocalStorage (F12 → Application)
```
✓ After login: token present
✓ After logout: token removed
✓ Cart items in localStorage (if using CartContext)
```

---

## Pre-Deployment Checklist

- [ ] All 6 critical bugs fixed
- [ ] All 11+ high severity bugs fixed
- [ ] `npm run dev` works for both frontend and backend
- [ ] No console errors in browser DevTools
- [ ] Signup works and creates user
- [ ] Login works and saves token
- [ ] Products load from API (not local data)
- [ ] Can add products to cart
- [ ] Cart displays correct totals
- [ ] Checkout creates order successfully
- [ ] Order appears in MongoDB
- [ ] Stock decremented in database
- [ ] Cart cleared after order
- [ ] Order status history recorded
- [ ] Can get order details by ID
- [ ] Pagination validation works
- [ ] Error messages display properly
- [ ] Admin can update order status
- [ ] Status history updates when order changes
- [ ] Logout clears token and redirects
- [ ] API responds within 1 second for each request
- [ ] No CORS errors
- [ ] Environment variables configured
- [ ] MongoDB connection stable

---

## Test Data for Quick Testing

### User Credentials
```
Email: test-user@example.com
Password: TestPassword123

OR create new account on each test
```

### Test Products (Seed Data)
```
1. Ceylon Ginger Cinnamon Chai - €3.90
   Variants: 50g, 100g, 170g, 250g, 1kg, Sampler
   
2. Premium Oolong - €12.50
   Variants: 50g, 100g, 250g
   
3. Green Matcha Blend - €8.99
   Variants: 100g, 250g
```

### Test Addresses
```
Netherlands:
Address: Prinsengracht 263, Amsterdam
City: Amsterdam
PostalCode: 1016HV
Country: Netherlands
Phone: +31612345678

USA:
Address: 742 Evergreen Terrace, Springfield
City: Springfield
PostalCode: 99999
Country: USA
Phone: +15551234567
```

---

## Performance Baseline

Record these the first time:

| Test | First Run (ms) | Target (ms) | Pass/Fail |
|------|---|---|---|
| Load Products Page | | < 2000 | |
| Add Item to Cart | | < 500 | |
| Submit Order | | < 2000 | |
| Get Order Details | | < 500 | |
| Login | | < 1000 | |
| Search Products | | < 500 | |

---

## Regression Testing Checklist

After any code changes, verify:
- [ ] Products still load from API
- [ ] Checkout still creates orders
- [ ] Cart calculations still correct
- [ ] Orders still appear in database
- [ ] Stock still decrements
- [ ] Status history still updates
- [ ] No new console errors
- [ ] No new 500 errors in API

---

## Passing Definition

✅ **Project is ready when:**
1. All automated tests pass (`node test-api.js`)
2. Complete user flow succeeds (signup → browse → cart → checkout → order)
3. Order successfully created in database with all correct data
4. Stock decremented correctly
5. Status history recorded
6. No console errors
7. No API errors (all 2xx responses)
8. Performance acceptable (< 2s per major action)

