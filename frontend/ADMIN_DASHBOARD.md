# Admin Dashboard Setup

## Overview
The admin dashboard provides comprehensive management tools for the e-commerce tea platform. It includes analytics, user management, and administrative controls.

## Features

### 1. Dashboard (Analytics)
- **Overview Stats**: Total users, products, orders, and revenue
- **Order Analytics**: Orders by status distribution
- **Inventory Management**: Stock tracking and low-stock alerts
- **Top Selling Products**: Revenue and unit sales metrics
- **Low Stock Products**: Quick access to inventory replenishment needs

### 2. User Management
- **User List**: View all users with filtering options
- **Filter Options**:
  - By Role (User, Admin, Super Admin)
  - By Status (Active, Blocked)
- **User Actions**:
  - Block/Unblock users
  - Change user roles
  - Delete users
  - Create new admin accounts
- **Pagination**: Navigate through large user lists

## Backend API Integration

### Admin APIs Used

#### 1. Analytics
```
GET /api/admin/analytics
Authorization: Bearer {token}
```
Returns comprehensive dashboard metrics including users, products, orders, revenue, and inventory data.

#### 2. User Management
```
GET /api/admin/users
Query Parameters:
  - page: Page number (default: 1)
  - limit: Items per page (default: 20)
  - role: Filter by role (user, admin, superadmin)
  - isBlocked: Filter by status (true, false)
```

```
PUT /api/admin/users/:userId/block
PUT /api/admin/users/:userId/unblock
PUT /api/admin/users/:userId/role
Request Body: { role: 'admin' | 'user' }
```

```
POST /api/admin/users/create-admin
Request Body:
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

```
DELETE /api/admin/users/:userId
```

## Accessing the Admin Dashboard

### Login
1. Navigate to `http://localhost:5173/login`
2. Enter your admin email and password
3. Click "Sign In"

**Note**: Only users with `admin` or `superadmin` role can access the admin dashboard.

### Admin Routes
- **Dashboard**: `/admin`
- **User Management**: `/admin/users`

## Authentication Flow

### Token Storage
- JWT token is stored in `localStorage` after login
- Token is automatically attached to all admin API requests
- Token expires based on backend configuration

### Protected Routes
- Admin routes are protected by `AdminProtectedRoute` component
- Unauthorized users are redirected to login page
- User role is validated before granting access

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Features Implementation

### Frontend Services
- **adminApi.js**: Admin-specific API calls with token management
- **api.js**: Authentication API calls (login, signup, logout)

### Components
- **AdminLayout.jsx**: Sidebar navigation and main layout
- **AdminDashboard.jsx**: Analytics and overview dashboard
- **UserManagement.jsx**: User CRUD operations
- **AdminProtectedRoute.jsx**: Route protection middleware
- **LoginPage.jsx**: Admin login interface

### Data Flow
1. User logs in with credentials
2. Backend validates and returns JWT token + user info
3. Token stored in localStorage
4. Admin can access dashboard
5. All requests include Authorization header with token
6. Dashboard automatically fetches analytics data
7. User filters and actions update state in real-time

## Key Features

### Real-time Updates
- Analytics dashboard auto-refreshes on user actions
- User list updates after create/update/delete operations

### Error Handling
- User-friendly error messages
- Toast notifications for success/failure
- Validation before API calls

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS for styling
- Icons from lucide-react
- Loading states and spinners
- Pagination for large datasets

### Security
- Protected routes with role-based access
- Token-based authentication
- XSS prevention with proper data handling
- Input validation before submission

## Troubleshooting

### Dashboard not loading
- Verify token is valid: `localStorage.getItem('token')`
- Check browser console for API errors
- Ensure backend is running on `http://localhost:5000`

### Users can't access admin panel
- Verify user role is 'admin' or 'superadmin'
- Check token expiration
- Clear localStorage and login again

### API requests returning 401
- Token may be expired, login again
- Verify token is being sent in Authorization header
- Check backend JWT secret matches

## Future Enhancements

- Product management (add/edit/delete)
- Order management and fulfillment
- Financial reports and graphs
- Customer reviews management
- Discount and coupon management
- Email notifications
- Admin activity logs
- Advanced search and filters
