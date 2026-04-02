# NestJS API - Reviews, Replies & Real-Time Notifications

Extended backend for the Ecommerce Tea project built with NestJS, Mongoose, and Socket.IO.

## Features

- ✅ **Reviews & Replies**: Add and manage product reviews with nested replies
- ✅ **Real-Time Notifications**: Socket.IO integration for instant updates
- ✅ **MongoDB Integration**: Shared database with Express backend
- ✅ **JWT Authentication**: Secure endpoints with JWT tokens
- ✅ **Admin Moderation**: Delete/flag reviews and replies
- ✅ **User Notifications**: Broadcast and direct notifications

## Setup

### 1. Install Dependencies
```bash
cd nestjs-api
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Update `.env`:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ecommerce-tea
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
```

### 3. Start NestJS Server
```bash
npm run start:dev
```

Server runs on: `http://localhost:5001`

## Project Structure

```
src/
├── reviews/          # Reviews & Replies modules
│   ├── schemas/      # Mongoose schemas
│   ├── services/     # Business logic
│   ├── controllers/  # HTTP endpoints
│   └── dtos/         # Data validation
├── notifications/    # WebSocket notifications
│   ├── gateway/      # Socket.IO gateway
│   └── service/      # Notification logic
├── common/           # Shared utilities & guards
└── app.module.ts     # Root module
```

## API Endpoints

### Reviews

#### Create Review
```
POST /api/reviews
Headers: Authorization: Bearer {token}
Body: {
  "productId": "...",
  "title": "Great tea!",
  "content": "...",
  "rating": 5
}
```

#### Get Product Reviews
```
GET /api/reviews/product/:productId?page=1&limit=10
```

#### Update Review
```
PUT /api/reviews/:reviewId
Headers: Authorization: Bearer {token}
```

#### Delete Review (User or Admin)
```
DELETE /api/reviews/:reviewId
Headers: Authorization: Bearer {token}
```

### Replies

#### Add Reply
```
POST /api/reviews/:reviewId/replies
Headers: Authorization: Bearer {token}
Body: {
  "content": "Thanks for the review!",
  "isAdminReply": false
}
```

#### Get Review with Replies
```
GET /api/reviews/:reviewId
```

#### Delete Reply
```
DELETE /api/reviews/:reviewId/replies/:replyId
Headers: Authorization: Bearer {token}
```

## Real-Time Notifications (Socket.IO)

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001', {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

### Events

**Listen for new review notifications:**
```javascript
socket.on('review:new', (data) => {
  console.log('New review:', data);
});
```

**Listen for reply notifications:**
```javascript
socket.on('review:new-reply', (data) => {
  console.log('New reply to your review:', data);
});
```

**Listen for reviews on products you reviewed:**
```javascript
socket.on('product:update', (data) => {
  console.log('Product update:', data);
});
```

## Database Models

### Review
```javascript
{
  productId: ObjectId,
  userId: ObjectId,
  userName: String,
  title: String,
  content: String,
  rating: Number (1-5),
  isFlagged: Boolean,
  replies: [Reply],
  upvotes: Number,
  downvotes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Reply
```javascript
{
  reviewId: ObjectId,
  userId: ObjectId,
  userName: String,
  content: String,
  isAdminReply: Boolean,
  isFlagged: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Integration with React Frontend

### Example: Display Reviews with Real-Time Updates

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getProductReviews } from '../services/reviewApi';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Load initial reviews
    getProductReviews(productId).then(res => setReviews(res.data));

    // Connect to WebSocket
    const newSocket = io('http://localhost:5001', {
      auth: { token: localStorage.getItem('token') }
    });

    // Listen for new reviews
    newSocket.on('review:new', (review) => {
      if (review.productId === productId) {
        setReviews([review, ...reviews]);
      }
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [productId]);

  return (
    <div>
      {reviews.map(review => (
        <div key={review._id}>
          <h4>{review.title}</h4>
          <p>{review.content}</p>
          <span>Rating: {review.rating}/5</span>
        </div>
      ))}
    </div>
  );
}
```

## Running Both Backends

```bash
# Terminal 1: Express Backend (port 5000)
cd backend && npm run dev

# Terminal 2: NestJS Backend (port 5001)
cd nestjs-api && npm run start:dev

# Terminal 3: Frontend (port 5173)
cd frontend && npm run dev
```

## Notes

- Both backends share the **same MongoDB database**
- NestJS API integrates with existing User model for authentication
- Socket.IO messages are broadcasted across connected clients
- All endpoints require valid JWT authentication (except public review viewing)
