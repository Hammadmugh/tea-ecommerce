# NestJS API for Ecommerce Tea
## Reviews, Replies & Real-Time Notifications

> **Status**: ✅ Ready to install and run

---

## 📁 Project Structure

```
nestjs-api/
├── src/
│   ├── auth/                    # JWT authentication & strategies
│   │   ├── guards/              # JWT auth guard
│   │   ├── strategies/          # Passport JWT strategy
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── reviews/                 # Reviews & Replies
│   │   ├── schemas/             # Mongoose Review schema
│   │   ├── services/            # ReviewsService (CRUD)
│   │   ├── controllers/         # Review endpoints
│   │   ├── dtos/                # Data validation DTOs
│   │   └── reviews.module.ts
│   ├── notifications/           # Socket.IO real-time
│   │   ├── notifications.gateway.ts   # WebSocket gateway
│   │   ├── notifications.service.ts   # User connection tracking
│   │   └── notifications.module.ts
│   ├── app.module.ts            # Root module with all imports
│   └── main.ts                  # Application bootstrap
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1️⃣ Install Dependencies
```bash
cd nestjs-api
npm install
```

### 2️⃣ Setup Environment Variables
```bash
cp .env.example .env
```

**Update `.env`:**
```
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce-tea
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
```

### 3️⃣ Start Development Server
```bash
npm run start:dev
```

✅ Server runs on `http://localhost:5001`

---

## 📡 API Endpoints

### **Reviews**

#### Create Review
```http
POST /api/reviews
Authorization: Bearer {token}

{
  "productId": "507f1f77bcf86cd799439011",
  "title": "Amazing Tea!",
  "content": "This tea is absolutely wonderful...",
  "rating": 5
}
```

#### Get Product Reviews (Paginated)
```http
GET /api/reviews/product/:productId?page=1&limit=10
```

#### Get Single Review with Replies
```http
GET /api/reviews/:reviewId
```

#### Update Review (Owner only)
```http
PUT /api/reviews/:reviewId
Authorization: Bearer {token}

{
  "title": "Updated title",
  "content": "Updated content",
  "rating": 4
}
```

#### Delete Review (Owner or Admin)
```http
DELETE /api/reviews/:reviewId
Authorization: Bearer {token}
```

#### Get User's Reviews
```http
GET /api/reviews/user/profile?page=1&limit=10
Authorization: Bearer {token}
```

#### Get Product Average Rating
```http
GET /api/reviews/rating/:productId
```

---

### **Replies**

#### Add Reply to Review
```http
POST /api/reviews/:reviewId/replies
Authorization: Bearer {token}

{
  "content": "Thanks for the review!",
  "isAdminReply": false
}
```

#### Update Reply (Owner or Admin)
```http
PUT /api/reviews/:reviewId/replies/:replyId
Authorization: Bearer {token}

{
  "content": "Updated reply content"
}
```

#### Delete Reply (Owner or Admin)
```http
DELETE /api/reviews/:reviewId/replies/:replyId
Authorization: Bearer {token}
```

---

## 🔌 WebSocket Events (Socket.IO)

### **Connection**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: {
    token: localStorage.getItem('token')
  }
});

socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

### **Listen Events**

**New Review Posted**
```javascript
socket.on('review:new', (data) => {
  console.log('New review:', data);
  // { reviewId, productId, data, timestamp }
});
```

**Reply Added to Your Review**
```javascript
socket.on('review:new-reply', (data) => {
  console.log('Someone replied to your review:', data);
  // { reviewId, replyId, data, timestamp }
});
```

**Your Review Was Flagged**
```javascript
socket.on('review:flagged', (data) => {
  console.log('Your review was flagged:', data);
  // { reviewId, data, timestamp }
});
```

**Product Update (Price/Stock)**
```javascript
socket.on('product:update', (data) => {
  console.log('Product updated:', data);
  // { productId, data, timestamp }
});
```

---

## 🔐 Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is obtained from **Express backend** login endpoint and includes:
- `id`: User ID
- `email`: User email
- `name`: User name
- `role`: User role (user/admin/superadmin)

---

## 🗄️ Database Schema

### Review Model
```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  userId: ObjectId (ref: User),
  userName: String,
  userEmail: String,
  title: String,
  content: String,
  rating: Number (1-5),
  replies: [Reply],
  upvotes: Number,
  downvotes: Number,
  isFlagged: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Reply Model (Embedded)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  userName: String,
  userEmail: String,
  content: String,
  isAdminReply: Boolean,
  isFlagged: Boolean,
  upvotes: Number,
  downvotes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📚 React Integration Example

### Display Reviews with Real-Time Updates

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getProductReviews, createReview } from '../services/reviewApi';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial reviews
  useEffect(() => {
    loadReviews();
  }, [productId]);

  // Connect to WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5001', {
      auth: { token }
    });

    newSocket.on('review:new', (newReview) => {
      if (newReview.productId === productId) {
        setReviews(prev => [newReview.data, ...prev]);
      }
    });

    newSocket.on('review:new-reply', (notification) => {
      // Update specific review with new reply
      setReviews(prev =>
        prev.map(r =>
          r._id === notification.reviewId
            ? { ...r, replies: [...(r.replies || []), notification.data] }
            : r
        )
      );
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await getProductReviews(productId);
      setReviews(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (title, content, rating) => {
    await createReview({ productId, title, content, rating });
    loadReviews(); // Will also trigger via WebSocket
  };

  return (
    <div className="reviews-container">
      <h2>Product Reviews ({reviews.length})</h2>
      
      {/* Add review form */}
      <ReviewForm onSubmit={handleAddReview} />

      {/* Reviews list */}
      <div className="reviews-list">
        {reviews.map(review => (
          <ReviewCard key={review._id} review={review} socket={socket} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🛠️ Running All Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Express Backend (port 5000)
cd backend && npm run dev

# Terminal 3: NestJS Backend (port 5001)
cd nestjs-api && npm run start:dev

# Terminal 4: React Frontend (port 5173)
cd frontend && npm run dev
```

---

## 📝 Notes

- ✅ **Shared Database**: Both Express and NestJS use the same MongoDB instance
- ✅ **Seamless Integration**: Reviews API consumes Express User model via MongoDB relationships
- ✅ **Real-Time**: Socket.IO broadcasts reviews to all connected clients instantly
- ✅ **Modular**: Clean separation of concerns (Schemas, Services, Controllers, DTOs)
- ✅ **Type-Safe**: Full TypeScript support with class validators

---

## 🐛 Troubleshooting

### Port 5001 already in use?
```bash
lsof -i :5001
kill -9 <PID>
```

### MongoDB connection failed?
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify database exists: `mongo ecommerce-tea`

### Socket.IO connection fails?
- Check CORS_ORIGIN in `.env` includes client URL
- Verify token is valid before connecting
- Check browser console for auth errors

---

## 📄 License

MIT - Tea Ecommerce Project
