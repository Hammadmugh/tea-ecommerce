# Admin Dashboard Setup Guide

## 📋 Overview

This guide provides comprehensive instructions for setting up and using the admin dashboard in the e-commerce tea platform. The admin dashboard is built with React, integrates with a backend API, and provides analytics and user management features.

---

## 🚀 Quick Start

### Prerequisites
- Backend API running on `http://localhost:5000`
- Node.js 16+
- Frontend dependencies installed

### Setup Steps

#### 1. Create Environment File
```bash
cd frontend
cp .env.example .env
```

Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Development Server
```bash
npm run dev
```

#### 4. Access Admin Panel
- Navigate to `http://localhost:5173/login`
- Use admin credentials
- Click "Sign In"

---

## 🔑 Authentication

### Login Flow

1. **User enters credentials** at `/login`
2. **POST request** to `/api/auth/login` with email and password
3. **Backend validates** and returns JWT token + user info
4. **Token stored** in `localStorage`
5. **User redirected** to dashboard if admin role

### Token Management
- Stored in `localStorage` under key `token`
- Attached to all API requests via `Authorization: Bearer {token}` header
- Automatically managed by axios interceptors

### User Roles
- `user`: Regular customer (no admin access)
- `admin`: Can access admin panel and manage users
- `superadmin`: Full access to all admin features

---

## 📊 Dashboard Features

### 1. Analytics Dashboard (`/admin`)

**Key Metrics Displayed:**
```
┌─────────────────────────────────────────────┐
│ Total Users │ Total Products │ Total Orders │
│     245     │       156      │      1,234   │
└─────────────────────────────────────────────┘
│      Total Revenue: €32,567.89              │
├─────────────────────────────────────────────┤
│ Orders by Status        │ Inventory Status  │
│ - Pending: 45           │ Total Stock: 5,234│
│ - Shipped: 134          │ Low Stock: 8 items│
│ - Delivered: 1,055      │                   │
└─────────────────────────────────────────────┘
│ Top Selling Products (Table)                │
│ Top Low Stock Items (Alert)                 │
└─────────────────────────────────────────────┘
```

**Data Sources:**
- Analytics API: `GET /api/admin/analytics`
- Real-time metrics from MongoDB aggregation pipeline
- Updated in real-time when users interact

### 2. User Management (`/admin/users`)

**Features:**
- View all users with pagination
- Filter by role (User, Admin, Super Admin)
- Filter by status (Active, Blocked)
- Block/Unblock users
- Change user roles
- Delete users
- Create new admin accounts

**API Endpoints:**
```
GET    /api/admin/users                    - List users
POST   /api/admin/users/create-admin       - Create admin
PUT    /api/admin/users/:userId/block      - Block user
PUT    /api/admin/users/:userId/unblock    - Unblock user
PUT    /api/admin/users/:userId/role       - Change role
DELETE /api/admin/users/:userId            - Delete user
```

---

## 🔌 API Integration

### Admin API Service (`src/services/adminApi.js`)

```javascript
// Analytics
const response = await getAnalytics();
// Returns: { success, data: { users, products, orders, revenue, inventory } }

// Users
const users = await getAllUsers(page, limit, role, isBlocked);
// Returns: { success, data: [...], pagination: {...} }

// Block/Unblock
await blockUser(userId);
await unblockUser(userId);
// Returns: { success, message, data: {...} }

// Role Management
await changeUserRole(userId, newRole);  // 'user' or 'admin'

// Create Admin
await createAdmin(name, email, password);

// Delete User
await deleteUser(userId);
```

### Auth API Service (`src/services/api.js`)

```javascript
// Login
const response = await login(email, password);
// Returns: { success, token, user: {...} }

// Signup
const response = await signup(userData);

// Get Profile
const response = await getProfile();

// Logout
const response = await logout();
```

---

## 🗂️ File Structure

```
frontend/
├── src/
│   ├── services/
│   │   ├── adminApi.js          # Admin API calls
│   │   └── api.js               # Auth API calls
│   ├── components/
│   │   ├── AdminProtectedRoute.jsx  # Route protection
│   │   ├── Navbar.jsx           # Updated with login/admin links
│   │   └── ...
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx       # Sidebar layout
│   │   │   ├── AdminDashboard.jsx    # Analytics
│   │   │   └── UserManagement.jsx    # User management
│   │   ├── LoginPage.jsx        # Login form
│   │   └── ...
│   └── App.jsx                  # Updated with admin routes
├── .env.example                 # Environment template
├── ADMIN_DASHBOARD.md          # Admin documentation
└── ...
```

---

## 🛡️ Security Features

### Protected Routes
```javascript
// AdminProtectedRoute component checks:
- Valid JWT token exists
- User role is 'admin' or 'superadmin'
- Redirects to /login if unauthorized
```

### Token Management
- Tokens auto-attached to all requests
- Axios interceptor handles authorization
- Requests fail with 401 if token invalid

### Input Validation
- Form validation before submission
- Backend validation on all endpoints
- XSS prevention through proper data handling

---

## 🎨 UI Components

### AdminLayout (`src/pages/admin/AdminLayout.jsx`)
- Responsive sidebar navigation
- Collapsible menu on mobile
- Top bar with current page title
- Logout button
- Navigate between admin pages

### AdminDashboard (`src/pages/admin/AdminDashboard.jsx`)
- Loading states with spinners
- Error handling with alerts
- Card-based metrics display
- Status progress bars
- Data tables with pagination
- Chart-like visualizations

### UserManagement (`src/pages/admin/UserManagement.jsx`)
- User list table
- Filter section
- Action buttons (block, delete)
- Role selector dropdown
- Create admin modal
- Pagination controls
- Success/error notifications

---

## 🔄 Data Flow

### Dashboard Load
```
1. Component mounts
   ↓
2. useEffect triggers fetchAnalytics()
   ↓
3. getAnalytics() API call
   ↓
4. Backend aggregates data from MongoDB
   ↓
5. Response received with analytics data
   ↓
6. State updated with setAnalytics()
   ↓
7. Component re-renders with data
```

### User Action (e.g., Block User)
```
1. Admin clicks "Block" button
   ↓
2. handleBlockUser(userId) called
   ↓
3. blockUser(userId) API call with token
   ↓
4. Backend updates user.isBlocked = true
   ↓
5. Success response received
   ↓
6. fetchUsers() called to refresh list
   ↓
7. User list re-renders with updated status
   ↓
8. Success notification shown (3s)
```

---

## 🐛 Troubleshooting

### Issue: "Cannot read property 'role' of undefined"
**Cause:** User not logged in
**Solution:** Check localStorage for 'user' object before accessing properties

### Issue: Dashboard returns 401 Unauthorized
**Cause:** Token expired or invalid
**Solution:** 
```
1. Logout: localStorage.removeItem('token')
2. Login again
3. Check token in browser DevTools
```

### Issue: CORS error when calling API
**Cause:** Backend not allowing requests from frontend
**Solution:**
```
backend/src/index.js - Verify CORS is enabled:
app.use(cors());
```

### Issue: API returns 500 Server Error
**Cause:** Backend error
**Solution:**
1. Check backend console for error message
2. Verify MongoDB connection
3. Check request body/params

### Issue: "Cannot find module" error
**Cause:** Missing import or wrong path
**Solution:**
```
1. Check file path is correct
2. Verify file exists
3. Check import syntax matches export
```

---

## 📝 API Documentation

### GET /api/admin/analytics
**Auth:** Required (Admin/SuperAdmin)
**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 245,
      "admins": 5,
      "blocked": 12
    },
    "products": {
      "total": 156
    },
    "orders": {
      "total": 1234,
      "byStatus": [
        {"_id": "pending", "count": 45},
        {"_id": "shipped", "count": 134},
        {"_id": "delivered", "count": 1055}
      ],
      "topProducts": [...]
    },
    "revenue": {
      "total": "32567.89"
    },
    "inventory": {
      "totalStock": 5234,
      "lowStockItems": 8,
      "lowStockProducts": [...]
    }
  }
}
```

### GET /api/admin/users
**Auth:** Required (Admin/SuperAdmin)
**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (optional: 'user', 'admin', 'superadmin')
- `isBlocked` (optional: 'true', 'false')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isBlocked": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalUsers": 245,
    "totalPages": 13
  }
}
```

### POST /api/admin/users/create-admin
**Auth:** Required (SuperAdmin only)
**Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "SecurePassword123"
}
```

---

## 🚀 Deployment

### Production Build
```bash
cd frontend
npm run build
```

### Environment Variables (Production)
```env
VITE_API_URL=https://api.yourdomain.com
```

### Deploy
```bash
# The 'dist' folder contains production-ready files
# Upload to your hosting service
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Axios](https://axios-http.com)

---

## ✅ Feature Checklist

- [x] Admin login page
- [x] Protected admin routes
- [x] Dashboard with real-time analytics
- [x] User management interface
- [x] Block/Unblock users
- [x] Role management
- [x] Create admin accounts
- [x] Responsive design
- [x] Error handling
- [x] Success notifications
- [x] Pagination
- [x] Filtering

---

## 🔄 Future Enhancements

- [ ] Product management (CRUD)
- [ ] Order management and fulfillment
- [ ] Revenue charts and graphs
- [ ] Email notifications
- [ ] Admin activity logs
- [ ] Advanced search
- [ ] Discount management
- [ ] Coupon system
- [ ] Customer reviews management
- [ ] Inventory alerts
- [ ] Dashboard export (PDF/CSV)
- [ ] Two-factor authentication

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Check backend server logs
5. Verify environment variables
